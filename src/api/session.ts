/**
 * Session Management - Only stores ACTIVE CSO (not survey data, not questions, not assessments)
 * Everything else comes fresh from API
 */

import { CSOProfile, SurveyRecord } from '../types/survey';

const ACTIVE_CSO_KEY = 'cso_active_session';
const SURVEY_DRAFT_KEY = 'survey_draft_temp';

/**
 * Save currently logged-in CSO
 */
export function saveActiveCSO(cso: CSOProfile | null): void {
  try {
    if (cso) {
      sessionStorage.setItem(ACTIVE_CSO_KEY, JSON.stringify(cso));
    } else {
      sessionStorage.removeItem(ACTIVE_CSO_KEY);
    }
  } catch (e) {
    console.error('Failed to save active CSO', e);
  }
}

/**
 * Get currently logged-in CSO
 */
export function getActiveCSO(): CSOProfile | null {
  try {
    const raw = sessionStorage.getItem(ACTIVE_CSO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to get active CSO', e);
    return null;
  }
}

/**
 * Logout - clear active CSO
 */
export function clearActiveCSO(): void {
  sessionStorage.removeItem(ACTIVE_CSO_KEY);
}

/**
 * Save survey draft (temporary - in memory session only)
 */
export function saveSurveyDraft(record: SurveyRecord): void {
  try {
    sessionStorage.setItem(SURVEY_DRAFT_KEY, JSON.stringify(record));
  } catch (e) {
    console.error('Failed to save survey draft', e);
  }
}

/**
 * Get survey draft
 */
export function getSurveyDraft(): SurveyRecord | null {
  try {
    const raw = sessionStorage.getItem(SURVEY_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to get survey draft', e);
    return null;
  }
}

/**
 * Clear survey draft
 */
export function clearSurveyDraft(): void {
  sessionStorage.removeItem(SURVEY_DRAFT_KEY);
}

/**
 * Complete logout - clear everything
 */
export function logoutCompletely(): void {
  clearActiveCSO();
  clearSurveyDraft();
}
