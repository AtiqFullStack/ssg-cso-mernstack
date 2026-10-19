# 📊 MongoDB Schema Documentation

## Database Structure

Your CSO Portal uses **MongoDB** with 4 main collections:

```
cso_portal (Database)
├── questions (Collection) - Survey questions
├── assessments (Collection) - Test assessments
├── rosters (Collection) - CSO center data
└── submissions (Collection) - Survey responses
```

---

## 📝 QUESTIONS Collection

**Purpose:** Store survey questions used in assessments

**Schema:**

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  id: "q_infra_01",                 // Unique question ID (custom)
  sequence: 1,                       // Display order
  textEn: "Is seating...",          // English question text
  textHi: "क्या बैठक...",           // Hindi question text
  categoryEn: "Infrastructure",      // Category (English)
  categoryHi: "अवसंरचना",           // Category (Hindi)
  helperEn: "Single bench per...",  // Help text (English)
  helperHi: "प्रत्येक...",          // Help text (Hindi)
  optionsType: "YES_NO",             // "YES_NO", "TEXT", "MULTI_CHOICE"
  isActive: true,                    // Active/Inactive flag
  assessmentId: null,                // Optional: Link to specific assessment
  createdAt: "2026-10-19T...",      // ISO timestamp
  updatedAt: "2026-10-19T..."       // Last updated
}
```

**Indexes:**
- `id` (unique)
- `sequence`
- `isActive`
- `categoryEn`

**Sample Data Count:** 25+ default questions (seeded automatically)

**Current Questions:**
- Infrastructure & Seating (q_infra_*)
- Perimeter & Security (q_sec_*)
- CCTV Surveillance (q_cctv_*)
- Strong Room Custody (q_sr_*)
- Power Backup (q_pwr_*)
- Staff Briefing & SOP (q_sop_*)

---

## 🏆 ASSESSMENTS Collection

**Purpose:** Define different types of assessments (Mock Day, Exam Day, etc.)

**Schema:**

```javascript
{
  _id: ObjectId,
  id: "assessment_mock_day",        // Unique assessment ID
  title: "01. MOCK TEST DAY",       // Display title
  titleHi: "01. MOCK TEST DAY",     // Hindi title
  type: "mock_day",                  // "mock_day" | "exam_day" | "dry_run" | "shift_audit" | "custom"
  description: "Testing infrastructure...",    // Description
  descriptionHi: "...",              // Hindi description
  examName: "UPSSSC PET 2026",       // Exam name
  scheduledDate: "24 अक्टूबर 2026",  // When scheduled
  shifts: "Full Day Mock Drill",      // Shift info
  isActive: true,                    // Active/Inactive
  questions: [                        // Array of question objects
    {
      id: "q_infra_01",
      sequence: 1,
      textEn: "Is seating...",
      textHi: "क्या बैठक...",
      categoryEn: "Infrastructure",
      categoryHi: "अवसंरचना"
    },
    // ... more questions
  ],
  createdAt: "2026-10-19T...",
  updatedAt: "2026-10-19T..."
}
```

**Indexes:**
- `id` (unique)
- `type`
- `isActive`

**Sample Data:**
- `assessment_mock_day` - Mock test (5 questions)
- `assessment_exam_day` - Exam day (5 questions)
- `assessment_dry_run` - Dry run (8 questions)

---

## 👥 ROSTERS Collection

**Purpose:** Store CSO (Centre Survey Officer) and exam centre information

**Schema:**

```javascript
{
  _id: ObjectId,
  id: "cso_001",                     // Unique CSO ID
  
  // Core required fields
  districtName: "Lucknow",
  csoName: "राज कुमार सिंह",
  registeredMobile: "9876543210",    // UNIQUE - 10-digit login ID
  dutyCentreName: "DAV Sr. Sec. School",
  centreSeatingCapacity: 120,
  centreCode: "04201",
  
  // Additional fields
  name: "राज कुमार सिंह",
  mobile: "9876543210",
  district: "Lucknow",
  centreName: "DAV Sr. Sec. School, Aliganj",
  candidateCapacity: 120,
  tehsil: "Lucknow City",
  designation: "CSO",
  department: "Education",
  address: "Aliganj, Lucknow",
  totalRooms: 6,
  
  // Hierarchical staff contacts
  centreSuperintendent: {
    name: "प्रो. अजय शर्मा",
    mobile: "9876543211",
    institution: "DAV Sr. Sec. School"
  },
  staticMagistrate: {
    name: "श्री विजय कुमार",
    mobile: "9876543212",
    designation: "Additional District Magistrate"
  },
  nodalOfficer: {
    name: "डॉ. राजेश वर्मा",
    mobile: "9876543213",
    office: "UPSSSC, Lucknow"
  },
  
  createdAt: "2026-10-19T...",
  updatedAt: "2026-10-19T..."
}
```

**Indexes:**
- `id` (unique)
- `registeredMobile` (unique) ← Used for CSO login
- `mobile`
- `districtName`

**Sample Data:** 2 sample CSOs (optional - can be seeded on demand)

---

## 📤 SUBMISSIONS Collection

**Purpose:** Store survey submissions from CSOs

**Schema:**

```javascript
{
  _id: ObjectId,
  mobileNumber: "9876543210",        // CSO's mobile (10-digit)
  assessmentId: "assessment_mock_day",
  csoName: "राज कुमार सिंह",
  centreCode: "04201",
  centreName: "DAV Sr. Sec. School",
  
  // Survey responses
  questionResponses: {
    "q_infra_01": "YES",
    "q_infra_02": "NO",
    "q_cctv_01": "YES"
  },
  
  questionRemarks: {
    "q_infra_01": "Seating verified on 19 Oct",
    "q_cctv_01": "CCTV cameras tested successfully"
  },
  
  // Additional form data
  formData: {
    csoRemarks: "Centre is ready",
    overallReadiness: "fully_ready"
  },
  
  // Submission metadata
  status: "submitted",               // "draft" | "submitted" | "approved" | "escalated"
  submittedAt: "2026-10-19T10:30:00Z",
  serverReceivedAt: "2026-10-19T10:30:05Z",
  certificateId: "UPSSSC/PET-2026/MOCK/04201/3210",
  
  // Full submission details
  submissionData: {
    allQuestions: [...],             // All questions in assessment
    responses: {...},
    remarks: "All OK",
    submissionDateTime: "19 अक्टूबर 2026, 10:30 AM IST",
    submissionTimestampIso: "2026-10-19T10:30:00Z"
  },
  
  // GPS location (optional)
  gpsCoordinates: {
    latitude: 26.8467,
    longitude: 80.9462,
    accuracy: 15.5,
    timestamp: "2026-10-19T10:30:00Z"
  },
  
  createdAt: "2026-10-19T...",
  updatedAt: "2026-10-19T..."
}
```

**Indexes:**
- `mobileNumber` (for CSO lookup)
- `assessmentId` (for assessment tracking)
- `mobileNumber + assessmentId` (unique - ensures one submission per CSO per assessment)
- `status` (for filtering)
- `submittedAt` (for sorting by date)

**Typical Flow:**
1. CSO starts survey → `status: "draft"`
2. CSO submits → `status: "submitted"`
3. Admin approves → `status: "approved"`
4. If issues found → `status: "escalated"`

---

## 🔑 Data Relations

```
┌─────────────────────────────────────────┐
│  ASSESSMENTS Collection                 │
│  id: "assessment_mock_day"              │
│  questions: [ q_infra_01, q_cctv_01... ]│
└────────────────┬────────────────────────┘
                 │ references
                 ↓
