import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { MongoClient, Db, Collection } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { initializeCollections } from './src/db/initializeDB';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://danishfzeetechz_db_user:2rNKXDkyxzjXA71x@cluster0.zbz3sjp.mongodb.net/cso_portal?retryWrites=true&w=majority';
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'cso_portal';

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Enable CORS for mobile devices and iframe communication
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// MongoDB Connection & Collections
let mongoClient: MongoClient;
let db: Db;
let rosters: Collection;
let questions: Collection;
let assessments: Collection;
let submissions: Collection;

// Initialize MongoDB connection with schema validation
async function initializeMongoDB(): Promise<void> {
  try {
    console.log('[MongoDB] Connecting to database...');
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    db = mongoClient.db(MONGO_DB_NAME);
    
    console.log(`[MongoDB] Connected to ${MONGO_DB_NAME}`);

    // Initialize collections with schemas and indexes
    const collections = await initializeCollections(db);
    rosters = collections.rosters;
    questions = collections.questions;
    assessments = collections.assessments;
    submissions = collections.submissions;
    
    // Log collection stats
    const rosterCount = await rosters.countDocuments();
    const questionCount = await questions.countDocuments();
    const assessmentCount = await assessments.countDocuments();
    const submissionCount = await submissions.countDocuments();
    
    console.log(`[DB] ✅ Database Ready:`);
    console.log(`    • ${rosterCount} CSOs (Centres)`);
    console.log(`    • ${questionCount} Questions`);
    console.log(`    • ${assessmentCount} Assessments`);
    console.log(`    • ${submissionCount} Submissions`);
  } catch (err) {
    console.error('[MongoDB] Connection error:', err);
    process.exit(1);
  }
}

function cleanMobile(mob: any): string {
  if (!mob) return '';
  return String(mob).replace(/\D/g, '').slice(-10);
}

// ================= API ROUTES =================

