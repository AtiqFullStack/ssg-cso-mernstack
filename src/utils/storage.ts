import {
  CSOProfile,
  SurveyRecord,
  PhotoEvidenceItem,
  DeficiencyItem,
  SurveyFormData,
  SurveyQuestion,
  Assessment
} from '../types/survey';
import { INITIAL_PHOTO_SLOTS, DEFAULT_FORM_DATA } from '../data/mockCentres';
import { INITIAL_ASSESSMENTS } from '../data/defaultAssessments';

const ACTIVE_CSO_KEY = 'upsssc_pet2026_cso_active';
const SURVEY_RECORD_KEY_PREFIX = 'upsssc_pet2026_survey_';
const CSO_ROSTER_KEY = 'upsssc_pet2026_cso_roster';
const QUESTIONS_KEY = 'upsssc_pet2026_survey_questions';
const ASSESSMENTS_KEY = 'upsssc_pet2026_assessments';
const PURGE_FLAG_KEY = 'sssg_portal_purged_v5';

export const SURVEY_UPDATED_EVENT = 'upsssc_survey_updated';

export function dispatchSurveyUpdatedEvent(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SURVEY_UPDATED_EVENT));
  }
}

/**
 * Automatically purges legacy questions and mock data on initial load,
 * strictly fulfilling the user requirement:
 * "SARE QUESTIONS BHI DELETE KRDO ADMIN ADD KREGA NEW QUESTIONS AND WO HI SARE CSO KE LOGIN KRNE KE BAAD PROFILE PE DIKHNE CHAHIYE"
 */
function ensureDataCleared(): void {
  try {
    if (typeof window === 'undefined') return;
    const isPurged = localStorage.getItem(PURGE_FLAG_KEY);
    if (isPurged !== 'true') {
      localStorage.removeItem(ACTIVE_CSO_KEY);
      localStorage.setItem(CSO_ROSTER_KEY, JSON.stringify([]));
      // Delete all questions so Admin adds new questions from scratch:
      localStorage.setItem(QUESTIONS_KEY, JSON.stringify([]));

      // Remove all legacy survey keys
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(SURVEY_RECORD_KEY_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      localStorage.setItem(PURGE_FLAG_KEY, 'true');
    }
  } catch (e) {
    console.error('Error in ensureDataCleared', e);
  }
}

// Run initial purge check
ensureDataCleared();

/**
 * Complete reset of all data (roster, submissions, and active session)
 */
export function clearAllPortalData(): void {
  try {
    localStorage.removeItem(ACTIVE_CSO_KEY);
    localStorage.setItem(CSO_ROSTER_KEY, JSON.stringify([]));

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(SURVEY_RECORD_KEY_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    dispatchSurveyUpdatedEvent();
  } catch (e) {
    console.error('Failed to clear portal data', e);
  }
}

// ================= CSO ROSTER MANAGEMENT =================
export function getCSORoster(): CSOProfile[] {
  try {
    const raw = localStorage.getItem(CSO_ROSTER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load CSO roster from storage', e);
  }
  return [];
}

export function saveCSORoster(roster: CSOProfile[]): void {
  try {
    localStorage.setItem(CSO_ROSTER_KEY, JSON.stringify(roster));
    dispatchSurveyUpdatedEvent();
  } catch (e) {
    console.error('Failed to save CSO roster to storage', e);
  }
}

export function addOrUpdateCSOInStorage(cso: CSOProfile): void {
  const current = getCSORoster();
  const cleanMob = (cso.registeredMobile || cso.mobile || '').replace(/\D/g, '').slice(-10);
  const existingIdx = current.findIndex((p) => {
    const pMob = (p.registeredMobile || p.mobile || '').replace(/\D/g, '').slice(-10);
    return pMob === cleanMob;
  });

  if (existingIdx >= 0) {
    current[existingIdx] = cso;
  } else {
    current.push(cso);
  }

  saveCSORoster(current);
}

export function deleteCSOFromStorage(mobile: string): void {
  const current = getCSORoster();
  const cleanMob = mobile.replace(/\D/g, '').slice(-10);
  const updated = current.filter((p) => {
    const pMob = (p.registeredMobile || p.mobile || '').replace(/\D/g, '').slice(-10);
    return pMob !== cleanMob;
  });

  saveCSORoster(updated);

  try {
    localStorage.removeItem(`${SURVEY_RECORD_KEY_PREFIX}mob_${cleanMob}`);
  } catch {
    // ignore
  }
  dispatchSurveyUpdatedEvent();
}

export function findCSOByMobile(mobileNumber: string): CSOProfile | undefined {
  const cleaned = mobileNumber.replace(/\D/g, '').slice(-10);
  const roster = getCSORoster();
  return roster.find((p) => {
    const pMob = (p.registeredMobile || p.mobile || '').replace(/\D/g, '').slice(-10);
    return pMob === cleaned;
  });
}

// ================= ASSESSMENTS MANAGEMENT =================
export function getAssessments(): Assessment[] {
  try {
    const raw = localStorage.getItem(ASSESSMENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load assessments from storage', e);
  }
  // Initialize with INITIAL_ASSESSMENTS if none exist
  try {
    localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(INITIAL_ASSESSMENTS));
  } catch {
    // ignore
  }
  return INITIAL_ASSESSMENTS;
}

export function saveAssessments(assessments: Assessment[]): void {
  try {
    localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(assessments));
    dispatchSurveyUpdatedEvent();
  } catch (e) {
    console.error('Failed to save assessments to storage', e);
  }
}

export function addOrUpdateAssessment(assessment: Assessment): void {
  const current = getAssessments();
  const idx = current.findIndex((a) => a.id === assessment.id);
  const now = new Date().toISOString();
  if (idx >= 0) {
    current[idx] = { ...assessment, updatedAt: now };
  } else {
    current.push({ ...assessment, createdAt: now, updatedAt: now });
  }
  saveAssessments(current);
}

export function deleteAssessment(assessmentId: string): void {
  const current = getAssessments();
  const updated = current.filter((a) => a.id !== assessmentId);
  saveAssessments(updated);
}

export function getAssessmentById(assessmentId: string): Assessment | undefined {
  const all = getAssessments();
  return all.find((a) => a.id === assessmentId);
}

// ================= SURVEY QUESTIONS MANAGEMENT =================
// Starts empty or derived from assessments
export function getSurveyQuestions(): SurveyQuestion[] {
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => a.sequence - b.sequence);
      }
    }
  } catch (e) {
    console.error('Failed to load survey questions from storage', e);
  }
  // If no standalone questions, fall back to first active assessment's questions
  const assessments = getAssessments();
  const activeFirst = assessments.find((a) => a.isActive && a.questions?.length > 0);
  if (activeFirst) {
    return activeFirst.questions;
  }
  return [];
}