┌─────────────────────────────────────────┐
│  QUESTIONS Collection                   │
│  id: "q_infra_01"                       │
│  textEn: "Is seating..."                │
└────────────────┬────────────────────────┘
                 │ used in
                 ↓
┌─────────────────────────────────────────┐
│  SUBMISSIONS Collection                 │
│  questionResponses: {q_infra_01: "YES"} │
│  assessmentId: "assessment_mock_day"    │
│  mobileNumber: "9876543210"             │
└────────────────┬────────────────────────┘
                 │ submitted by
                 ↓
┌─────────────────────────────────────────┐
│  ROSTERS Collection                     │
│  registeredMobile: "9876543210"         │
│  csoName: "राज कुमार सिंह"              │
└─────────────────────────────────────────┘
```

---

## 📌 Validation Rules

### Questions
- ✅ `id` must be unique
- ✅ `sequence` must be a positive integer
- ✅ `textEn` and `textHi` required
- ✅ `categoryEn` required
- ✅ `isActive` must be boolean

### Assessments
- ✅ `id` must be unique
- ✅ `title` required
- ✅ `type` must be valid (mock_day, exam_day, dry_run, shift_audit, custom)
- ✅ `questions` array required
- ✅ `isActive` must be boolean

### Rosters (CSOs)
- ✅ `id` must be unique
- ✅ `registeredMobile` must be unique & 10-digit pattern
- ✅ Core fields required: districtName, csoName, dutyCentreName, centreSeatingCapacity
- ✅ `centreSeatingCapacity` must be integer > 0

### Submissions
- ✅ `mobileNumber` + `assessmentId` must be unique combination
- ✅ `mobileNumber` must be 10-digit
- ✅ `status` must be valid
- ✅ `submittedAt` and `serverReceivedAt` required

---

## 🌱 Initial Data (Auto-Seeded)

When the app starts, it **automatically**:

1. **Creates all 4 collections** if they don't exist
2. **Sets up schema validation** for data integrity
3. **Creates indexes** for fast queries
4. **Seeds default data:**
   - ✅ 25 Default Questions (various categories)
   - ✅ 3 Default Assessments (Mock Day, Exam Day, Dry Run)
   - ⚠️ 2 Sample CSO Rosters (commented out - enable if needed)
   - ⚠️ 0 Initial Submissions (added via UI)

---

## 🔍 Common Queries

```javascript
// Find a question by ID
db.questions.findOne({ id: "q_infra_01" })

