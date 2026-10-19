/**
 * MongoDB Database Initialization & Schema Setup
 * Creates collections, indexes, and seeds initial data if needed
 */

import { Db, Collection } from 'mongodb';
import {
  COLLECTION_NAMES,
  QuestionValidationSchema,
  AssessmentValidationSchema,
  CSORosterValidationSchema,
  SubmissionValidationSchema
} from './schemas';
import { SEED_QUESTIONS, SEED_ASSESSMENTS, SEED_ROSTERS } from './seedData';

export interface DBCollections {
  questions: Collection;
  assessments: Collection;
  rosters: Collection;
  submissions: Collection;
}

/**
 * Initialize all MongoDB collections with schema validation and indexes
 */
export async function initializeCollections(db: Db): Promise<DBCollections> {
  console.log('[MongoDB] Initializing collections...');

  // ==================== QUESTIONS COLLECTION ====================
  await initializeQuestions(db);

  // ==================== ASSESSMENTS COLLECTION ====================
  await initializeAssessments(db);

  // ==================== ROSTERS COLLECTION ====================
  await initializeRosters(db);

  // ==================== SUBMISSIONS COLLECTION ====================
  await initializeSubmissions(db);

  // Get collection references
  const questions = db.collection(COLLECTION_NAMES.QUESTIONS);
  const assessments = db.collection(COLLECTION_NAMES.ASSESSMENTS);
  const rosters = db.collection(COLLECTION_NAMES.ROSTERS);
  const submissions = db.collection(COLLECTION_NAMES.SUBMISSIONS);

  console.log('[MongoDB] All collections initialized successfully');

  return { questions, assessments, rosters, submissions };
}

/**
 * Initialize Questions Collection
 */
async function initializeQuestions(db: Db): Promise<void> {
  const collectionName = COLLECTION_NAMES.QUESTIONS;

  try {
    // Check if collection exists
    const collections = await db.listCollections().toArray();
    const exists = collections.some((c) => c.name === collectionName);

    if (!exists) {
      console.log(`[MongoDB] Creating collection: ${collectionName}`);
      await db.createCollection(collectionName, {
        validator: { $jsonSchema: QuestionValidationSchema }
      });
    } else {
      console.log(`[MongoDB] Collection exists: ${collectionName}`);
    }

    // Create/update validator
    try {
      await db.command({
        collMod: collectionName,
        validator: { $jsonSchema: QuestionValidationSchema }
      });
      console.log(`[MongoDB] Schema validation applied: ${collectionName}`);
    } catch (err: any) {
      // Validator might already exist, which is fine
      if (!err.message.includes('validator')) {
        console.warn(`[MongoDB] Warning updating validator for ${collectionName}:`, err.message);
      }
    }

    // Create indexes
    const collection = db.collection(collectionName);
    try {
      await collection.createIndex({ id: 1 }, { unique: true });
      await collection.createIndex({ sequence: 1 });
      await collection.createIndex({ isActive: 1 });
      await collection.createIndex({ categoryEn: 1 });
      console.log(`[MongoDB] Indexes created for ${collectionName}`);
    } catch (err: any) {
      if (err.code === 86) {
        console.log(`[MongoDB] Indexes already exist for ${collectionName}`);
      } else {
        throw err;
      }
    }

    // Seed initial data if empty
    const count = await collection.countDocuments();
    if (count === 0) {
      console.log(`[MongoDB] Seeding initial questions...`);
      await collection.insertMany(SEED_QUESTIONS as any);
      console.log(`[MongoDB] Inserted ${SEED_QUESTIONS.length} default questions`);
    }
  } catch (err: any) {
    console.error(`[MongoDB] Error initializing ${collectionName}:`, err.message);
    throw err;
  }
}

/**
 * Initialize Assessments Collection
 */
async function initializeAssessments(db: Db): Promise<void> {
  const collectionName = COLLECTION_NAMES.ASSESSMENTS;

  try {
    // Check if collection exists
    const collections = await db.listCollections().toArray();
    const exists = collections.some((c) => c.name === collectionName);

    if (!exists) {
      console.log(`[MongoDB] Creating collection: ${collectionName}`);
      await db.createCollection(collectionName, {
        validator: { $jsonSchema: AssessmentValidationSchema }
      });
    } else {
      console.log(`[MongoDB] Collection exists: ${collectionName}`);
    }

    // Create/update validator
    try {
      await db.command({
        collMod: collectionName,
        validator: { $jsonSchema: AssessmentValidationSchema }
      });
      console.log(`[MongoDB] Schema validation applied: ${collectionName}`);
    } catch (err: any) {
      if (!err.message.includes('validator')) {
        console.warn(`[MongoDB] Warning updating validator for ${collectionName}:`, err.message);
      }
    }

    // Create indexes
    const collection = db.collection(collectionName);
    try {
      await collection.createIndex({ id: 1 }, { unique: true });
      await collection.createIndex({ type: 1 });
      await collection.createIndex({ isActive: 1 });
      console.log(`[MongoDB] Indexes created for ${collectionName}`);
    } catch (err: any) {
      if (err.code === 86) {
        console.log(`[MongoDB] Indexes already exist for ${collectionName}`);
      } else {
        throw err;
      }
    }

    // Seed initial data if empty
    const count = await collection.countDocuments();
    if (count === 0) {
      console.log(`[MongoDB] Seeding initial assessments...`);
      await collection.insertMany(SEED_ASSESSMENTS as any);
      console.log(`[MongoDB] Inserted ${SEED_ASSESSMENTS.length} default assessments`);
    }
  } catch (err: any) {
    console.error(`[MongoDB] Error initializing ${collectionName}:`, err.message);
    throw err;
  }
}

