/**
 * Pure API Client - Single Source of Truth from MongoDB
 * Smart Polling: Only refresh when data actually changes
 */

import {
  CSOProfile,
  SurveyQuestion,
  Assessment,
  SurveyRecord,
  ManpowerEntry
} from '../types/survey';

const API_BASE = '/api';

// Track last update timestamps to avoid unnecessary refreshes
let lastQuestionsHash = '';
let lastAssessmentsHash = '';
let lastRostersHash = '';
let lastSubmissionsHash = '';

/**
 * Generate hash of data to detect changes
 */
function generateHash(data: any): string {
  return JSON.stringify(data).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0).toString();
}

/**
 * Generic API error handler
 */
function handleError(err: any): never {
  console.error('[API] Error:', err);
  throw new Error(err?.message || 'API request failed');
}

// ==================== QUESTIONS API ====================

/**
 * GET all survey questions from MongoDB
 */
export async function fetchAllQuestions(): Promise<SurveyQuestion[]> {
  try {
    const res = await fetch(`${API_BASE}/questions`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Failed to fetch questions: ${res.statusText}`);
    
    const data = await res.json();
    return data.questions || [];
  } catch (err) {
    handleError(err);
  }
}

/**
 * GET active questions only
 */
export async function fetchActiveQuestions(): Promise<SurveyQuestion[]> {
  try {
    const questions = await fetchAllQuestions();
    return questions.filter(q => q.isActive).sort((a, b) => a.sequence - b.sequence);
  } catch (err) {
    handleError(err);
  }
}

/**
 * Check if questions changed since last fetch
 */
export async function questionsChanged(): Promise<boolean> {
  try {
    const questions = await fetchAllQuestions();
    const hash = generateHash(questions);
    if (hash !== lastQuestionsHash) {
      lastQuestionsHash = hash;
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

/**
 * POST update all questions
 */
export async function updateAllQuestions(questions: SurveyQuestion[]): Promise<{ success: boolean; count: number }> {
  try {
    const res = await fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions })
    });
    if (!res.ok) throw new Error(`Failed to update questions: ${res.statusText}`);
    
    lastQuestionsHash = generateHash(questions);
    return await res.json();
  } catch (err) {
    handleError(err);
  }
}

/**
 * POST add single question
 */
export async function addQuestion(question: SurveyQuestion): Promise<SurveyQuestion> {
  try {
    const res = await fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions: [question] })
    });
    if (!res.ok) throw new Error(`Failed to add question: ${res.statusText}`);
    
    return question;
  } catch (err) {
    handleError(err);
  }
}

/**
 * DELETE question by ID
 */
export async function deleteQuestion(questionId: string): Promise<{ success: boolean }> {
  try {
    const allQuestions = await fetchAllQuestions();
    const updated = allQuestions.filter(q => q.id !== questionId);
    
    const res = await fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions: updated })
    });
    if (!res.ok) throw new Error(`Failed to delete question: ${res.statusText}`);
    
    lastQuestionsHash = generateHash(updated);
    return { success: true };
  } catch (err) {
    handleError(err);
  }
}

// ==================== ASSESSMENTS API ====================

/**
 * GET all assessments from MongoDB
 */
export async function fetchAllAssessments(): Promise<Assessment[]> {
  try {
    const res = await fetch(`${API_BASE}/assessments`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Failed to fetch assessments: ${res.statusText}`);
    
    const data = await res.json();
    return data.assessments || [];
  } catch (err) {
    handleError(err);
  }
}

/**
 * GET active assessments only
 */
export async function fetchActiveAssessments(): Promise<Assessment[]> {
  try {
    const assessments = await fetchAllAssessments();
    return assessments.filter(a => a.isActive);
  } catch (err) {
    handleError(err);
  }
}

/**
 * Check if assessments changed since last fetch
 */
export async function assessmentsChanged(): Promise<boolean> {
  try {
    const assessments = await fetchAllAssessments();
    const hash = generateHash(assessments);
    if (hash !== lastAssessmentsHash) {
      lastAssessmentsHash = hash;
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

/**
 * POST update all assessments
 */
export async function updateAllAssessments(assessments: Assessment[]): Promise<{ success: boolean; count: number }> {
  try {
    const res = await fetch(`${API_BASE}/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessments })
    });
    if (!res.ok) throw new Error(`Failed to update assessments: ${res.statusText}`);
    
    lastAssessmentsHash = generateHash(assessments);
    return await res.json();
  } catch (err) {
    handleError(err);
  }
}

/**
 * POST add/update single assessment
 */
export async function upsertAssessment(assessment: Assessment): Promise<Assessment> {
  try {
    const allAssessments = await fetchAllAssessments();
    const idx = allAssessments.findIndex(a => a.id === assessment.id);
    
    if (idx >= 0) {
      allAssessments[idx] = assessment;
    } else {
      allAssessments.push(assessment);
    }
    
    await updateAllAssessments(allAssessments);
    return assessment;
  } catch (err) {
    handleError(err);
  }
}

/**
 * DELETE assessment by ID
 */
export async function deleteAssessment(assessmentId: string): Promise<{ success: boolean }> {
  try {
    const allAssessments = await fetchAllAssessments();
    const updated = allAssessments.filter(a => a.id !== assessmentId);
    
    const res = await fetch(`${API_BASE}/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessments: updated })
    });
    if (!res.ok) throw new Error(`Failed to delete assessment: ${res.statusText}`);
    
    lastAssessmentsHash = generateHash(updated);
    return { success: true };
  } catch (err) {
    handleError(err);
  }
}