// Find all active questions
db.questions.find({ isActive: true })

// Find questions by category
db.questions.find({ categoryEn: "Infrastructure & Seating" })

// Find CSO by mobile number
db.rosters.findOne({ registeredMobile: "9876543210" })

// Find all submissions for a CSO
db.submissions.find({ mobileNumber: "9876543210" })

// Find submission for specific CSO + Assessment
db.submissions.findOne({ mobileNumber: "9876543210", assessmentId: "assessment_mock_day" })

// Find all pending submissions
db.submissions.find({ status: "submitted" })

// Count total CSOs
db.rosters.countDocuments()
```

---

## 🚀 Initialization Flow

```
Server Start
    ↓
MongoDB Connection
    ↓
initializeCollections()
    ↓
├─ Create/Validate Questions Collection
│  ├─ Create indexes
│  └─ Seed 25 questions (if empty)
│
├─ Create/Validate Assessments Collection
│  ├─ Create indexes
│  └─ Seed 3 assessments (if empty)
│
├─ Create/Validate Rosters Collection
│  └─ Create indexes
│
└─ Create/Validate Submissions Collection
   └─ Create indexes
    ↓
Server Ready ✅
```

---

## 📱 API Endpoints Using These Collections

| Endpoint | Method | Collection | Operation |
|----------|--------|-----------|-----------|
| `/api/questions` | GET | questions | List all |
| `/api/questions` | POST | questions | Update all |
| `/api/assessments` | GET | assessments | List all |
| `/api/assessments` | POST | assessments | Update all |
| `/api/cso/lookup/:mobile` | GET | rosters | Find by mobile |
| `/api/roster` | POST | rosters | Add/Replace |
| `/api/cso` | POST | rosters | Add/Edit single |
| `/api/cso/:mobile` | DELETE | rosters | Delete |
| `/api/survey/submit` | POST | submissions | Save response |
| `/api/surveys` | GET | submissions | List all |

---

## 🎯 Next Steps

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Verify data seeded:**
   - Check MongoDB Atlas `cso_portal` database
   - Confirm 25 questions in `questions` collection
   - Confirm 3 assessments in `assessments` collection

3. **Test with Admin Console:**
   - Upload CSO roster via Excel
   - Create/edit assessments
   - Verify rosters collection populated

---

## 📞 Troubleshooting

**Q: Collections not being created?**
- A: Check MongoDB connection. Enable debug logs in `initializeDB.ts`

**Q: Schema validation failing?**
- A: Ensure documents match schema. Use `collMod` command to update validator.

**Q: Questions/Assessments not showing?**
- A: They auto-seed on first run. Check `countDocuments()` in console output.

**Q: Can't insert CSO because registeredMobile already exists?**
- A: `registeredMobile` is unique. Use PATCH/PUT to update instead.

---

## 📊 Database Statistics

Check current stats:

```bash
# Via MongoDB Atlas Dashboard:
cso_portal → Collections → Stats

# Via API:
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "serverTime": "2026-10-19T...",
  "totalCSOs": 2,
  "totalQuestions": 25,
  "totalSubmissions": 0,
  "database": "MongoDB"
}
```

---

**Questions? Check the code:**
- Schemas: `src/db/schemas.ts`
- Seeds: `src/db/seedData.ts`
- Initialization: `src/db/initializeDB.ts`

