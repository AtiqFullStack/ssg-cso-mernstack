/**
 * Session Management - Only stores ACTIVE CSO (not survey data, not questions, not assessments)
 * Everything else comes fresh from API
 */

import { CSOProfile, SurveyRecord } from '../types/survey';

const ACTIVE_CSO_KEY = 'cso_active_session';
const SURVEY_DRAFT_KEY = 'survey_draft_temp';
const ADMIN_SESSION_KEY = 'admin_session';

// ==================== CSO SESSION ====================

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

// ==================== ADMIN SESSION ====================

/**
 * Save admin login state with timestamp
 */
export function saveAdminSession(): void {
  try {
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
      loggedIn: true,
      loginAt: new Date().toISOString()
    }));
  } catch (e) {
    console.error('Failed to save admin session', e);
  }
}

/**
 * Check if admin is logged in this session
 */
export function getAdminSession(): boolean {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    return data?.loggedIn === true;
  } catch (e) {
    return false;
  }
}

/**
 * Clear admin session (logout)
 */
export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

// ==================== SURVEY DRAFT ====================

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
  clearAdminSession();
}
