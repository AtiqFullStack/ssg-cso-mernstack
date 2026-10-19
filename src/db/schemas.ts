/**
 * MongoDB Schema Definitions for CSO Portal
 * Includes TypeScript interfaces and validation schemas
 */

import { Document } from 'mongodb';

// ==================== QUESTIONS SCHEMA ====================
export interface SurveyQuestionDoc extends Document {
  _id?: string;
  id: string;
  sequence: number;
  textEn: string;
  textHi: string;
  categoryEn: string;
  categoryHi?: string;
  helperEn?: string;
  helperHi?: string;
  optionsType?: 'YES_NO' | 'TEXT' | 'MULTI_CHOICE';
  isActive: boolean;
  assessmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export const QuestionValidationSchema = {
  bsonType: 'object',
  required: ['id', 'sequence', 'textEn', 'textHi', 'categoryEn', 'isActive'],
  properties: {
    _id: { bsonType: 'objectId' },
    id: { bsonType: 'string', description: 'Unique question ID (e.g., q_infra_01)' },
    sequence: { bsonType: 'int', description: 'Display order (1-based)' },
    textEn: { bsonType: 'string', description: 'Question text in English' },
    textHi: { bsonType: 'string', description: 'Question text in Hindi' },
    categoryEn: { bsonType: 'string', description: 'Category in English' },
    categoryHi: { bsonType: 'string', description: 'Category in Hindi' },
    helperEn: { bsonType: 'string', description: 'Helper/guidance text in English' },
    helperHi: { bsonType: 'string', description: 'Helper/guidance text in Hindi' },
    optionsType: { enum: ['YES_NO', 'TEXT', 'MULTI_CHOICE'] },
    isActive: { bsonType: 'bool' },
    assessmentId: { bsonType: 'string', description: 'Optional assessment-specific link' },
    createdAt: { bsonType: 'string' },
    updatedAt: { bsonType: 'string' }
  }
};

// ==================== ASSESSMENTS SCHEMA ====================
export interface AssessmentDoc extends Document {
  _id?: string;
  id: string;
  title: string;
  titleHi?: string;
  type: 'mock_day' | 'exam_day' | 'dry_run' | 'shift_audit' | 'custom';
  description?: string;
  descriptionHi?: string;
  examName: string;
  scheduledDate: string;
  shifts?: string;
  isActive: boolean;
  questionIds: string[];  // ← Store only IDs, not full objects
  questions?: SurveyQuestionDoc[];  // ← Optional: populated from questions collection
  createdAt: string;
  updatedAt: string;
}

export const AssessmentValidationSchema = {
  bsonType: 'object',
  required: ['id', 'title', 'type', 'examName', 'scheduledDate', 'isActive', 'questionIds'],
  properties: {
    _id: { bsonType: 'objectId' },
    id: { bsonType: 'string', description: 'Unique assessment ID (e.g., assessment_mock_day)' },
    title: { bsonType: 'string', description: 'Assessment title/name' },
    titleHi: { bsonType: 'string', description: 'Assessment title in Hindi' },
    type: { enum: ['mock_day', 'exam_day', 'dry_run', 'shift_audit', 'custom'] },
    description: { bsonType: 'string', description: 'Detailed description' },
    descriptionHi: { bsonType: 'string', description: 'Hindi description' },
    examName: { bsonType: 'string', description: 'e.g., UPSSSC PET 2026' },
    scheduledDate: { bsonType: 'string', description: 'Date and time' },
    shifts: { bsonType: 'string', description: 'Shift info (Morning/Evening)' },
    isActive: { bsonType: 'bool', description: 'Is this assessment active?' },
    questionIds: {
      bsonType: 'array',
      description: 'Array of question IDs (references to questions collection)',
      items: { bsonType: 'string' }
    },
    questions: {
      bsonType: 'array',
      description: 'Optional: populated questions (for convenience)',
      items: { bsonType: 'object' }
    },
    createdAt: { bsonType: 'string' },
    updatedAt: { bsonType: 'string' }
  }
};

// ==================== ROSTERS (CSOs) SCHEMA ====================
export interface CSOProfileDoc extends Document {
  _id?: string;
  id: string;
  districtName: string;
  csoName: string;
  registeredMobile: string; // Unique login ID
  dutyCentreName: string;
  centreSeatingCapacity: number;
  centreCode: string;