// ==================== ROSTERS (CSOs) API ====================

/**
 * GET all CSO rosters from MongoDB
 */
export async function fetchAllRosters(): Promise<CSOProfile[]> {
  try {
    const res = await fetch(`${API_BASE}/state`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Failed to fetch rosters: ${res.statusText}`);
    
    const data = await res.json();
    return data.roster || [];
  } catch (err) {
    handleError(err);
  }
}

/**
 * Check if rosters changed since last fetch
 */
export async function rostersChanged(): Promise<boolean> {
  try {
    const rosters = await fetchAllRosters();
    const hash = generateHash(rosters);
    if (hash !== lastRostersHash) {
      lastRostersHash = hash;
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

/**
 * GET CSO by mobile number
 */
export async function fetchCSOByMobile(mobile: string): Promise<CSOProfile | null> {
  try {
    const cleanMob = mobile.replace(/\D/g, '').slice(-10);
    const res = await fetch(`${API_BASE}/cso/lookup/${cleanMob}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.cso || null;
  } catch (err) {
    console.warn('[API] CSO lookup failed:', err);
    return null;
  }
}

/**
 * POST add/update single CSO
 */
export async function upsertCSO(cso: CSOProfile): Promise<CSOProfile> {
  try {
    const res = await fetch(`${API_BASE}/cso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cso)
    });
    if (!res.ok) throw new Error(`Failed to save CSO: ${res.statusText}`);
    
    const data = await res.json();
    return data.cso || cso;
  } catch (err) {
    handleError(err);
  }
}

/**
 * POST update entire roster (Excel upload)
 */
export async function updateRoster(rosters: CSOProfile[], mode: 'replace' | 'append' = 'replace'): Promise<{ success: boolean; count: number }> {
  try {
    const res = await fetch(`${API_BASE}/roster`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roster: rosters, mode })
    });
    if (!res.ok) throw new Error(`Failed to update roster: ${res.statusText}`);
    
    lastRostersHash = generateHash(rosters);
    return await res.json();
  } catch (err) {
    handleError(err);
  }
}

/**
 * DELETE CSO by mobile
 */
export async function deleteCSO(mobile: string): Promise<{ success: boolean }> {
  try {
    const cleanMob = mobile.replace(/\D/g, '').slice(-10);
    const res = await fetch(`${API_BASE}/cso/${cleanMob}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Failed to delete CSO: ${res.statusText}`);
    
    return { success: true };
  } catch (err) {
    handleError(err);
  }
}

// ==================== SUBMISSIONS API ====================

/**
 * POST submit survey response
 */
export async function submitSurvey(
  mobile: string,
  record: SurveyRecord,
  assessmentId?: string
): Promise<{ success: boolean; record: SurveyRecord }> {
  try {
    const cleanMob = mobile.replace(/\D/g, '').slice(-10);
    const res = await fetch(`${API_BASE}/survey/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobileNumber: cleanMob,
        record,
        assessmentId
      })
    });
    if (!res.ok) throw new Error(`Failed to submit survey: ${res.statusText}`);
    
    return await res.json();
  } catch (err) {
    handleError(err);
  }
}

/**
 * GET all submissions
 */
export async function fetchAllSubmissions(): Promise<Record<string, SurveyRecord>> {
  try {
    const res = await fetch(`${API_BASE}/surveys`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Failed to fetch submissions: ${res.statusText}`);
    
    const data = await res.json();
    return data.submissions || {};
  } catch (err) {
    handleError(err);
  }
}

/**
 * Check if submissions changed since last fetch
 */
export async function submissionsChanged(): Promise<boolean> {
  try {
    const submissions = await fetchAllSubmissions();
    const hash = generateHash(submissions);
    if (hash !== lastSubmissionsHash) {
      lastSubmissionsHash = hash;
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

// ==================== HEALTH CHECK ====================

/**
 * Health check - ensure server is alive
 */
export async function healthCheck(): Promise<{ status: string; totalCSOs: number; totalQuestions: number; totalSubmissions: number }> {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Health check failed');
    
    return await res.json();
  } catch (err) {
    handleError(err);
  }
}

// ==================== MANPOWER API ====================

/**
 * GET manpower entries for a specific centre code
 */
export async function fetchManpowerByCentre(centreCode: string): Promise<ManpowerEntry[]> {
  try {
    const res = await fetch(`${API_BASE}/manpower/${encodeURIComponent(centreCode)}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Failed to fetch manpower: ${res.statusText}`);
    const data = await res.json();
    return data.manpower || [];
  } catch (err) {
    handleError(err);
  }
}

/**
 * GET all manpower entries
 */
export async function fetchAllManpower(): Promise<ManpowerEntry[]> {
  try {
    const res = await fetch(`${API_BASE}/manpower`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Failed to fetch all manpower: ${res.statusText}`);
    const data = await res.json();
    return data.manpower || [];
  } catch (err) {
    handleError(err);
  }
}

/**
 * POST upload manpower entries (replace or append per centre code)
 */
export async function uploadManpower(
  entries: ManpowerEntry[],
  mode: 'replace' | 'append'
): Promise<{ success: boolean; count: number }> {
  try {
    const res = await fetch(`${API_BASE}/manpower`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries, mode })
    });
    if (!res.ok) throw new Error(`Failed to upload manpower: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    handleError(err);
  }
}