export function getActiveSurveyQuestions(assessmentId?: string): SurveyQuestion[] {
  if (assessmentId) {
    const assess = getAssessmentById(assessmentId);
    if (assess && Array.isArray(assess.questions)) {
      return assess.questions
        .filter((q) => q.isActive)
        .sort((a, b) => a.sequence - b.sequence);
    }
  }
  const all = getSurveyQuestions();
  return all
    .filter((q) => q.isActive)
    .sort((a, b) => a.sequence - b.sequence);
}

export function saveSurveyQuestions(questions: SurveyQuestion[]): void {
  try {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
    dispatchSurveyUpdatedEvent();
  } catch (e) {
    console.error('Failed to save survey questions', e);
  }
}

// ================= ACTIVE SESSION =================
export function getSavedActiveCSO(): CSOProfile | null {
  try {
    const raw = localStorage.getItem(ACTIVE_CSO_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load active CSO', e);
    return null;
  }
}

export function saveActiveCSO(profile: CSOProfile | null): void {
  try {
    if (profile) {
      localStorage.setItem(ACTIVE_CSO_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(ACTIVE_CSO_KEY);
    }
  } catch (e) {
    console.error('Failed to save active CSO', e);
  }
}

// ================= SURVEY RECORD =================
export function getSurveyRecord(
  centreCode: string,
  csoProfile: CSOProfile,
  assessmentId?: string
): SurveyRecord {
  const cleanMob = (csoProfile.registeredMobile || csoProfile.mobile || '').replace(/\D/g, '').slice(-10);
  const targetAssessmentId = assessmentId || 'assessment_mock_day';
  
  const keyMobWithAssessment = cleanMob ? `${SURVEY_RECORD_KEY_PREFIX}mob_${cleanMob}_${targetAssessmentId}` : '';
  const keyMob = cleanMob ? `${SURVEY_RECORD_KEY_PREFIX}mob_${cleanMob}` : '';
  const keyCentre = `${SURVEY_RECORD_KEY_PREFIX}${centreCode}`;

  try {
    const raw =
      (keyMobWithAssessment ? localStorage.getItem(keyMobWithAssessment) : null) ||
      (keyMob ? localStorage.getItem(keyMob) : null) ||
      localStorage.getItem(keyCentre);

    if (raw) {
      const parsed: SurveyRecord = JSON.parse(raw);
      if (!parsed.questionResponses) parsed.questionResponses = {};
      if (!parsed.questionRemarks) parsed.questionRemarks = {};
      parsed.assessmentId = targetAssessmentId;
      // Ensure csoProfile is updated with latest authoritative details from Excel roster
      parsed.csoProfile = { ...(parsed.csoProfile || {}), ...csoProfile };
      return parsed;
    }
  } catch (e) {
    console.error('Failed to read survey record from localStorage', e);
  }

  const activeQuestions = getActiveSurveyQuestions(targetAssessmentId);
  const initialResponses: Record<string, 'YES' | 'NO'> = {};
  activeQuestions.forEach((q) => {
    initialResponses[q.id] = 'YES';
  });

  const assessment = getAssessmentById(targetAssessmentId);

  const newRecord: SurveyRecord = {
    id: `REC-${centreCode || '04201'}-${targetAssessmentId}-${Date.now().toString(36).toUpperCase()}`,
    assessmentId: targetAssessmentId,
    assessmentTitle: assessment?.title || 'Mock Day Assessment',
    csoProfile,
    formData: {
      ...DEFAULT_FORM_DATA,
      csoSignatureName: csoProfile.name || csoProfile.csoName,
      candidateCapacityConfirmed: csoProfile.candidateCapacity || csoProfile.centreSeatingCapacity,
      totalRoomsReady: csoProfile.totalRooms || Math.ceil((csoProfile.centreSeatingCapacity || 480) / 24)
    },
    questionResponses: initialResponses,
    questionRemarks: {},
    photos: JSON.parse(JSON.stringify(INITIAL_PHOTO_SLOTS)),
    deficiencies: [],
    status: 'draft',
    updatedAt: new Date().toISOString()
  };

  saveSurveyRecord(newRecord, targetAssessmentId);
  return newRecord;
}

export function saveSurveyRecord(record: SurveyRecord, assessmentId?: string): void {
  const centreCode = record.csoProfile?.centreCode || '04201';
  const cleanMob = (record.csoProfile?.registeredMobile || record.csoProfile?.mobile || '').replace(/\D/g, '').slice(-10);
  const targetAssessmentId = assessmentId || record.assessmentId || 'assessment_mock_day';

  const keyCentre = `${SURVEY_RECORD_KEY_PREFIX}${centreCode}`;
  const keyMob = cleanMob ? `${SURVEY_RECORD_KEY_PREFIX}mob_${cleanMob}` : '';
  const keyMobWithAssessment = cleanMob ? `${SURVEY_RECORD_KEY_PREFIX}mob_${cleanMob}_${targetAssessmentId}` : '';

  try {
    record.updatedAt = new Date().toISOString();
    record.assessmentId = targetAssessmentId;
    const serialized = JSON.stringify(record);

    if (keyCentre) localStorage.setItem(keyCentre, serialized);
    if (keyMob) localStorage.setItem(keyMob, serialized);
    if (keyMobWithAssessment) localStorage.setItem(keyMobWithAssessment, serialized);

    dispatchSurveyUpdatedEvent();
  } catch (e) {
    console.error('Failed to save survey record', e);
  }
}

export function saveSurveySubmission(
  mobileNumber: string,
  record: SurveyRecord,
  assessmentId?: string
): void {
  const cleanMob = mobileNumber.replace(/\D/g, '').slice(-10);
  const targetAssessmentId = assessmentId || record.assessmentId || record.submissionData?.assessmentId || 'assessment_mock_day';
  const centreCode = record.csoProfile?.centreCode || '04201';

  const keyCentre = `${SURVEY_RECORD_KEY_PREFIX}${centreCode}`;
  const keyMob = cleanMob ? `${SURVEY_RECORD_KEY_PREFIX}mob_${cleanMob}` : '';
  const keyMobWithAssessment = cleanMob ? `${SURVEY_RECORD_KEY_PREFIX}mob_${cleanMob}_${targetAssessmentId}` : '';

  try {
    record.assessmentId = targetAssessmentId;
    const serialized = JSON.stringify(record);
    if (keyCentre) localStorage.setItem(keyCentre, serialized);
    if (keyMob) localStorage.setItem(keyMob, serialized);
    if (keyMobWithAssessment) localStorage.setItem(keyMobWithAssessment, serialized);
    dispatchSurveyUpdatedEvent();
  } catch (e) {
    console.error('Failed to save survey submission', e);
  }
}

/**
 * Returns all real survey records across all CSOs, centres, and assessments
 */
export function getAllSurveySubmissions(): Record<string, SurveyRecord> {
  const result: Record<string, SurveyRecord> = {};

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SURVEY_RECORD_KEY_PREFIX)) {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            const parsed: SurveyRecord = JSON.parse(val);
            const mob = (parsed.csoProfile?.registeredMobile || parsed.csoProfile?.mobile || '').replace(/\D/g, '').slice(-10);
            const code = parsed.csoProfile?.centreCode;
            const assessId = parsed.assessmentId || parsed.submissionData?.assessmentId;

            // Store by key suffix (e.g., mob_9876543210 or mob_9876543210_assessment_exam_day)
            if (key.startsWith(`${SURVEY_RECORD_KEY_PREFIX}mob_`)) {
              const subKey = key.replace(`${SURVEY_RECORD_KEY_PREFIX}mob_`, '');
              result[subKey] = parsed;
            }

            if (mob && assessId) {
              result[`${mob}_${assessId}`] = parsed;
            }
            if (mob && !result[mob]) {
              result[mob] = parsed;
            }
            if (code && !result[code]) {
              result[code] = parsed;
            }
          } catch {
            // ignore
          }
        }
      }
    }
  } catch (e) {
    console.error('Error scanning survey submissions', e);
  }

  return result;
}

/**
 * Get submission status for a specific CSO and assessment
 */
export function getCSOAssessmentSubmission(mobileNumber: string, assessmentId: string): SurveyRecord | null {
  const cleanMob = mobileNumber.replace(/\D/g, '').slice(-10);
  const submissions = getAllSurveySubmissions();
  return submissions[`${cleanMob}_${assessmentId}`] || null;
}