  // Compatibility fields
  name?: string;
  mobile?: string;
  district?: string;
  centreName?: string;
  candidateCapacity?: number;
  tehsil?: string;
  designation?: string;
  department?: string;
  address?: string;
  totalRooms?: number;

  // Hierarchical staff contacts
  centreSuperintendent?: {
    name: string;
    mobile: string;
    institution: string;
  };
  staticMagistrate?: {
    name: string;
    mobile: string;
    designation: string;
  };
  nodalOfficer?: {
    name: string;
    mobile: string;
    office: string;
  };

  createdAt?: string;
  updatedAt?: string;
}

export const CSORosterValidationSchema = {
  bsonType: 'object',
  required: ['id', 'districtName', 'csoName', 'registeredMobile', 'dutyCentreName', 'centreSeatingCapacity'],
  properties: {
    _id: { bsonType: 'objectId' },
    id: { bsonType: 'string' },
    districtName: { bsonType: 'string' },
    csoName: { bsonType: 'string' },
    registeredMobile: { 
      bsonType: 'string',
      pattern: '^[0-9]{10}$',
      description: '10-digit mobile number'
    },
    dutyCentreName: { bsonType: 'string' },
    centreSeatingCapacity: { bsonType: 'int' },
    centreCode: { bsonType: 'string' },
    name: { bsonType: 'string' },
    mobile: { bsonType: 'string' },
    district: { bsonType: 'string' },
    centreName: { bsonType: 'string' },
    candidateCapacity: { bsonType: 'int' },
    tehsil: { bsonType: 'string' },
    designation: { bsonType: 'string' },
    department: { bsonType: 'string' },
    address: { bsonType: 'string' },
    totalRooms: { bsonType: 'int' },
    centreSuperintendent: { bsonType: 'object' },
    staticMagistrate: { bsonType: 'object' },
    nodalOfficer: { bsonType: 'object' },
    createdAt: { bsonType: 'string' },
    updatedAt: { bsonType: 'string' }
  }
};

// ==================== SUBMISSIONS SCHEMA ====================
export interface SurveySubmissionDoc extends Document {
  _id?: string;
  mobileNumber: string; // CSO's mobile (clean 10 digits)
  assessmentId: string;
  csoName: string;
  centreCode: string;
  centreName: string;

  // Survey responses
  questionResponses: Record<string, 'YES' | 'NO' | string>;
  questionRemarks: Record<string, string>;
  formData?: Record<string, any>;

  // Submission metadata
  status: 'draft' | 'submitted' | 'approved' | 'escalated';
  submittedAt: string;
  serverReceivedAt: string;
  certificateId?: string;

  // Full submission data
  submissionData?: {
    allQuestions: Array<{
      id: string;
      sequence: number;
      textEn: string;
      textHi: string;
      categoryEn: string;
    }>;
    responses: Record<string, string>;
    remarks: string;
    submissionDateTime: string;
    submissionTimestampIso: string;
  };

  // GPS & location data
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  };

  createdAt?: string;
  updatedAt?: string;
}

export const SubmissionValidationSchema = {
  bsonType: 'object',
  required: ['mobileNumber', 'assessmentId', 'csoName', 'status', 'submittedAt', 'serverReceivedAt'],
  properties: {
    _id: { bsonType: 'objectId' },
    mobileNumber: { 
      bsonType: 'string',
      pattern: '^[0-9]{10}$',
      description: 'CSO 10-digit mobile'
    },
    assessmentId: { bsonType: 'string' },
    csoName: { bsonType: 'string' },
    centreCode: { bsonType: 'string' },
    centreName: { bsonType: 'string' },
    questionResponses: { bsonType: 'object' },
    questionRemarks: { bsonType: 'object' },
    formData: { bsonType: 'object' },
    status: { enum: ['draft', 'submitted', 'approved', 'escalated'] },
    submittedAt: { bsonType: 'string' },
    serverReceivedAt: { bsonType: 'string' },
    certificateId: { bsonType: 'string' },
    submissionData: { bsonType: 'object' },
    gpsCoordinates: { bsonType: 'object' },
    createdAt: { bsonType: 'string' },
    updatedAt: { bsonType: 'string' }
  }
};

// ==================== COLLECTION NAMES ====================
export const COLLECTION_NAMES = {
  QUESTIONS: 'questions',
  ASSESSMENTS: 'assessments',
  ROSTERS: 'rosters',
  SUBMISSIONS: 'submissions'
} as const;
