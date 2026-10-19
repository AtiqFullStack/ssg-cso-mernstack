import { CSOProfile, SurveyQuestion, SurveyRecord, Assessment } from '../types/survey';
import {
  saveCSORoster,
  getCSORoster,
  saveSurveyQuestions,
  getSurveyQuestions,
  saveAssessments,
  getAssessments,
  saveSurveySubmission,
  getAllSurveySubmissions,
  dispatchSurveyUpdatedEvent
} from './storage';

export interface ServerState {
  roster: CSOProfile[];
  questions: SurveyQuestion[];
  assessments?: Assessment[];
  submissions: Record<string, SurveyRecord>;
  lastUpdated: string;
}

let lastKnownUpdatedTime = '';
let isSyncing = false;

/**
 * Fetch full authoritative state from backend server and update local storage cache
 */
export async function fetchServerState(): Promise<ServerState | null> {
  if (isSyncing) return null;
  try {
    isSyncing = true;
    const res = await fetch('/api/state', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch server state: ${res.statusText}`);
    }
    const data: ServerState = await res.json();

    if (data && data.lastUpdated !== lastKnownUpdatedTime) {
      lastKnownUpdatedTime = data.lastUpdated;

      // Update local storage so existing components continue to work transparently
      if (Array.isArray(data.roster)) {
        saveCSORoster(data.roster);
      }
      if (Array.isArray(data.questions)) {
        saveSurveyQuestions(data.questions);
      }
      if (Array.isArray(data.assessments) && data.assessments.length > 0) {
        saveAssessments(data.assessments);
      }
      if (data.submissions && typeof data.submissions === 'object') {
        Object.entries(data.submissions).forEach(([mob, record]) => {
          saveSurveySubmission(mob, record);
        });
      }

      dispatchSurveyUpdatedEvent();
    }

    return data;
  } catch (err) {
    // Network or server blip: silently fall back to local storage cache
    console.warn('[Sync] Fallback to local cache:', err);
    return null;
  } finally {
    isSyncing = false;
  }
}

/**
 * Send newly uploaded/edited roster to backend server
 */
export async function syncRosterToServer(roster: CSOProfile[], mode: 'replace' | 'append' = 'replace'): Promise<boolean> {
  try {
    saveCSORoster(roster); // Instant local cache update
    const res = await fetch('/api/roster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roster, mode }),
    });
    if (res.ok) {
      fetchServerState();
      return true;
    }
  } catch (e) {
    console.error('Failed to sync roster to server', e);
  }
  return false;
}

/**
 * Add or update single CSO
 */
export async function syncSingleCSOToServer(cso: CSOProfile): Promise<boolean> {
  try {
    const res = await fetch('/api/cso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cso),
    });
    if (res.ok) {
      fetchServerState();
      return true;
    }
  } catch (e) {
    console.error('Failed to sync single CSO to server', e);
  }
  return false;
}

/**
 * Delete CSO
 */
export async function deleteCSOFromServer(mobile: string): Promise<boolean> {
  try {
    const clean = mobile.replace(/\D/g, '').slice(-10);
    const res = await fetch(`/api/cso/${clean}`, { method: 'DELETE' });
    if (res.ok) {
      fetchServerState();
      return true;
    }
  } catch (e) {
    console.error('Failed to delete CSO from server', e);
  }
  return false;
}

/**
 * Sync questions to backend server
 */
export async function syncQuestionsToServer(questions: SurveyQuestion[]): Promise<boolean> {
  try {
    saveSurveyQuestions(questions); // Instant local cache update
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions }),
    });
    if (res.ok) {
      fetchServerState();
      return true;
    }
  } catch (e) {
    console.error('Failed to sync questions to server', e);
  }
  return false;
}

/**
 * Sync assessments to backend server
 */
export async function syncAssessmentsToServer(assessments: Assessment[]): Promise<boolean> {
  try {
    saveAssessments(assessments); // Instant local cache update
    const res = await fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessments }),
    });
    if (res.ok) {
      fetchServerState();
      return true;
    }
  } catch (e) {
    console.error('Failed to sync assessments to server', e);
  }
  return false;
}

/**
 * Live CSO Survey Submission to Server
 * Ensures whenever any CSO performs mock/exam survey on their mobile, the Admin Portal updates live!
 */
export async function submitSurveyLiveToServer(
  mobileNumber: string,
  record: SurveyRecord,
  assessmentId?: string
): Promise<boolean> {
  const cleanMob = mobileNumber.replace(/\D/g, '').slice(-10);
  const targetAssessmentId = assessmentId || record.assessmentId || record.submissionData?.assessmentId || 'assessment_mock_day';
  saveSurveySubmission(cleanMob, record, targetAssessmentId); // Local instant cache

  try {
    const res = await fetch('/api/survey/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber: cleanMob, record, assessmentId: targetAssessmentId }),
    });

    if (res.ok) {
      console.log('[Live Submit] Successfully delivered survey to server for', cleanMob, targetAssessmentId);
      fetchServerState();
      return true;
    }
  } catch (err) {
    console.error('[Live Submit] Server unreachable, stored in local storage:', err);
  }
  return true;
}

/**
 * Verify CSO by mobile number with live server lookup
 */
export async function lookupCSOLive(mobileNumber: string): Promise<{
  success: boolean;
  cso?: CSOProfile;
  submission?: SurveyRecord | null;
  error?: string;
}> {
  const cleanMob = mobileNumber.replace(/\D/g, '').slice(-10);
  if (!cleanMob || cleanMob.length !== 10) {
    return { success: false, error: 'Please enter a valid 10-digit mobile number' };
  }

  // First try live server lookup
  try {
    const res = await fetch(`/api/cso/lookup/${cleanMob}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.cso) {
        return { success: true, cso: data.cso, submission: data.submission };
      }
    }
  } catch (e) {
    console.warn('[Lookup] Server lookup failed, checking local cache:', e);
  }

  // Fallback to local storage roster
  const roster = getCSORoster();
  const matched = roster.find((p) => {
    const pMob = (p.registeredMobile || p.mobile || '').replace(/\D/g, '').slice(-10);
    return pMob === cleanMob;
  });

  if (matched) {
    const subs = getAllSurveySubmissions();
    return { success: true, cso: matched, submission: subs[cleanMob] || null };
  }

  return {
    success: false,
    error: 'Is Mobile Number se koi Centre registered nahi mila. Kripya Admin dwara registered number dalein.',
  };
}

/**
 * Clear all data on server and locally
 */
export async function clearAllServerData(): Promise<boolean> {
  try {
    await fetch('/api/reset-all', { method: 'POST' });
    await fetchServerState();
    return true;
  } catch (e) {
    console.error('Failed to clear server data', e);
    return false;
  }
}