// Health check
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const rosterCount = await rosters.countDocuments();
    const questionCount = await questions.countDocuments();
    const submissionCount = await submissions.countDocuments();
    
    res.json({
      status: 'ok',
      serverTime: new Date().toISOString(),
      totalCSOs: rosterCount,
      totalQuestions: questionCount,
      totalSubmissions: submissionCount,
      database: 'MongoDB',
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Full state sync for Admin and CSOs
app.get('/api/state', async (_req: Request, res: Response) => {
  try {
    const roster = await rosters.find({}).toArray();
    const allQuestions = await questions.find({}).toArray();
    const allAssessments = await assessments.find({}).toArray();
    const allSubmissions = await submissions.find({}).toArray();

    // Populate questions for each assessment (join operation)
    const assessmentsWithQuestions = allAssessments.map((assessment: any) => {
      if (assessment.questionIds && assessment.questionIds.length > 0) {
        const populatedQuestions = assessment.questionIds
          .map((qId: string) => allQuestions.find((q: any) => q.id === qId))
          .filter((q: any) => q !== undefined);
        return {
          ...assessment,
          questions: populatedQuestions
        };
      }
      return { ...assessment, questions: [] };
    });

    res.json({
      success: true,
      roster,
      questions: allQuestions,
      assessments: assessmentsWithQuestions,
      submissions: Object.fromEntries(
        allSubmissions.map((sub) => [
          sub.mobileNumber || `${sub.mobileNumber}_${sub.assessmentId}`,
          sub
        ])
      ),
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Look up CSO by 10-digit mobile number
app.get('/api/cso/lookup/:mobile', async (req: Request, res: Response) => {
  try {
    const reqMob = cleanMobile(req.params.mobile);
    if (!reqMob || reqMob.length !== 10) {
      return res.status(400).json({ success: false, error: 'Invalid 10-digit mobile number' });
    }

    const cso = await rosters.findOne({
      $or: [
        { registeredMobile: { $regex: reqMob, $options: 'i' } },
        { mobile: { $regex: reqMob, $options: 'i' } }
      ]
    });

    if (!cso) {
      return res.status(404).json({
        success: false,
        error: 'Is Mobile Number se koi Centre registered nahi mila. Kripya Admin se sampark karein.',
      });
    }

    const submission = await submissions.findOne({
      mobileNumber: reqMob
    });

    const activeQuestions = await questions.find({ isActive: true }).toArray();

    return res.json({
      success: true,
      cso,
      submission: submission || null,
      activeQuestions,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save or Replace CSO Roster (from Excel or manual Add)
app.post('/api/roster', async (req: Request, res: Response) => {
  try {
    const { roster, mode } = req.body;
    if (!Array.isArray(roster)) {
      return res.status(400).json({ success: false, error: 'Roster must be an array' });
    }

    let upsertedCount = 0;

    if (mode === 'append') {
      // Upsert each CSO (update if mobile exists, insert if not)
      for (const c of roster) {
        const mob = cleanMobile(c.registeredMobile || c.mobile);
        if (!mob) continue;
        const { _id, ...cDoc } = c as any;
        await rosters.updateOne(
          { $or: [{ registeredMobile: mob }, { mobile: mob }] },
          { $set: cDoc },
          { upsert: true }
        );
        upsertedCount++;
      }
    } else {
      // Replace mode: delete all then upsert new ones
      await rosters.deleteMany({});
      for (const c of roster) {
        const mob = cleanMobile(c.registeredMobile || c.mobile);
        if (!mob) continue;
        const { _id, ...cDoc } = c as any;
        await rosters.updateOne(
          { $or: [{ registeredMobile: mob }, { mobile: mob }] },
          { $set: cDoc },
          { upsert: true }
        );
        upsertedCount++;
      }
    }

    const count = await rosters.countDocuments();
    return res.json({ success: true, count, upsertedCount });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Add or edit a single CSO
app.post('/api/cso', async (req: Request, res: Response) => {
  try {
    const cso = req.body;
    const mob = cleanMobile(cso.registeredMobile || cso.mobile);
    if (!mob || mob.length !== 10) {
      return res.status(400).json({ success: false, error: 'Valid 10-digit mobile number required' });
    }

    const existingCSO = await rosters.findOne({
      $or: [
        { registeredMobile: { $regex: mob, $options: 'i' } },
        { mobile: { $regex: mob, $options: 'i' } }
      ]
    });

    if (existingCSO) {
      // Update
      await rosters.updateOne(
        { _id: existingCSO._id },
        { $set: cso }
      );
    } else {
      // Insert new
      await rosters.insertOne(cso);
    }

    return res.json({ success: true, cso });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a CSO
app.delete('/api/cso/:mobile', async (req: Request, res: Response) => {
  try {
    const mob = cleanMobile(req.params.mobile);
    
    await rosters.deleteOne({
      $or: [
        { registeredMobile: { $regex: mob, $options: 'i' } },
        { mobile: { $regex: mob, $options: 'i' } }
      ]
    });
    
    await submissions.deleteMany({ mobileNumber: mob });
    
    const count = await rosters.countDocuments();
    return res.json({ success: true, count });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Clear roster
app.post('/api/roster/clear', async (_req: Request, res: Response) => {
  try {
    await rosters.deleteMany({});
    await submissions.deleteMany({});
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Survey Questions API
app.get('/api/questions', async (_req: Request, res: Response) => {
  try {
    const allQuestions = await questions.find({}).toArray();
    const activeQuestions = await questions.find({ isActive: true }).toArray();
    
    res.json({
      success: true,
      questions: allQuestions,
      activeQuestions,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/questions', async (req: Request, res: Response) => {
  try {
    const { questions: newQuestions } = req.body;
    if (!Array.isArray(newQuestions)) {
      return res.status(400).json({ success: false, error: 'Questions must be an array' });
    }
    
    // ✅ UPSERT each question (update if exists, insert if not)
    // This preserves existing data and doesn't lose anything on validation error
    let upsertedCount = 0;
    
    for (const q of newQuestions) {
      if (!q.id) {
        return res.status(400).json({ 
          success: false, 
          error: 'Each question must have an id field' 
        });
      }
      
      const { _id, ...qDoc } = q as any;
      const result = await questions.updateOne(
        { id: q.id },
        { $set: qDoc },
        { upsert: true }
      );
      
      if (result.upsertedId || result.modifiedCount > 0) {
        upsertedCount++;
      }
    }
    
    const count = await questions.countDocuments();
    return res.json({ 
      success: true, 
      count,
      upsertedCount,
      message: `${upsertedCount} questions upserted, total: ${count}`
    });
  } catch (err: any) {
    console.error('[API] POST /api/questions error:', err.message);
    return res.status(500).json({ 
      success: false, 
      error: err.message,
      note: '❌ Data preserved - existing questions intact'
    });
  }
});

// Assessments API (Mock Day, Exam Day, Dry Run, etc.)
app.get('/api/assessments', async (_req: Request, res: Response) => {
  try {
    const allAssessments = await assessments.find({}).toArray();
    const allQuestions = await questions.find({}).toArray();

    // Populate questions for each assessment (join by questionIds)
    const assessmentsWithQuestions = allAssessments.map((assessment: any) => {
      const populated = (assessment.questionIds || [])
        .map((qId: string) => allQuestions.find((q: any) => q.id === qId))
        .filter((q: any) => q !== undefined);

      return { ...assessment, questions: populated };
    });

    res.json({
      success: true,
      assessments: assessmentsWithQuestions,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/assessments', async (req: Request, res: Response) => {
  try {
    const { assessments: newAssessments } = req.body;
    if (!Array.isArray(newAssessments)) {
      return res.status(400).json({ success: false, error: 'Assessments must be an array' });
    }

    let upsertedCount = 0;
    let questionsUpserted = 0;

    for (const a of newAssessments) {
      if (!a.id) {
        return res.status(400).json({ success: false, error: 'Each assessment must have an id field' });
      }

      // ── Step 1: Extract questionIds (from either field) ──
      let questionIds: string[] = [];
      if (Array.isArray(a.questionIds) && a.questionIds.length > 0) {
        questionIds = a.questionIds;
      } else if (Array.isArray(a.questions) && a.questions.length > 0) {
        questionIds = a.questions.map((q: any) => q.id).filter(Boolean);
      }

      // ── Step 2: Upsert embedded questions into questions collection ──
      if (Array.isArray(a.questions) && a.questions.length > 0) {
        for (const q of a.questions) {
          if (!q.id) continue;
          // Remove _id so MongoDB doesn't try to update the immutable field
          const { _id, ...qDoc } = q;
          await questions.updateOne(
            { id: q.id },
            { $set: { ...qDoc, updatedAt: new Date().toISOString() } },
            { upsert: true }
          );
          questionsUpserted++;
        }
      }

      // ── Step 3: Build clean assessment doc (no embedded questions array) ──
      const cleanAssessment = {
        id: a.id,
        title: a.title || 'Untitled Assessment',
        titleHi: a.titleHi || a.title || 'Untitled Assessment',
        type: a.type || 'custom',
        examName: a.examName || 'UPSSSC PET 2026',
        scheduledDate: a.scheduledDate || new Date().toISOString(),
        shifts: a.shifts || '',
        description: a.description || '',
        descriptionHi: a.descriptionHi || '',
        isActive: a.isActive !== undefined ? a.isActive : true,
        questionIds,
        createdAt: a.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // ── Step 4: Upsert assessment ──
      const { _id: _aId, ...cleanAssessmentDoc } = cleanAssessment as any;
      const result = await assessments.updateOne(
        { id: a.id },
        { $set: cleanAssessmentDoc },
        { upsert: true }
      );

      if (result.upsertedId || result.modifiedCount > 0) upsertedCount++;
    }

    const count = await assessments.countDocuments();
    return res.json({
      success: true,
      count,
      upsertedCount,
      questionsUpserted,
      message: `${upsertedCount} assessments upserted, ${questionsUpserted} questions synced, total: ${count}`
    });
  } catch (err: any) {
    console.error('[API] POST /api/assessments error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
      details: err.errmsg || 'Validation failed',
      note: '❌ Data preserved - existing assessments intact'
    });
  }
});

// CSO Live Survey Submission (Called from mobile phone when CSO taps Submit)
app.post('/api/survey/submit', async (req: Request, res: Response) => {
  try {
    const { mobileNumber, record, assessmentId } = req.body;
    const cleanMob = cleanMobile(mobileNumber || record?.csoProfile?.registeredMobile || record?.csoProfile?.mobile);

    if (!cleanMob || cleanMob.length !== 10) {
      return res.status(400).json({ success: false, error: 'A valid 10-digit mobile number is required' });
    }

    if (!record) {
      return res.status(400).json({ success: false, error: 'Survey record is missing' });
    }

    const assignedAssessmentId =
      assessmentId ||
      record.assessmentId ||
      record.submissionData?.assessmentId ||
      'assessment_mock_day';

    // Strip _id to avoid immutable field error on upsert
    const { _id, ...recordWithoutId } = record as any;

    // Build complete enriched record with all required schema fields
    const enrichedRecord = {
      ...recordWithoutId,
      mobileNumber: cleanMob,
      assessmentId: assignedAssessmentId,
      // Required schema fields - extract from csoProfile if not present
      csoName: record.csoName || record.csoProfile?.csoName || record.csoProfile?.name || `CSO (${cleanMob.slice(-4)})`,
      centreCode: record.centreCode || record.csoProfile?.centreCode || '',
      centreName: record.centreName || record.csoProfile?.dutyCentreName || record.csoProfile?.centreName || '',
      status: record.status || 'submitted',
      submittedAt: record.submittedAt || new Date().toISOString(),
      serverReceivedAt: new Date().toISOString(),
    };

    // Upsert: update if exists, insert if not
    await submissions.updateOne(
      { mobileNumber: cleanMob, assessmentId: assignedAssessmentId },
      { $set: enrichedRecord },
      { upsert: true }
    );

    console.log(`[SURVEY] ✅ Submission saved: Mobile ${cleanMob} | Assessment: ${assignedAssessmentId}`);

    return res.json({
      success: true,
      message: 'Survey submitted successfully and synced live to Admin Console',
      record: enrichedRecord,
    });
  } catch (err: any) {
    console.error('[SURVEY] Submission error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Submissions list
app.get('/api/surveys', async (_req: Request, res: Response) => {
  try {
    const allSubmissions = await submissions.find({}).toArray();
    
    return res.json({
      success: true,
      submissions: Object.fromEntries(
        allSubmissions.map((sub) => [
          sub.mobileNumber || `${sub.mobileNumber}_${sub.assessmentId}`,
          sub
        ])
      ),
      count: allSubmissions.length,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin complete reset
app.post('/api/reset-all', async (_req: Request, res: Response) => {
  try {
    await rosters.deleteMany({});
    await questions.deleteMany({});
    await assessments.deleteMany({});
    await submissions.deleteMany({});
    
    return res.json({ success: true, message: 'All portal data cleared successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ================= VITE DEV / STATIC PROD SERVING =================
async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      console.warn('[Server] Production build dist/ not found. Falling back to Vite middleware.');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    }
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SSSG SOLUTIONS Portal] Server running live at http://localhost:${PORT}`);
    console.log(`[MongoDB] Using database: ${MONGO_DB_NAME}`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[Server] Shutting down gracefully...');
  if (mongoClient) {
    await mongoClient.close();
    console.log('[MongoDB] Connection closed');
  }
  process.exit(0);
});

// Initialize and start
initializeMongoDB()
  .then(() => bootstrap())
  .catch((err) => {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  });