/**
 * Initialize Rosters (CSOs) Collection
 */
async function initializeRosters(db: Db): Promise<void> {
  const collectionName = COLLECTION_NAMES.ROSTERS;

  try {
    // Check if collection exists
    const collections = await db.listCollections().toArray();
    const exists = collections.some((c) => c.name === collectionName);

    if (!exists) {
      console.log(`[MongoDB] Creating collection: ${collectionName}`);
      await db.createCollection(collectionName, {
        validator: { $jsonSchema: CSORosterValidationSchema }
      });
    } else {
      console.log(`[MongoDB] Collection exists: ${collectionName}`);
    }

    // Create/update validator
    try {
      await db.command({
        collMod: collectionName,
        validator: { $jsonSchema: CSORosterValidationSchema }
      });
      console.log(`[MongoDB] Schema validation applied: ${collectionName}`);
    } catch (err: any) {
      if (!err.message.includes('validator')) {
        console.warn(`[MongoDB] Warning updating validator for ${collectionName}:`, err.message);
      }
    }

    // Create indexes - wrap each in try-catch to handle conflicts
    const collection = db.collection(collectionName);
    
    try {
      await collection.createIndex({ id: 1 }, { unique: true });
    } catch (err: any) {
      if (err.code !== 86) { // 86 = IndexKeySpecsConflict
        throw err;
      }
      console.log(`[MongoDB] Index 'id' already exists`);
    }
    
    try {
      await collection.createIndex({ registeredMobile: 1 }, { unique: true });
    } catch (err: any) {
      if (err.code === 86) {
        // IndexKeySpecsConflict - means index exists but with different properties
        // Try to drop and recreate
        try {
          await collection.dropIndex('registeredMobile_1');
          await collection.createIndex({ registeredMobile: 1 }, { unique: true });
          console.log(`[MongoDB] Recreated unique index for registeredMobile`);
        } catch (dropErr: any) {
          console.log(`[MongoDB] Index 'registeredMobile' already exists (unique)`);
        }
      } else {
        throw err;
      }
    }
    
    try {
      await collection.createIndex({ mobile: 1 });
    } catch (err: any) {
      if (err.code !== 86) {
        throw err;
      }
    }
    
    try {
      await collection.createIndex({ districtName: 1 });
    } catch (err: any) {
      if (err.code !== 86) {
        throw err;
      }
    }
    
    console.log(`[MongoDB] Indexes setup for ${collectionName}`);

    // Optional: Seed sample CSO data (commented out - enable if needed)
    // const count = await collection.countDocuments();
    // if (count === 0) {
    //   console.log(`[MongoDB] Seeding sample CSO rosters...`);
    //   await collection.insertMany(SEED_ROSTERS);
    //   console.log(`[MongoDB] Inserted ${SEED_ROSTERS.length} sample CSOs`);
    // }
  } catch (err: any) {
    console.error(`[MongoDB] Error initializing ${collectionName}:`, err.message);
    throw err;
  }
}

/**
 * Initialize Submissions Collection
 */
async function initializeSubmissions(db: Db): Promise<void> {
  const collectionName = COLLECTION_NAMES.SUBMISSIONS;

  try {
    // Check if collection exists
    const collections = await db.listCollections().toArray();
    const exists = collections.some((c) => c.name === collectionName);

    if (!exists) {
      console.log(`[MongoDB] Creating collection: ${collectionName}`);
      await db.createCollection(collectionName, {
        validator: { $jsonSchema: SubmissionValidationSchema },
        validationAction: 'warn'  // warn only, never block submission
      });
    } else {
      console.log(`[MongoDB] Collection exists: ${collectionName}`);
    }

    // Create/update validator
    try {
      await db.command({
        collMod: collectionName,
        validator: { $jsonSchema: SubmissionValidationSchema },
        validationAction: 'warn'  // warn only, never block submission
      });
      console.log(`[MongoDB] Schema validation applied: ${collectionName}`);
    } catch (err: any) {
      if (!err.message.includes('validator')) {
        console.warn(`[MongoDB] Warning updating validator for ${collectionName}:`, err.message);
      }
    }

    // Create indexes for fast lookups
    const collection = db.collection(collectionName);
    try {
      await collection.createIndex({ mobileNumber: 1 });
      await collection.createIndex({ assessmentId: 1 });
      await collection.createIndex({ mobileNumber: 1, assessmentId: 1 }, { unique: true });
      await collection.createIndex({ status: 1 });
      await collection.createIndex({ submittedAt: -1 });
      console.log(`[MongoDB] Indexes created for ${collectionName}`);
    } catch (err: any) {
      if (err.code === 86) {
        console.log(`[MongoDB] Indexes already exist for ${collectionName}`);
      } else {
        throw err;
      }
    }
  } catch (err: any) {
    console.error(`[MongoDB] Error initializing ${collectionName}:`, err.message);
    throw err;
  }
}

/**
 * Drop all collections (for testing/reset)
 */
export async function dropAllCollections(db: Db): Promise<void> {
  try {
    for (const collName of Object.values(COLLECTION_NAMES)) {
      try {
        await db.collection(collName).drop();
        console.log(`[MongoDB] Dropped collection: ${collName}`);
      } catch (err: any) {
        if (!err.message.includes('ns not found')) {
          throw err;
        }
      }
    }
  } catch (err: any) {
    console.error('[MongoDB] Error dropping collections:', err.message);
    throw err;
  }
}

/**
 * Get collection statistics
 */
export async function getDBStats(db: Db): Promise<Record<string, number>> {
  const stats: Record<string, number> = {};

  for (const [key, collName] of Object.entries(COLLECTION_NAMES)) {
    const count = await db.collection(collName).countDocuments();
    stats[collName] = count;
  }

  return stats;
}
