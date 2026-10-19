import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  FileSpreadsheet,
  Upload,
  Download,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Search,
  Filter,
  Building2,
  Users,
  Phone,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Lock,
  Layers,
  HelpCircle,
  Save,
  Check,
  Clock,
  FileText,
  MapPin,
  Calendar,
  RefreshCw,
  Printer,
  ChevronRight,
  X,
  Share2,
  CheckSquare,
  MessageSquare
} from 'lucide-react';
import { CSOProfile, SurveyQuestion, SurveyRecord, Language, Assessment } from '../../types/survey';
import { parseCSOExcelFile, downloadSampleExcelRoster } from '../../utils/excelParser';
import { DEFAULT_SURVEY_QUESTIONS } from '../../data/defaultQuestions';
import {
  getAllSurveySubmissions,
  clearAllPortalData,
  SURVEY_UPDATED_EVENT
} from '../../utils/storage';
import { CSOLiveLinkCard } from './CSOLiveLinkCard';
import { AssessmentManager } from './AssessmentManager';
import { fetchServerState, clearAllServerData } from '../../utils/apiSync';

interface AdminPanelProps {
  csoRoster: CSOProfile[];
  onUpdateRoster: (roster: CSOProfile[]) => void;
  questions: SurveyQuestion[];
  onUpdateQuestions: (questions: SurveyQuestion[]) => void;
  assessments: Assessment[];
  onUpdateAssessments: (assessments: Assessment[]) => void;
  onLoginAsCSO: (cso: CSOProfile) => void;
  onCloseAdmin: () => void;
  language: Language;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  csoRoster,
  onUpdateRoster,
  questions,
  onUpdateQuestions,
  assessments,
  onUpdateAssessments,
  onLoginAsCSO,
  onCloseAdmin,
  language
}) => {
  // Navigation Tabs: 'survey_progress' (default primary dashboard), 'assessments', 'excel_roster'
  const [activeAdminTab, setActiveAdminTab] = useState<'survey_progress' | 'assessments' | 'excel_roster'>('survey_progress');
  const [selectedAssessmentLedgerFilter, setSelectedAssessmentLedgerFilter] = useState<string>('all');

  // Real-time Survey Submissions State
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, SurveyRecord>>({});
  const [selectedSurveyRecord, setSelectedSurveyRecord] = useState<SurveyRecord | null>(null);

  // CSO Detailed Responses & Remarks Modal State
  const [viewingResponsesCSOItem, setViewingResponsesCSOItem] = useState<{
    cso: CSOProfile;
    cleanMob: string;
    record: SurveyRecord | null;
    isCompleted: boolean;
    submissionDateTime: string | null;
  } | null>(null);
  const [viewingModalAssessmentId, setViewingModalAssessmentId] = useState<string>('assessment_mock_day');
  const [modalQuestionFilter, setModalQuestionFilter] = useState<'all' | 'yes' | 'no' | 'remarks'>('all');
  const [modalQuestionSearch, setModalQuestionSearch] = useState('');

  // Filter States for Survey Progress Dashboard
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [progressSearch, setProgressSearch] = useState('');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState('all');

  // Excel Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [replaceExistingRoster, setReplaceExistingRoster] = useState(true);
  const [uploadFeedback, setUploadFeedback] = useState<{
    success: boolean;
    message: string;
    errors?: string[];
  } | null>(null);
  const [rosterSearch, setRosterSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSO Add & Edit Modals State
  const [isAddCSOModalOpen, setIsAddCSOModalOpen] = useState(false);
  const [editingCSO, setEditingCSO] = useState<CSOProfile | null>(null);
  const [csoFormDistrict, setCsoFormDistrict] = useState('');
  const [csoFormCode, setCsoFormCode] = useState('');
  const [csoFormName, setCsoFormName] = useState('');
  const [csoFormMobile, setCsoFormMobile] = useState('');
  const [csoFormCentre, setCsoFormCentre] = useState('');
  const [csoFormCapacity, setCsoFormCapacity] = useState('480');
  const [csoFormAddress, setCsoFormAddress] = useState('');
  const [csoFormError, setCsoFormError] = useState('');

  // Clear All Data Confirmation Modal State
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // Question Management State
  const [questionSearch, setQuestionSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [questionStatusFilter, setQuestionStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);

  // New Question Form Fields
  const [newTextEn, setNewTextEn] = useState('');
  const [newTextHi, setNewTextHi] = useState('');
  const [newCategoryEn, setNewCategoryEn] = useState('Perimeter & Security');
  const [newCategoryHi, setNewCategoryHi] = useState('सुरक्षा एवं घेराबंदी');
  const [newHelperEn, setNewHelperEn] = useState('');
  const [newHelperHi, setNewHelperHi] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);

  // Load submissions and synchronize automatically in real-time from server and local storage
  const refreshSubmissions = () => {
    fetchServerState()
      .then((state) => {
        if (state?.submissions) {
          setSubmissionsMap(state.submissions);
        } else {
          const subs = getAllSurveySubmissions();
          setSubmissionsMap(subs);
        }
      })
      .catch(() => {
        const subs = getAllSurveySubmissions();
        setSubmissionsMap(subs);
      });
  };

  useEffect(() => {
    refreshSubmissions();

    const handleSurveyUpdate = () => {
      refreshSubmissions();
    };

    window.addEventListener(SURVEY_UPDATED_EVENT, handleSurveyUpdate);
    window.addEventListener('storage', handleSurveyUpdate);

    // Live continuous sync every 2.5 seconds for real-time progress updates across devices
    const interval = setInterval(refreshSubmissions, 2500);

    return () => {
      window.removeEventListener(SURVEY_UPDATED_EVENT, handleSurveyUpdate);
      window.removeEventListener('storage', handleSurveyUpdate);
      clearInterval(interval);
    };
  }, []);

  // Compute summary metrics
  const totalCSOsCount = csoRoster.length;

  // Check completion for each CSO
  const csoProgressItems = csoRoster.map((cso) => {
    const cleanMob = (cso.registeredMobile || cso.mobile || '').replace(/\D/g, '').slice(-10);
    const centreCode = cso.centreCode || '';

    let record: SurveyRecord | null = null;
    if (selectedAssessmentLedgerFilter !== 'all') {
      record =
        submissionsMap[`${cleanMob}_${selectedAssessmentLedgerFilter}`] ||
        (selectedAssessmentLedgerFilter === 'assessment_mock_day' ? submissionsMap[cleanMob] : null);
    } else {
      record = submissionsMap[cleanMob] || (centreCode ? submissionsMap[centreCode] : null);
    }

    const isCompleted = record?.status === 'submitted';
    const submissionDateTime =
      record?.submissionData?.submissionDateTime ||
      (record?.submittedAt
        ? new Date(record.submittedAt).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }) + ' IST'
        : null);

    return {
      cso,
      cleanMob,
      isCompleted,
      submissionDateTime,
      record
    };
  });

  const completedCount = csoProgressItems.filter((item) => item.isCompleted).length;
  const pendingCount = totalCSOsCount - completedCount;
  const completedPercent = totalCSOsCount > 0 ? Math.round((completedCount / totalCSOsCount) * 100) : 0;

  // Filter progress items
  const filteredProgressItems = csoProgressItems.filter((item) => {
    if (statusFilter === 'completed' && !item.isCompleted) return false;
    if (statusFilter === 'pending' && item.isCompleted) return false;

    const dist = item.cso.districtName || item.cso.district || '';
    if (selectedDistrictFilter !== 'all' && dist.toLowerCase() !== selectedDistrictFilter.toLowerCase()) {
      return false;
    }

    if (progressSearch.trim()) {
      const q = progressSearch.toLowerCase();
      const matchName = (item.cso.csoName || item.cso.name || '').toLowerCase().includes(q);
      const matchDist = dist.toLowerCase().includes(q);
      const matchCentre = (item.cso.dutyCentreName || item.cso.centreName || '').toLowerCase().includes(q);
      const matchMob = item.cleanMob.includes(q);
      return matchName || matchDist || matchCentre || matchMob;
    }

    return true;
  });

  // Unique Districts list
  const allDistricts = Array.from(
    new Set(csoRoster.map((c) => c.districtName || c.district).filter(Boolean))
  );

  // Categories list from questions
  const categories = Array.from(new Set(questions.map((q) => q.categoryEn))).filter(Boolean);

  // ================= EXCEL UPLOAD HANDLER =================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadFeedback(null);

    const result = await parseCSOExcelFile(file, csoRoster, replaceExistingRoster);
    setIsUploading(false);

    if (result.success) {
      onUpdateRoster(result.profiles);
      setUploadFeedback({
        success: true,
        message: `Excel Roster processed successfully! ${result.importedCount} CSOs imported, ${result.updatedCount} records updated. Total Roster: ${result.profiles.length} CSOs.`,
        errors: result.errors
      });
      refreshSubmissions();
    } else {
      setUploadFeedback({
        success: false,
        message: 'Failed to import Excel roster.',
        errors: result.errors
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ================= CSO ADD / EDIT / DELETE HANDLERS =================
  const handleOpenAddCSO = () => {
    setCsoFormDistrict('');
    setCsoFormCode('');
    setCsoFormName('');
    setCsoFormMobile('');
    setCsoFormCentre('');
    setCsoFormCapacity('480');
    setCsoFormAddress('');
    setCsoFormError('');
    setIsAddCSOModalOpen(true);
  };

  const handleOpenEditCSO = (cso: CSOProfile) => {
    setEditingCSO(cso);
    setCsoFormDistrict(cso.districtName || cso.district || '');
    setCsoFormCode(cso.centreCode || '');
    setCsoFormName(cso.csoName || cso.name || '');
    setCsoFormMobile((cso.registeredMobile || cso.mobile || '').replace(/\D/g, '').slice(-10));
    setCsoFormCentre(cso.dutyCentreName || cso.centreName || '');
    setCsoFormCapacity(String(cso.centreSeatingCapacity || cso.candidateCapacity || '480'));
    setCsoFormAddress(cso.address || '');
    setCsoFormError('');
  };

  const handleSaveCSOForm = (e: React.FormEvent) => {
    e.preventDefault();
    setCsoFormError('');

    const cleanMob = csoFormMobile.replace(/\D/g, '').slice(-10);
    if (cleanMob.length !== 10) {
      setCsoFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!csoFormDistrict.trim()) {
      setCsoFormError('District Name is required.');
      return;
    }
    if (!csoFormName.trim()) {
      setCsoFormError('CSO Name is required.');
      return;
    }
    if (!csoFormCentre.trim()) {
      setCsoFormError('Duty Centre Name is required.');
      return;
    }

    const cap = parseInt(csoFormCapacity.replace(/\D/g, ''), 10) || 480;
    const centreCode = csoFormCode.trim() || editingCSO?.centreCode || `0${(2000 + (parseInt(cleanMob.slice(-3)) || 101)) % 9000 + 1000}`;
    const centreAddress = csoFormAddress.trim() || `${csoFormCentre.trim()}, District ${csoFormDistrict.trim()}, Uttar Pradesh`;

    const newProfile: CSOProfile = {
      id: editingCSO?.id || `CSO-UP-${centreCode}`,
      districtName: csoFormDistrict.trim(),
      csoName: csoFormName.trim(),
      registeredMobile: cleanMob,
      dutyCentreName: csoFormCentre.trim(),
      centreSeatingCapacity: cap,

      // backwards compatible
      name: csoFormName.trim(),
      designation: editingCSO?.designation || 'Centre Special Officer (CSO)',
      department: editingCSO?.department || 'Government of Uttar Pradesh',
      mobile: cleanMob,
      centreCode,
      centreName: csoFormCentre.trim(),
      district: csoFormDistrict.trim(),
      tehsil: editingCSO?.tehsil || 'Sadar',
      address: centreAddress,
      candidateCapacity: cap,
      totalRooms: Math.ceil(cap / 24),
      centreSuperintendent: editingCSO?.centreSuperintendent,
      staticMagistrate: editingCSO?.staticMagistrate,
      nodalOfficer: editingCSO?.nodalOfficer
    };

    if (editingCSO) {
      // Editing existing
      const oldCleanMob = (editingCSO.registeredMobile || editingCSO.mobile || '').replace(/\D/g, '').slice(-10);
      const updatedRoster = csoRoster.map((p) => {
        const pMob = (p.registeredMobile || p.mobile || '').replace(/\D/g, '').slice(-10);
        return pMob === oldCleanMob ? newProfile : p;
      });
      onUpdateRoster(updatedRoster);
      setEditingCSO(null);
    } else {
      // Adding new
      // Check if mobile already exists
      const exists = csoRoster.some((p) => {
        const pMob = (p.registeredMobile || p.mobile || '').replace(/\D/g, '').slice(-10);
        return pMob === cleanMob;
      });

      if (exists) {
        setCsoFormError(`CSO with Mobile number ${cleanMob} already exists in the roster.`);
        return;
      }

      onUpdateRoster([...csoRoster, newProfile]);
      setIsAddCSOModalOpen(false);
    }
  };

  const handleDeleteCSO = (mobile: string) => {
    const clean = mobile.replace(/\D/g, '').slice(-10);
    if (window.confirm(`Are you sure you want to remove CSO with Mobile: +91 ${clean}?`)) {
      const updated = csoRoster.filter((c) => {
        const m = (c.registeredMobile || c.mobile || '').replace(/\D/g, '').slice(-10);
        return m !== clean;
      });
      onUpdateRoster(updated);
    }
  };

  // Clear All Portal Data
  const handleConfirmClearAll = async () => {
    await clearAllServerData();
    clearAllPortalData();
    onUpdateRoster([]);
    setIsClearAllModalOpen(false);
    refreshSubmissions();
    alert('All roster and survey data has been cleared successfully.');
  };

  // ================= QUESTIONS MANAGEMENT HANDLERS =================
  const handleToggleQuestionActive = (id: string) => {
    const updated = questions.map((q) => {
      if (q.id === id) {
        return { ...q, isActive: !q.isActive, updatedAt: new Date().toISOString() };
      }
      return q;
    });
    onUpdateQuestions(updated);
  };

  const handleMoveSequence = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const list = [...questions];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const reordered = list.map((item, idx) => ({
      ...item,
      sequence: idx + 1,
      updatedAt: new Date().toISOString()
    }));

    onUpdateQuestions(reordered);
  };

  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const filtered = questions.filter((q) => q.id !== id);
      const renumbered = filtered.map((q, idx) => ({ ...q, sequence: idx + 1 }));
      onUpdateQuestions(renumbered);
    }
  };

  const handleClearAllQuestions = () => {
    if (
      window.confirm(
        'Are you sure you want to delete ALL questions? CSOs will see an empty survey until you add new questions.'
      )
    ) {
      onUpdateQuestions([]);
    }
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTextHi.trim()) return;

    const text = newTextHi.trim();
    const newQuestion: SurveyQuestion = {
      id: `q_custom_${Date.now().toString(36)}`,
      sequence: questions.length + 1,
      textEn: text,
      textHi: text,
      categoryEn: 'General',
      categoryHi: 'सामान्य',
      optionsType: 'YES_NO',
      isActive: newIsActive,
      createdAt: new Date().toISOString()
    };

    onUpdateQuestions([...questions, newQuestion]);
    setIsAddQuestionModalOpen(false);
    setNewTextHi('');
  };

  const handleUpdateExistingQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !editingQuestion.textHi.trim()) return;

    const text = editingQuestion.textHi.trim();
    const updated = questions.map((q) =>
      q.id === editingQuestion.id
        ? {
            ...editingQuestion,
            textHi: text,
            textEn: text,
            updatedAt: new Date().toISOString()
          }
        : q
    );
    onUpdateQuestions(updated);
    setEditingQuestion(null);
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* ================= ADMIN TOP BANNER ================= */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 border border-blue-900 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-amber-400 text-xs uppercase bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
              SSSG SOLUTIONS
            </span>
            <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">
              CSO SURVEY PORTAL ADMIN CONSOLE
            </span>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE AUTO-SYNC
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            UPSSSC PET 2026 — Commission Survey Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Real-time Mock Day survey tracking & roster control managed by SSSG SOLUTIONS
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={refreshSubmissions}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            title="Refresh survey progress data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={onCloseAdmin}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Exit Admin</span>
          </button>
        </div>
      </div>

      {/* ================= ADMIN TOP NAVIGATION TABS ================= */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveAdminTab('survey_progress')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeAdminTab === 'survey_progress'
              ? 'bg-blue-900 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Survey Progress Dashboard</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/20 text-white font-mono">
            {completedCount}/{totalCSOsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('assessments')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeAdminTab === 'assessments'
              ? 'bg-blue-900 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Assessments & Questions ({assessments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('excel_roster')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeAdminTab === 'excel_roster'
              ? 'bg-blue-900 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>CSO Excel Roster ({csoRoster.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: SURVEY PROGRESS DASHBOARD ================= */}
      {activeAdminTab === 'survey_progress' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* CSO LIVE SURVEY SHAREABLE LINK CARD */}
          <CSOLiveLinkCard
            csoRoster={csoRoster}
            completedCount={completedCount}
            totalCount={totalCSOsCount}
            onSwitchToCSOLogin={onCloseAdmin}
            onDirectTestCSO={onLoginAsCSO}
          />

          {/* 1. SUMMARY CARDS: TOTAL CSOs | COMPLETED | PENDING */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* TOTAL CSOs */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  TOTAL CSOs
                </span>
                <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </span>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  {totalCSOsCount}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Deputed Officers
                </span>
              </div>

              <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 font-mono">
                <span>Unique Mobile IDs</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">From Excel / Admin</span>
              </div>
            </div>

            {/* COMPLETED */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  COMPLETED
                </span>
                <span className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
                  {completedCount}
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                  ({completedPercent}% Finished)
                </span>
              </div>

              <div className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-2">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${completedPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* PENDING */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  PENDING
                </span>
                <span className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </span>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400">
                  {pendingCount}
                </span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 font-mono">
                  ({totalCSOsCount > 0 ? 100 - completedPercent : 0}% Awaiting)
                </span>
              </div>

              <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 font-mono">
                <span>Action Needed</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">Mock Day Survey</span>
              </div>
            </div>
          </div>

          {/* 2. FILTER & SEARCH CONTROLS */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All ({totalCSOsCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'completed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Completed ({completedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'pending'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Pending ({pendingCount})
              </button>
            </div>

            {/* Search, Assessment Dropdown, and District Dropdown */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={progressSearch}
                  onChange={(e) => setProgressSearch(e.target.value)}
                  placeholder="Search CSO, Mobile, Centre..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Assessment Selector */}
              <div className="relative w-full sm:w-52">
                <select
                  value={selectedAssessmentLedgerFilter}
                  onChange={(e) => setSelectedAssessmentLedgerFilter(e.target.value)}
                  aria-label="Filter ledger by assessment"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">All Assessments (सभी असेसमेंट्स)</option>
                  {assessments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.titleHi || a.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-full sm:w-40">
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedDistrictFilter}
                  onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                  aria-label="Filter by district"
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">All Districts ({allDistricts.length})</option>
                  {allDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3. DETAILED TABLE WITH REQUIRED COLUMNS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Centre Survey Progress Ledger</span>
                  <span className="text-xs font-mono font-normal text-slate-500">
                    Showing {filteredProgressItems.length} of {csoProgressItems.length} centres
                  </span>
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold hidden sm:inline">
                ● Auto-Synchronized
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">District Name</th>
                    <th className="py-3 px-4">CSO Name</th>
                    <th className="py-3 px-4">Registered Mobile Number</th>
                    <th className="py-3 px-4">Duty Centre Name</th>
                    <th className="py-3 px-4 text-center">Centre Seating Capacity</th>
                    <th className="py-3 px-4 text-center">Survey Status</th>
                    <th className="py-3 px-4 text-center">Responses & Remarks</th>
                    <th className="py-3 px-4">Submission Date & Time</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProgressItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <Users className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                        <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                          {totalCSOsCount === 0
                            ? 'No CSOs in the roster yet.'
                            : 'No CSOs found matching the search/filter criteria.'}
                        </p>
                        <p className="text-xs mt-1 text-slate-400">
                          {totalCSOsCount === 0
                            ? 'Switch to the "CSO Excel Roster" tab to upload your Excel file or click "Add CSO".'
                            : 'Try resetting the district or status filter.'}
                        </p>
                        {totalCSOsCount === 0 && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => setActiveAdminTab('excel_roster')}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 cursor-pointer"
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                              <span>Open CSO Excel Roster Tab</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredProgressItems.map((item) => {
                      const district = item.cso.districtName || item.cso.district || 'Uttar Pradesh';
                      const csoName = item.cso.csoName || item.cso.name;
                      const centreName = item.cso.dutyCentreName || item.cso.centreName;
                      const capacity = item.cso.centreSeatingCapacity || item.cso.candidateCapacity || 480;

                      return (
                        <tr
                          key={item.cleanMob}
                          className={`transition-colors ${
                            item.isCompleted && item.record
                              ? 'hover:bg-blue-50/40 dark:hover:bg-slate-800/60 cursor-pointer'
                              : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                          }`}
                          onClick={() => {
                            setViewingResponsesCSOItem(item);
                            if (item.record?.assessmentId) {
                              setViewingModalAssessmentId(item.record.assessmentId);
                            } else if (selectedAssessmentLedgerFilter !== 'all') {
                              setViewingModalAssessmentId(selectedAssessmentLedgerFilter);
                            } else {
                              setViewingModalAssessmentId(assessments[0]?.id || 'assessment_mock_day');
                            }
                          }}
                          title="Click row to view all question responses and remarks"
                        >
                          {/* 1. District Name (Clearly highlighted) */}
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs font-bold uppercase tracking-wide">
                              <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                              {district}
                            </span>
                          </td>

                          {/* 2. CSO Name */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {csoName}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                              {item.cso.designation || 'Centre Special Officer'}
                            </div>
                          </td>

                          {/* 3. Registered Mobile Number (Unique Login ID) */}
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                            <span className="text-slate-400">+91</span> {item.cleanMob}
                          </td>

                          {/* 4. Duty Centre Name (Clearly highlighted) */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white flex items-start gap-1.5 max-w-[240px]">
                              <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span className="leading-tight">{centreName}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Code: {item.cso.centreCode || '04201'}
                            </div>
                          </td>

                          {/* 5. Centre Seating Capacity */}
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                            {capacity} Candidates
                          </td>

                          {/* 6. Survey Status */}
                          <td className="py-3.5 px-4 text-center">
                            {item.isCompleted ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingResponsesCSOItem(item);
                                  if (item.record?.assessmentId) {
                                    setViewingModalAssessmentId(item.record.assessmentId);
                                  } else {
                                    setViewingModalAssessmentId(assessments[0]?.id || 'assessment_mock_day');
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-[11px] font-mono transition-colors cursor-pointer"
                                title="Click to view submitted survey details"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>COMPLETED</span>
                                <Eye className="w-3 h-3 text-emerald-600 ml-0.5" />
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold text-[11px] font-mono">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>PENDING</span>
                              </span>
                            )}
                          </td>

                          {/* 7. Responses & Remarks Column with View Button */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingResponsesCSOItem(item);
                                  if (item.record?.assessmentId) {
                                    setViewingModalAssessmentId(item.record.assessmentId);
                                  } else if (selectedAssessmentLedgerFilter !== 'all') {
                                    setViewingModalAssessmentId(selectedAssessmentLedgerFilter);
                                  } else {
                                    setViewingModalAssessmentId(assessments[0]?.id || 'assessment_mock_day');
                                  }
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
                                  item.isCompleted
                                    ? 'bg-blue-900 hover:bg-blue-800 text-white shadow-blue-900/20 hover:scale-[1.02]'
                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                                }`}
                                title="Click to view all question responses, answers and remarks"
                              >
                                <Eye className={`w-3.5 h-3.5 ${item.isCompleted ? 'text-amber-400' : 'text-slate-400'}`} />
                                <span>View Responses</span>
                                {item.isCompleted && item.record?.questionResponses && (
                                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-blue-800 text-blue-200 text-[10px] font-mono">
                                    {Object.keys(item.record.questionResponses).length}
                                  </span>
                                )}
                              </button>
                              {item.isCompleted && (
                                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                  <span className="text-emerald-600 font-bold">
                                    {Object.values(item.record?.questionResponses || {}).filter((r) => r === 'YES').length} YES
                                  </span>
                                  <span>·</span>
                                  <span
                                    className={
                                      Object.values(item.record?.questionResponses || {}).filter((r) => r === 'NO').length > 0
                                        ? 'text-rose-600 font-bold'
                                        : 'text-slate-400'
                                    }
                                  >
                                    {Object.values(item.record?.questionResponses || {}).filter((r) => r === 'NO').length} NO
                                  </span>
                                  {(item.record?.submissionData?.remarks || item.record?.formData?.csoRemarks) && (
                                    <span
                                      title={`CSO Remark: ${item.record?.submissionData?.remarks || item.record?.formData?.csoRemarks}`}
                                      className="text-amber-600"
                                    >
                                      💬
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 8. Submission Date & Time */}
                          <td className="py-3.5 px-4 font-mono text-xs">
                            {item.isCompleted && item.submissionDateTime ? (
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {item.submissionDateTime}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic font-sans text-[11px]">
                                — Not Submitted Yet
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CSO EXCEL ROSTER MANAGEMENT ================= */}
      {activeAdminTab === 'excel_roster' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Uploader Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Upload CSO & Examination Centre Excel Roster</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload an Excel file (.xlsx, .xls) or CSV. The registered mobile number becomes each CSO's unique login ID.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={downloadSampleExcelRoster}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Template (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddCSO}
                  className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New CSO</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsClearAllModalOpen(true)}
                  className="px-3 py-2 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Clear all roster data"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Data</span>
                </button>
              </div>
            </div>

            {/* Mandatory Fields Guide */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 space-y-1.5">
              <span className="font-bold block">
                Required Excel Column Headers:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono">
                <div className="p-1.5 bg-white dark:bg-slate-800 rounded border border-blue-200 dark:border-blue-800">
                  1. District Name
                </div>
                <div className="p-1.5 bg-white dark:bg-slate-800 rounded border border-blue-200 dark:border-blue-800">
                  2. CSO Name
                </div>
                <div className="p-1.5 bg-white dark:bg-slate-800 rounded border border-blue-200 dark:border-blue-800 font-bold text-amber-600">
                  3. Registered Mobile Number
                </div>
                <div className="p-1.5 bg-white dark:bg-slate-800 rounded border border-blue-200 dark:border-blue-800">
                  4. Duty Centre Name
                </div>
                <div className="p-1.5 bg-white dark:bg-slate-800 rounded border border-blue-200 dark:border-blue-800">
                  5. Centre Seating Capacity
                </div>
              </div>
            </div>

            {/* Replace / Append Option */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="replaceRoster"
                checked={replaceExistingRoster}
                onChange={(e) => setReplaceExistingRoster(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="replaceRoster" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                Replace current roster with this uploaded file (recommended for clean updates)
              </label>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-800/30 transition-all relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                aria-label="Upload CSO and Examination Centre Excel roster"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />

              <div className="max-w-sm mx-auto space-y-2 pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {isUploading ? 'Parsing & Validating Excel Roster...' : 'Click to Upload or Drag & Drop Excel File'}
                </h4>
                <p className="text-xs text-slate-500">
                  Supports Microsoft Excel (.xlsx, .xls) and CSV files
                </p>
              </div>
            </div>

            {/* Feedback Message */}
            {uploadFeedback && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  uploadFeedback.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                }`}
              >
                <div className="font-bold flex items-center gap-2">
                  {uploadFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{uploadFeedback.message}</span>
                </div>

                {uploadFeedback.errors && uploadFeedback.errors.length > 0 && (
                  <ul className="list-disc list-inside text-[11px] font-mono space-y-0.5 pl-2 opacity-90">
                    {uploadFeedback.errors.slice(0, 5).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                    {uploadFeedback.errors.length > 5 && (
                      <li>...and {uploadFeedback.errors.length - 5} more rows.</li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Current Roster Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Active CSO Deputation Roster ({csoRoster.length})</span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    placeholder="Search roster..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">District</th>
                    <th className="py-2.5 px-3">Centre Code</th>
                    <th className="py-2.5 px-3">Duty Centre Name</th>
                    <th className="py-2.5 px-3">CSO Name</th>
                    <th className="py-2.5 px-3">Registered Mobile</th>
                    <th className="py-2.5 px-3 text-center">Capacity</th>
                    <th className="py-2.5 px-3 text-center">CSO Responses & Remarks</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {csoRoster.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-500">
                        <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                        <p className="font-bold text-slate-700 dark:text-slate-300">Roster is empty.</p>
                        <p className="text-xs text-slate-400 mt-1">Upload an Excel sheet or click "Add New CSO" to add centres.</p>
                      </td>
                    </tr>
                  ) : (
                    csoRoster
                      .filter((c) => {
                        if (!rosterSearch) return true;
                        const q = rosterSearch.toLowerCase();
                        return (
                          (c.csoName || c.name || '').toLowerCase().includes(q) ||
                          (c.registeredMobile || c.mobile || '').includes(q) ||
                          (c.dutyCentreName || c.centreName || '').toLowerCase().includes(q) ||
                          (c.centreCode || '').toLowerCase().includes(q) ||
                          (c.districtName || c.district || '').toLowerCase().includes(q)
                        );
                      })
                      .map((cso) => {
                        const mob = (cso.registeredMobile || cso.mobile || '').replace(/\D/g, '').slice(-10);
                        const code = cso.centreCode || '-';
                        const defaultAssessId = assessments[0]?.id || 'assessment_mock_day';
                        const record =
                          submissionsMap[`${mob}_${defaultAssessId}`] ||
                          submissionsMap[mob] ||
                          null;
                        const isSubmitted = record?.status === 'submitted';
                        const yesCount = Object.values(record?.questionResponses || {}).filter((r) => r === 'YES').length;
                        const noCount = Object.values(record?.questionResponses || {}).filter((r) => r === 'NO').length;
                        const totalAns = Object.keys(record?.questionResponses || {}).length;

                        return (
                          <tr key={mob} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="py-2.5 px-3 font-bold text-blue-900 dark:text-blue-300">
                              {cso.districtName || cso.district}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                              {code}
                            </td>
                            <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 font-semibold max-w-[220px] truncate" title={cso.dutyCentreName || cso.centreName}>
                              {cso.dutyCentreName || cso.centreName}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                              {cso.csoName || cso.name}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                              +91 {mob}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-semibold">
                              {cso.centreSeatingCapacity || cso.candidateCapacity}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex flex-col items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const item = csoProgressItems.find((p) => p.cleanMob === mob) || {
                                      cso,
                                      cleanMob: mob,
                                      isCompleted: isSubmitted,
                                      record,
                                      submissionDateTime:
                                        record?.submissionData?.submissionDateTime ||
                                        (record?.submittedAt
                                          ? new Date(record.submittedAt).toLocaleString('en-IN', {
                                              timeZone: 'Asia/Kolkata',
                                              day: '2-digit',
                                              month: 'short',
                                              year: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              hour12: true
                                            }) + ' IST'
                                          : null)
                                    };
                                    setViewingResponsesCSOItem(item);
                                    setViewingModalAssessmentId(record?.assessmentId || defaultAssessId);
                                  }}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
                                    isSubmitted
                                      ? 'bg-blue-900 hover:bg-blue-800 text-white shadow-blue-900/20 hover:scale-[1.02]'
                                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                  }`}
                                  title="Click to view all question responses, answers and remarks"
                                >
                                  <Eye className={`w-3.5 h-3.5 ${isSubmitted ? 'text-amber-400' : 'text-slate-400'}`} />
                                  <span>View Responses</span>
                                  {isSubmitted && totalAns > 0 && (
                                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-blue-800 text-blue-200 text-[10px] font-mono">
                                      {totalAns}
                                    </span>
                                  )}
                                </button>
                                {isSubmitted && (
                                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                    <span className="text-emerald-600 font-bold">{yesCount} YES</span>
                                    <span>·</span>
                                    <span className={noCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>{noCount} NO</span>
                                    {(record?.submissionData?.remarks || record?.formData?.csoRemarks) && (
                                      <span title={`CSO Remark: ${record?.submissionData?.remarks || record?.formData?.csoRemarks}`} className="text-amber-600">💬</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditCSO(cso)}
                                  className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                                  title="Edit CSO Details"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onLoginAsCSO(cso)}
                                  className="px-2 py-1 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 hover:bg-blue-100 rounded-lg text-[11px] font-bold cursor-pointer"
                                  title="Test Login as this CSO"
                                >
                                  Login
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCSO(mob)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer"
                                  title="Delete CSO"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ASSESSMENTS & QUESTIONNAIRES ================= */}
      {activeAdminTab === 'assessments' && (
        <AssessmentManager
          assessments={assessments}
          onUpdateAssessments={onUpdateAssessments}
          language={language}
        />
      )}

      {/* ================= COMPLETED SURVEY DETAILS DOSSIER MODAL ================= */}
      {selectedSurveyRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-black text-amber-500 text-xs uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  SSSG SOLUTIONS
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                  MOCK DAY SURVEY DOSSIER
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSurveyRecord(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top CSO & Centre Highlight Banner */}
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-xl p-4 border border-blue-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-900 pb-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-widest block">
                    DISTRICT
                  </span>
                  <h3 className="text-xl font-black uppercase text-white">
                    {selectedSurveyRecord.submissionData?.district ||
                      selectedSurveyRecord.csoProfile?.districtName ||
                      selectedSurveyRecord.csoProfile?.district}
                  </h3>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">
                    STATUS
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-300 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    COMPLETED
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">CSO Name:</span>
                  <strong className="text-slate-100">
                    {selectedSurveyRecord.submissionData?.csoName ||
                      selectedSurveyRecord.csoProfile?.csoName ||
                      selectedSurveyRecord.csoProfile?.name}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Mobile Number:</span>
                  <strong className="text-amber-400 font-mono">
                    +91 {selectedSurveyRecord.submissionData?.mobileNumber ||
                      selectedSurveyRecord.csoProfile?.registeredMobile ||
                      selectedSurveyRecord.csoProfile?.mobile}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Duty Centre Name:</span>
                  <strong className="text-slate-100">
                    {selectedSurveyRecord.submissionData?.centreName ||
                      selectedSurveyRecord.csoProfile?.dutyCentreName ||
                      selectedSurveyRecord.csoProfile?.centreName}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Centre Seating Capacity:</span>
                  <strong className="text-slate-100 font-mono">
                    {selectedSurveyRecord.submissionData?.seatingCapacity ||
                      selectedSurveyRecord.csoProfile?.centreSeatingCapacity ||
                      selectedSurveyRecord.csoProfile?.candidateCapacity}{' '}
                    Candidates
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Exam Name:</span>
                  <strong className="text-slate-100">UPSSSC PET 2026</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Submission Date & Time:</span>
                  <strong className="text-emerald-300 font-mono">
                    {selectedSurveyRecord.submissionData?.submissionDateTime ||
                      (selectedSurveyRecord.submittedAt
                        ? new Date(selectedSurveyRecord.submittedAt).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }) + ' IST'
                        : 'Recorded')}
                  </strong>
                </div>
              </div>
            </div>

            {/* Questions & Responses List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Survey Questions & Recorded Answers</span>
                <span className="text-[11px] font-mono font-normal text-slate-500">
                  Total Questions:{' '}
                  {selectedSurveyRecord.submissionData?.allQuestions?.length || questions.length}
                </span>
              </h4>

              <div className="space-y-2.5">
                {(selectedSurveyRecord.submissionData?.allQuestions || questions).map((q: any) => {
                  const resp =
                    (selectedSurveyRecord.submissionData?.responses &&
                      selectedSurveyRecord.submissionData.responses[q.id]) ||
                    (selectedSurveyRecord.questionResponses &&
                      selectedSurveyRecord.questionResponses[q.id]) ||
                    'YES';

                  return (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                          <span className="text-slate-400 font-mono mr-1">#{q.sequence}.</span>
                          {q.textHi || q.textEn}
                        </div>
                        {q.textEn && q.textEn !== q.textHi && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {q.textEn}
                          </div>
                        )}
                      </div>

                      {/* Large YES / NO Badge */}
                      <div className="shrink-0">
                        {resp === 'YES' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-black text-xs shadow-xs font-mono">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            YES
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-black text-xs shadow-xs font-mono">
                            <X className="w-3.5 h-3.5 stroke-[3]" />
                            NO
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Remarks Section */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
                REMARKS (OPTIONAL) SUBMITTED BY CSO:
              </span>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 italic leading-relaxed">
                "{selectedSurveyRecord.submissionData?.remarks ||
                  selectedSurveyRecord.formData?.csoRemarks ||
                  'No additional remarks submitted.'}"
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-mono text-slate-400">
                Record ID: {selectedSurveyRecord.id}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Record</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSurveyRecord(null)}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT CSO ================= */}
      {(isAddCSOModalOpen || editingCSO) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {editingCSO ? 'Edit CSO Deputation Details' : 'Add New CSO & Centre'}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setIsAddCSOModalOpen(false);
                  setEditingCSO(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCSOForm} className="space-y-3.5 text-xs">
              {csoFormError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs font-bold">
                  {csoFormError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  District Name *
                </label>
                <input
                  type="text"
                  required
                  value={csoFormDistrict}
                  onChange={(e) => setCsoFormDistrict(e.target.value)}
                  placeholder="e.g. Bareilly, Aligarh, Lucknow"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Examination Centre Code *
                </label>
                <input
                  type="text"
                  required
                  value={csoFormCode}
                  onChange={(e) => setCsoFormCode(e.target.value)}
                  placeholder="e.g. 03953, 03352"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  CSO Name *
                </label>
                <input
                  type="text"
                  required
                  value={csoFormName}
                  onChange={(e) => setCsoFormName(e.target.value)}
                  placeholder="e.g. Ashish, Nitin Rai, Abhishek"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Registered Mobile Number (Unique Login ID) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={csoFormMobile}
                    onChange={(e) => setCsoFormMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="w-full pl-12 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Duty Centre Name *
                </label>
                <input
                  type="text"
                  required
                  value={csoFormCentre}
                  onChange={(e) => setCsoFormCentre(e.target.value)}
                  placeholder="e.g. Bareilly Inter College, Civil Lines"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Centre Address
                </label>
                <input
                  type="text"
                  value={csoFormAddress}
                  onChange={(e) => setCsoFormAddress(e.target.value)}
                  placeholder="e.g. Station Road, Civil Lines, Bareilly, UP"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Centre Seating Capacity *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={csoFormCapacity}
                  onChange={(e) => setCsoFormCapacity(e.target.value)}
                  placeholder="e.g. 480"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddCSOModalOpen(false);
                    setEditingCSO(null);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  {editingCSO ? 'Save Changes' : 'Add CSO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CLEAR ALL DATA CONFIRMATION ================= */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-rose-300 dark:border-rose-900 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                Clear All Portal Data?
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This will delete all uploaded CSOs, centres, and submitted surveys. Only data you upload via Excel or add will be kept.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD QUESTION ================= */}
      {isAddQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Add New Survey Question (YES / NO)
              </h4>
              <button
                type="button"
                onClick={() => setIsAddQuestionModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-xs">
                  सर्वेक्षण प्रश्न (Survey Question) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newTextHi}
                  onChange={(e) => setNewTextHi(e.target.value)}
                  placeholder="यहाँ प्रश्न दर्ज करें (उदा. क्या परीक्षा केंद्र पर सभी कमरों में पर्याप्त रोशनी एवं पंखे कार्यरत हैं?)"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                    Response Options: YES / NO
                  </span>
                  <span className="text-[10px] text-slate-500">
                    प्रत्येक प्रश्न के लिए दो विकल्प (YES / NO) स्वतः उपलब्ध रहेंगे।
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                  YES / NO
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeNew"
                  checked={newIsActive}
                  onChange={(e) => setNewIsActive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="activeNew" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Activate immediately (make visible to CSOs in survey)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddQuestionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT QUESTION ================= */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Edit Survey Question #{editingQuestion.sequence}
              </h4>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateExistingQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-xs">
                  सर्वेक्षण प्रश्न (Survey Question) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingQuestion.textHi}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, textHi: e.target.value })
                  }
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeEdit"
                  checked={editingQuestion.isActive}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, isActive: e.target.checked })
                  }
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="activeEdit" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Active (Only active questions appear to CSOs)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ================= MODAL: VIEW ALL CSO RESPONSES & REMARKS ================= */}
      {viewingResponsesCSOItem && (() => {
        const item = viewingResponsesCSOItem;
        const cso = item.cso;
        const cleanMob = item.cleanMob;

        // Find record for the currently selected modal assessment
        const currentModalRecord: SurveyRecord | null =
          submissionsMap[`${cleanMob}_${viewingModalAssessmentId}`] ||
          (viewingModalAssessmentId === 'assessment_mock_day' ? submissionsMap[cleanMob] : null) ||
          (item.record?.assessmentId === viewingModalAssessmentId ? item.record : null) ||
          item.record;

        const isCurrentAssessmentSubmitted = currentModalRecord?.status === 'submitted';

        // Target assessment
        const targetAssessment = assessments.find((a) => a.id === viewingModalAssessmentId) || assessments[0];
        const assessmentTitle = targetAssessment?.titleHi || targetAssessment?.title || 'Mock Day Assessment';
        const displayQuestions = targetAssessment?.questions && targetAssessment.questions.length > 0
          ? targetAssessment.questions
          : questions;

        const responsesMap: Record<string, 'YES' | 'NO'> =
          currentModalRecord?.questionResponses || currentModalRecord?.submissionData?.responses || {};
        const remarksMap: Record<string, string> =
          currentModalRecord?.questionRemarks || {};
        const generalRemark =
          currentModalRecord?.formData?.csoRemarks ||
          currentModalRecord?.submissionData?.remarks ||
          '';

        const totalQ = displayQuestions.length;
        const yesCount = Object.values(responsesMap).filter((r) => r === 'YES').length;
        const noCount = Object.values(responsesMap).filter((r) => r === 'NO').length;
        const compliancePct = totalQ > 0 ? Math.round((yesCount / totalQ) * 100) : 0;
        const questionsWithRemarks = displayQuestions.filter((q) => Boolean(remarksMap[q.id]));

        const filteredQuestions = displayQuestions.filter((q) => {
          const resp = responsesMap[q.id];
          const remark = remarksMap[q.id];
          if (modalQuestionFilter === 'yes' && resp !== 'YES') return false;
          if (modalQuestionFilter === 'no' && resp !== 'NO') return false;
          if (modalQuestionFilter === 'remarks' && !remark) return false;
          if (modalQuestionSearch) {
            const qStr = modalQuestionSearch.toLowerCase();
            const hit =
              (q.textHi || '').toLowerCase().includes(qStr) ||
              (q.textEn || '').toLowerCase().includes(qStr) ||
              (remark || '').toLowerCase().includes(qStr) ||
              String(q.sequence).includes(qStr);
            if (!hit) return false;
          }
          return true;
        });

        const submissionDateStr =
          currentModalRecord?.submissionData?.submissionDateTime ||
          (currentModalRecord?.submittedAt
            ? new Date(currentModalRecord.submittedAt).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }) + ' IST'
            : item.submissionDateTime);

        return (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-start justify-between gap-3 shrink-0">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-mono font-bold uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>CSO AUDIT RESPONSES & REMARKS LEDGER</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <span>{cso.csoName || cso.name}</span>
                    <span className="text-amber-400 font-mono text-sm font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      +91 {cleanMob}
                    </span>
                  </h3>
                  <div className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-amber-300">
                      {cso.districtName || cso.district}
                    </span>
                    <span>·</span>
                    <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-[11px] text-slate-300">
                      Centre #{cso.centreCode || '04201'}
                    </span>
                    <span>·</span>
                    <span>{cso.dutyCentreName || cso.centreName}</span>
                    <span>·</span>
                    <span className="font-mono text-emerald-400">
                      {cso.centreSeatingCapacity || cso.candidateCapacity} Candidates
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                    title="Print responses sheet"
                  >
                    <Printer className="w-4 h-4 text-slate-300" />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewingResponsesCSOItem(null);
                      setModalQuestionFilter('all');
                      setModalQuestionSearch('');
                    }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl cursor-pointer"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Assessment Switcher Tabs */}
              {assessments.length > 0 && (
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 overflow-x-auto shrink-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
                    Assessment:
                  </span>
                  {assessments.map((a) => {
                    const isAActive = viewingModalAssessmentId === a.id;
                    const aRec =
                      submissionsMap[`${cleanMob}_${a.id}`] ||
                      (a.id === 'assessment_mock_day' ? submissionsMap[cleanMob] : null);
                    const aSubmitted = aRec?.status === 'submitted';

                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setViewingModalAssessmentId(a.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                          isAActive
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{a.titleHi || a.title}</span>
                        {aSubmitted ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Submitted" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-500" title="Pending" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Scrollable Content */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
                {/* Status & Summary Stats Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Status Banner */}
                  <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Assessment Status
                      </span>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {assessmentTitle}
                      </div>
                      {isCurrentAssessmentSubmitted && submissionDateStr ? (
                        <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                          Submitted on {submissionDateStr}
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block mt-0.5">
                          Survey Awaiting CSO Submission (Pending)
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      {isCurrentAssessmentSubmitted ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs font-mono border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>COMPLETED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs font-mono border border-amber-300 dark:border-amber-800">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>PENDING</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Compliance & Answer Breakdown */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                        YES (हाँ) Answers
                      </span>
                      <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                        {yesCount} / {totalQ}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block font-mono">
                        {compliancePct}%
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Compliance</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 block">
                        NO (नहीं) Flagged
                      </span>
                      <span className="text-2xl font-black text-rose-700 dark:text-rose-400 font-mono">
                        {noCount}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-700 dark:text-rose-300 font-mono">
                        {noCount > 0 ? 'Deficiencies' : 'Clean'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Overall CSO Remarks if present */}
                {generalRemark && (
                  <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider mb-1">
                      <MessageSquare className="w-4 h-4 text-amber-600" />
                      <span>CSO Overall Remarks & Sign-off (मुख्य अधिकारी का अंतिम रिमार्क्स)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed italic pl-6">
                      "{generalRemark}"
                    </p>
                  </div>
                )}

                {/* Responses & Remarks List Header with Question Filters */}
                <div className="space-y-3 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                      <span>All Question-by-Question Responses & Remarks ({displayQuestions.length} Questions)</span>
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Showing {filteredQuestions.length} of {displayQuestions.length} checkpoints
                    </span>
                  </div>

                  {/* Filter Pills and Question Search */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      <button
                        type="button"
                        onClick={() => setModalQuestionFilter('all')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          modalQuestionFilter === 'all'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        All ({totalQ})
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalQuestionFilter('yes')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          modalQuestionFilter === 'yes'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        YES ({yesCount})
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalQuestionFilter('no')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          modalQuestionFilter === 'no'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        NO Deficiencies ({noCount})
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalQuestionFilter('remarks')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          modalQuestionFilter === 'remarks'
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        With Remarks ({questionsWithRemarks.length})
                      </button>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={modalQuestionSearch}
                        onChange={(e) => setModalQuestionSearch(e.target.value)}
                        placeholder="Search question, keyword, remark..."
                        className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-3">
                  {filteredQuestions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <FileText className="w-8 h-8 mx-auto text-slate-400" />
                      <p className="font-bold text-xs text-slate-700 dark:text-slate-300">
                        No questions matched the selected filter or search keyword.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setModalQuestionFilter('all');
                          setModalQuestionSearch('');
                        }}
                        className="px-3 py-1 text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    </div>
                  ) : (
                    filteredQuestions.map((q, idx) => {
                      const response = responsesMap[q.id];
                      const remark = remarksMap[q.id];
                      const staffEntries = currentModalRecord?.staffResponses?.[q.id] || [];
                      const isStaffType = q.optionsType === 'STAFF_DETAILS';

                      return (
                        <div
                          key={q.id || idx}
                          className={`p-4 rounded-2xl border transition-all ${
                            isStaffType
                              ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                              : response === 'YES'
                              ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                              : response === 'NO'
                              ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'
                              : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-mono font-bold">
                                  Question #{q.sequence || idx + 1}
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase">
                                  {q.categoryHi || q.categoryEn}
                                </span>
                                {isStaffType && (
                                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                    STAFF DETAILS
                                  </span>
                                )}
                              </div>

                              {/* Hindi Question Text */}
                              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                                {q.textHi || q.textEn}
                              </p>

                              {/* English Question Text if different */}
                              {q.textEn && q.textHi && q.textEn !== q.textHi && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic leading-relaxed">
                                  {q.textEn}
                                </p>
                              )}
                            </div>

                            {/* Response Badge - YES/NO or Staff count */}
                            <div className="shrink-0 self-start sm:self-center">
                              {isStaffType ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono font-black text-xs border border-blue-300 dark:border-blue-800">
                                  <Users className="w-4 h-4 text-blue-600" />
                                  <span>{staffEntries.length} Staff</span>
                                </span>
                              ) : response === 'YES' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-black text-xs border border-emerald-300 dark:border-emerald-800 shadow-2xs">
                                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                                  <span>YES (हाँ)</span>
                                </span>
                              ) : response === 'NO' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-mono font-black text-xs border border-rose-300 dark:border-rose-800 shadow-2xs">
                                  <X className="w-4 h-4 text-rose-600 stroke-[3]" />
                                  <span>NO (नहीं)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-mono font-semibold">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Staff Details Table */}
                          {isStaffType && staffEntries.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                              <div className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase mb-2 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Staff Present ({staffEntries.length})
                              </div>
                              <div className="space-y-1.5">
                                {staffEntries.map((s, si) => (
                                  <div key={si} className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-lg border border-blue-100 dark:border-blue-900 text-xs">
                                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-black text-[10px] flex items-center justify-center shrink-0">
                                      {si + 1}
                                    </span>
                                    <span className="font-bold text-slate-800 dark:text-white flex-1">{s.name || '—'}</span>
                                    <span className="font-mono text-slate-500">{s.mobile || '—'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Individual Question Remark if provided by CSO */}
                          {remark && (
                            <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">CSO Remark (रिमार्क्स):</span> {remark}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
                <div className="text-xs text-slate-500">
                  Total Questions: <span className="font-bold text-slate-800 dark:text-slate-200">{displayQuestions.length}</span> · Compliance: <span className="font-bold text-emerald-600">{compliancePct}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Print Report
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewingResponsesCSOItem(null);
                      setModalQuestionFilter('all');
                      setModalQuestionSearch('');
                    }}
                    className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
