import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { CentreOverview } from './components/CentreOverview';
import { SurveyWizard } from './components/SurveyWizard';
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import {
  CSOProfile,
  SurveyRecord,
  Language,
  SurveyQuestion,
  Assessment
} from './types/survey';
import {
  getActiveCSO,
  saveActiveCSO,
  clearActiveCSO,
  getSurveyDraft,
  saveSurveyDraft,
  getAdminSession,
  saveAdminSession,
  clearAdminSession
} from './api/session';
import {
  fetchAllQuestions,
  fetchAllAssessments,
  fetchAllRosters,
  updateAllAssessments,
  updateAllQuestions,
  updateRoster,
  submitSurvey,
  fetchAllSubmissions,
  questionsChanged,
  assessmentsChanged,
  rostersChanged,
  submissionsChanged
} from './api/client';

export default function App() {
  // UI State
  const [activeCSO, setActiveCSO] = useState<CSOProfile | null>(null);
  const [surveyRecord, setSurveyRecord] = useState<SurveyRecord | null>(null);
  const [currentTab, setCurrentTab] = useState<'overview' | 'survey'>('overview');
  const [language, setLanguage] = useState<Language>('en');
  const [urlMobile, setUrlMobile] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Data from API
  const [csoRoster, setCsoRoster] = useState<CSOProfile[]>([]);
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, SurveyRecord>>({});

  // Admin - initialize from session so refresh preserves login
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => getAdminSession());
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isAdminViewOpen, setIsAdminViewOpen] = useState(() => getAdminSession());

  // Initialize
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mobileParam = params.get('mobile');
      const modeParam = params.get('mode');

      if (mobileParam) {
        setUrlMobile(mobileParam.replace(/\D/g, '').slice(-10));
      }

      if (modeParam === 'admin') {
        setIsAdminAuthModalOpen(true);
      }
    }

    const saved = getActiveCSO();
    if (saved) {
      setActiveCSO(saved);
      const draft = getSurveyDraft();
      if (draft) {
        setSurveyRecord(draft);
      }
    }

    loadDataFromAPI();
  }, []);

  // Polling every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadDataFromAPI();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  async function loadDataFromAPI() {
    try {
      // Smart polling: only update state if data actually changed
      
      // Check questions
      if (await questionsChanged()) {
        const questions = await fetchAllQuestions();
        setSurveyQuestions(questions);
      }

      // Check assessments
      if (await assessmentsChanged()) {
        const allAssessments = await fetchAllAssessments();
        setAssessments(allAssessments);
      }

      // Check rosters
      if (await rostersChanged()) {
        const roster = await fetchAllRosters();
        setCsoRoster(roster);
      }

      // Check submissions
      if (await submissionsChanged()) {
        const submissions = await fetchAllSubmissions();
        setSubmissionsMap(submissions);
      }
    } catch (err) {
      console.error('[App] Failed to load data from API:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const activeQuestions = surveyQuestions
    .filter((q) => q.isActive)
    .sort((a, b) => a.sequence - b.sequence);

  const currentAssessmentQuestions =
    selectedAssessment?.questions?.length
      ? selectedAssessment.questions
          .filter((q) => q.isActive)
          .sort((a, b) => a.sequence - b.sequence)
      : activeQuestions;

  const handleLoginSuccess = (profile: CSOProfile) => {
    const matched = csoRoster.find(
      (p) =>
        (p.registeredMobile || p.mobile || '').replace(/\D/g, '').slice(-10) ===
        (profile.registeredMobile || profile.mobile || '').replace(/\D/g, '').slice(-10)
    );
    const authoritativeProfile = matched ? { ...profile, ...matched } : profile;

    saveActiveCSO(authoritativeProfile);
    setActiveCSO(authoritativeProfile);

    const targetAssessment = assessments[0];
    if (targetAssessment) setSelectedAssessment(targetAssessment);

    const newRecord: SurveyRecord = {
      id: `REC-${Date.now()}`,
      assessmentId: targetAssessment?.id || 'mock_day',
      csoProfile: authoritativeProfile,
      formData: {} as any,
      questionResponses: {},
      questionRemarks: {},
      photos: [],
      deficiencies: [],
      status: 'draft',
      updatedAt: new Date().toISOString()
    };
    setSurveyRecord(newRecord);
    saveSurveyDraft(newRecord);
    setCurrentTab('overview');
  };

  const handleLogout = () => {
    // Clear CSO session
    clearActiveCSO();
    setActiveCSO(null);
    setSurveyRecord(null);
    setSelectedAssessment(null);
    setCurrentTab('overview');
    // Also clear admin session on full logout
    clearAdminSession();
    setIsAdminLoggedIn(false);
    setIsAdminViewOpen(false);
  };

  const handleOpenAdmin = () => {
    if (isAdminViewOpen) {
      setIsAdminViewOpen(false);
      return;
    }
    if (isAdminLoggedIn) {
      setIsAdminViewOpen(true);
    } else {
      setIsAdminAuthModalOpen(true);
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminLoggedIn(true);
    saveAdminSession();           // ← persist to sessionStorage
    setIsAdminAuthModalOpen(false);
    setIsAdminViewOpen(true);
  };

  const handleUpdateQuestions = async (newQuestions: SurveyQuestion[]) => {
    try {
      await updateAllQuestions(newQuestions);
      setSurveyQuestions(newQuestions);
    } catch (err) {
      console.error('Failed to update questions:', err);
    }
  };

  const handleUpdateAssessments = async (newAssessments: Assessment[]) => {
    try {
      await updateAllAssessments(newAssessments);
      setAssessments(newAssessments);
    } catch (err) {
      console.error('Failed to update assessments:', err);
    }
  };

  // Called when admin uploads Excel or manually adds/edits/deletes a CSO
  const handleUpdateRoster = async (newRoster: CSOProfile[]) => {
    try {
      await updateRoster(newRoster, 'replace');
      setCsoRoster(newRoster);
    } catch (err) {
      console.error('Failed to update roster:', err);
    }
  };

  const handleLoginAsCSOFromAdmin = (cso: CSOProfile) => {
    setIsAdminViewOpen(false);
    handleLoginSuccess(cso);
  };

  const handleSelectAssessmentToPerform = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    if (activeCSO) {
      const newRecord: SurveyRecord = {
        id: `REC-${Date.now()}`,
        assessmentId: assessment.id,
        csoProfile: activeCSO,
        formData: {} as any,
        questionResponses: {},
        questionRemarks: {},
        photos: [],
        deficiencies: [],
        status: 'draft',
        updatedAt: new Date().toISOString()
      };
      setSurveyRecord(newRecord);
      saveSurveyDraft(newRecord);
    }
    setCurrentTab('survey');
  };

  const handleQuestionResponseChange = (questionId: string, response: 'YES' | 'NO') => {
    if (!surveyRecord) return;
    const updated: SurveyRecord = {
      ...surveyRecord,
      questionResponses: {
        ...(surveyRecord.questionResponses || {}),
        [questionId]: response
      },
      updatedAt: new Date().toISOString()
    };
    setSurveyRecord(updated);
    saveSurveyDraft(updated);
  };

  const handleQuestionRemarkChange = (questionId: string, remark: string) => {
    if (!surveyRecord) return;
    const updated: SurveyRecord = {
      ...surveyRecord,
      questionRemarks: {
        ...(surveyRecord.questionRemarks || {}),
        [questionId]: remark
      },
      updatedAt: new Date().toISOString()
    };
    setSurveyRecord(updated);
    saveSurveyDraft(updated);
  };

  const handleSubmitSurvey = async (submittedRemarks = '') => {
    if (!surveyRecord || !activeCSO) return;

    try {
      const cleanMob = (activeCSO.registeredMobile || activeCSO.mobile || '')
        .replace(/\D/g, '')
        .slice(-10);

      const submittedRecord: SurveyRecord = {
        ...surveyRecord,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await submitSurvey(cleanMob, submittedRecord, selectedAssessment?.id);
      setSurveyRecord(submittedRecord);
      
      const submissions = await fetchAllSubmissions();
      setSubmissionsMap(submissions);

      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Failed to submit survey:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Header
        csoProfile={activeCSO}
        language={language}
        onLanguageChange={setLanguage}
        onOpenAdmin={handleOpenAdmin}
        onLogout={handleLogout}
        isAdminActive={isAdminViewOpen}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-4">
        {isAdminViewOpen ? (
          <AdminPanel
            csoRoster={csoRoster}
            onUpdateRoster={handleUpdateRoster}
            questions={surveyQuestions}
            onUpdateQuestions={handleUpdateQuestions}
            assessments={assessments}
            onUpdateAssessments={handleUpdateAssessments}
            onLoginAsCSO={handleLoginAsCSOFromAdmin}
            onCloseAdmin={() => setIsAdminViewOpen(false)}
            language={language}
          />
        ) : !activeCSO || !surveyRecord ? (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            onOpenAdmin={handleOpenAdmin}
            csoRoster={csoRoster}
            language={language}
            initialMobile={urlMobile}
          />
        ) : (
          <>
            {currentTab === 'overview' && (
              <CentreOverview
                csoProfile={activeCSO}
                surveyRecord={surveyRecord}
                assessments={assessments}
                submissionsMap={submissionsMap}
                language={language}
                onSelectAssessmentToPerform={handleSelectAssessmentToPerform}
                csoRoster={csoRoster}
              />
            )}

            {currentTab === 'survey' && (
              <SurveyWizard
                csoProfile={activeCSO}
                activeQuestions={currentAssessmentQuestions}
                questionResponses={surveyRecord.questionResponses || {}}
                questionRemarks={surveyRecord.questionRemarks || {}}
                onQuestionResponseChange={handleQuestionResponseChange}
                onQuestionRemarkChange={handleQuestionRemarkChange}
                onSubmitSurvey={(submittedRemarks) => {
                  handleSubmitSurvey(submittedRemarks);
                }}
                onBackToDashboard={() => {
                  setCurrentTab('overview');
                  loadDataFromAPI();
                }}
                language={language}
                initialRemarks={surveyRecord.formData?.csoRemarks || ''}
                isSubmitted={surveyRecord.status === 'submitted'}
                submissionDateTime={surveyRecord.submissionData?.submissionDateTime}
                assessment={selectedAssessment || assessments[0]}
              />
            )}
          </>
        )}
      </main>

      <AdminLoginModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
        language={language}
      />
    </div>
  );
}
