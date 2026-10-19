import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  MessageSquare,
  Check,
  Building2,
  MapPin,
  Users,
  ChevronLeft,
  Plus,
  Trash2,
  Phone,
  User
} from 'lucide-react';
import { CSOProfile, Language, SurveyQuestion, Assessment, StaffEntry, ManpowerEntry } from '../types/survey';
import { fetchManpowerByCentre } from '../api/client';

interface SurveyWizardProps {
  csoProfile: CSOProfile;
  activeQuestions: SurveyQuestion[];
  questionResponses: Record<string, 'YES' | 'NO'>;
  questionRemarks?: Record<string, string>;
  staffResponses?: Record<string, StaffEntry[]>;
  onQuestionResponseChange: (questionId: string, response: 'YES' | 'NO') => void;
  onQuestionRemarkChange?: (questionId: string, remark: string) => void;
  onStaffResponseChange?: (questionId: string, staff: StaffEntry[]) => void;
  onSubmitSurvey: (remarks: string) => void;
  onBackToDashboard: () => void;
  language: Language;
  initialRemarks?: string;
  isSubmitted?: boolean;
  submissionDateTime?: string;
  assessment?: Assessment | null;
}

export const SurveyWizard: React.FC<SurveyWizardProps> = ({
  csoProfile,
  activeQuestions,
  questionResponses,
  questionRemarks = {},
  staffResponses = {},
  onQuestionResponseChange,
  onQuestionRemarkChange,
  onStaffResponseChange,
  onSubmitSurvey,
  onBackToDashboard,
  language,
  initialRemarks = '',
  isSubmitted = false,
  submissionDateTime,
  assessment
}) => {
  const [remarks, setRemarks] = useState(initialRemarks);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [manpowerRoster, setManpowerRoster] = useState<ManpowerEntry[]>([]);

  useEffect(() => {
    const code = (csoProfile.centreCode || '').trim();
    if (!code) return;
    fetchManpowerByCentre(code)
      .then(setManpowerRoster)
      .catch(() => setManpowerRoster([]));
  }, [csoProfile.centreCode]);

  // Categories list
  const categories = Array.from(new Set(activeQuestions.map((q) => q.categoryEn))).filter(Boolean);

  // For STAFF_DETAILS: a question is answered if it has at least 1 staff entry with name filled
  const isQuestionAnswered = (q: SurveyQuestion) => {
    if (q.optionsType === 'STAFF_DETAILS') {
      const entries = staffResponses[q.id] || [];
      return entries.length > 0 && entries.every(e => e.name.trim() !== '');
    }
    return Boolean(questionResponses[q.id]);
  };

  // Check unanswered questions
  const unansweredQuestions = activeQuestions.filter((q) => !isQuestionAnswered(q));
  const allAnswered = unansweredQuestions.length === 0 && activeQuestions.length > 0;
  const answeredCount = activeQuestions.length - unansweredQuestions.length;

  // Staff helpers
  const getStaffEntries = (qId: string): StaffEntry[] => staffResponses[qId] || [];

  // Get manpower suggestions for a question based on designation keyword match
  const getManpowerSuggestions = (q: SurveyQuestion): ManpowerEntry[] => {
    if (manpowerRoster.length === 0) return [];
    const keyword = (q.textHi || q.textEn || '').toLowerCase();
    // Try to match by designation or serviceName keywords in question text
    const matched = manpowerRoster.filter((m) => {
      const desig = (m.designation || '').toLowerCase();
      const svc = (m.serviceName || '').toLowerCase();
      return keyword.includes(desig) || keyword.includes(svc) || desig.includes(keyword.split(' ')[0]) || svc.includes(keyword.split(' ')[0]);
    });
    // If no keyword match, return all manpower as suggestions
    return matched.length > 0 ? matched : manpowerRoster;
  };

  // Toggle a manpower suggestion as present/absent
  const handleToggleManpowerEntry = (qId: string, mp: ManpowerEntry, checked: boolean) => {
    if (!onStaffResponseChange) return;
    const current = getStaffEntries(qId);
    if (checked) {
      // Add if not already present (match by contactPhone)
      const alreadyIn = current.some((s) => s.mobile === mp.contactPhone && s.name === mp.contactName);
      if (!alreadyIn) {
        onStaffResponseChange(qId, [...current, { name: mp.contactName, mobile: mp.contactPhone }]);
      }
    } else {
      onStaffResponseChange(qId, current.filter((s) => !(s.mobile === mp.contactPhone && s.name === mp.contactName)));
    }
  };

  const handleAddNewStaff = (qId: string) => {
    if (!onStaffResponseChange) return;
    onStaffResponseChange(qId, [...getStaffEntries(qId), { name: '', mobile: '' }]);
  };

  const handleRemoveStaff = (qId: string, index: number) => {
    if (!onStaffResponseChange) return;
    const updated = getStaffEntries(qId).filter((_, i) => i !== index);
    onStaffResponseChange(qId, updated);
  };

  const handleStaffFieldChange = (qId: string, index: number, field: 'name' | 'mobile', value: string) => {
    if (!onStaffResponseChange) return;
    const updated = [...getStaffEntries(qId)];
    updated[index] = { ...updated[index], [field]: value };
    onStaffResponseChange(qId, updated);
  };

  const districtName = (csoProfile.districtName || csoProfile.district || 'UTTAR PRADESH').toUpperCase();
  const centreName = csoProfile.dutyCentreName || csoProfile.centreName;
  const csoName = csoProfile.csoName || csoProfile.name;
  const seatingCapacity = csoProfile.centreSeatingCapacity || csoProfile.candidateCapacity;

  const handlePreSubmit = () => {
    setValidationError('');

    if (!allAnswered) {
      setValidationError(
        language === 'hi'
          ? `कृपया सबमिट करने से पहले सभी प्रश्नों का उत्तर दें। (${unansweredQuestions.length} प्रश्न अनुत्तरित हैं)`
          : `Please answer every question before submitting. (${unansweredQuestions.length} questions remaining)`
      );
      // Scroll to the first unanswered question
      const firstUnanswered = unansweredQuestions[0];
      if (firstUnanswered) {
        const el = document.getElementById(`question-${firstUnanswered.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    // Open confirmation dialog
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    setIsConfirmModalOpen(false);
    onSubmitSurvey(remarks);
    setShowSuccessScreen(true);
  };

  const filteredQuestions = activeQuestions.filter(
    (q) => filterCategory === 'all' || q.categoryEn === filterCategory
  );

  return (
    <div className="space-y-4 pb-28 max-w-3xl mx-auto">
      {/* Success Modal / Banner if just submitted */}
      {showSuccessScreen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-emerald-500 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {assessment?.title || 'Mock Day Survey'} Successfully Submitted
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your examination center inspection report has been recorded in the UPSSSC Command & Control server.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-left text-xs font-mono space-y-1">
              <div>
                <span className="text-slate-500">CSO:</span> <strong>{csoName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Centre:</span> <strong>{centreName}</strong>
              </div>
              <div>
                <span className="text-slate-500">District:</span> <strong>{districtName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Assessment:</span> <strong>{assessment?.title || 'Mock Day Assessment'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Status:</span> <strong className="text-emerald-600 font-bold">COMPLETED</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowSuccessScreen(false);
                onBackToDashboard();
              }}
              className="w-full py-3.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-sm shadow-md transition-colors cursor-pointer"
            >
              Return to CSO Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 mx-auto flex items-center justify-center">
              <FileCheck2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Submit {assessment?.title || 'Mock Day Survey'}?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                All {activeQuestions.length} answered checkpoints and your remarks will be locked and transmitted to the Commission.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="min-h-[44px] py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="min-h-[44px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
              >
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back to Dashboard Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-400 py-1 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to CSO Dashboard</span>
        </button>

        <span className="text-[11px] font-mono text-slate-500">
          {assessment?.title || 'Mock Day Survey'} · {assessment?.examName || 'UPSSSC PET 2026'}
        </span>
      </div>

      {/* CLEARLY HIGHLIGHTED DISTRICT & CENTRE NAME BANNER */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-blue-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-900/80 border border-blue-700/60 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-widest">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>DISTRICT: {districtName}</span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{centreName}</span>
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-200 pt-0.5">
              <span>CSO: <strong className="text-white">{csoName}</strong></span>
              <span>Capacity: <strong className="text-white font-mono">{seatingCapacity} Candidates</strong></span>
            </div>
          </div>

          {/* Progress Pill */}
          <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl px-3.5 py-2 shrink-0 sm:text-right">
            <span className="text-[10px] text-blue-200 block uppercase tracking-wider font-semibold">Survey Completion</span>
            <div className="text-sm font-mono font-bold text-amber-300">
              {answeredCount} / {activeQuestions.length} Questions
            </div>
            <div className="w-28 h-1.5 bg-blue-950/60 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${activeQuestions.length > 0 ? (answeredCount / activeQuestions.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills (if multiple categories exist) */}
      {categories.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterCategory === 'all'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All Questions ({activeQuestions.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filterCategory === cat
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Validation alert banner if attempting to submit with unanswered items */}
      {validationError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{validationError}</span>
        </div>
      )}

      {/* ================= ALL ACTIVE SURVEY QUESTIONS LIST ================= */}
      {activeQuestions.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {language === 'hi'
              ? 'सर्वेक्षण प्रश्न अभी उपलब्ध नहीं हैं'
              : 'No Active Survey Questions Available'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {language === 'hi'
              ? 'प्रशासक (Admin) द्वारा अभी तक कोई नया सर्वेक्षण प्रश्न नहीं जोड़ा गया है। जैसे ही Admin प्रश्न जोड़ेंगे, वे यहाँ स्वतः दिखने लगेंगे।'
              : 'The Admin has not added any survey questions yet. Once added in the Admin Panel, they will appear here automatically for you to complete.'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {language === 'hi' ? 'डैशबोर्ड पर वापस जाएं' : 'Return to CSO Dashboard'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredQuestions.map((q) => {
            const currentVal = questionResponses[q.id];
            const isAnswered = Boolean(currentVal);

          return (
            <div
              key={q.id}
              id={`question-${q.id}`}
              className={`p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border transition-all ${
                currentVal === 'YES'
                  ? 'border-emerald-300 dark:border-emerald-800 shadow-xs'
                  : currentVal === 'NO'
                  ? 'border-rose-300 dark:border-rose-800 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Question Info with Easy-to-read Hindi typography */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
                      {q.sequence}
                    </span>
                    {q.categoryEn && q.categoryEn !== 'General' && (
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        {q.categoryEn}
                      </span>
                    )}
                    {!isAnswered ? (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded font-mono border border-amber-200 dark:border-amber-900">
                        PENDING ANSWER
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded font-mono">
                        ANSWERED
                      </span>
                    )}
                  </div>

                  {/* Prominent Question Text */}
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                    {q.textHi || q.textEn}
                  </h4>

                  {/* English Question Text only if distinct */}
                  {q.textEn && q.textEn !== q.textHi && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-normal">
                      {q.textEn}
                    </p>
                  )}

                  {(q.helperHi || q.helperEn) && (
                    <p className="text-[11px] text-slate-500 italic pt-0.5">
                      टिप्पणी / SOP: {q.helperHi || q.helperEn}
                    </p>
                  )}
                </div>

                {/* LARGE YES / NO BUTTONS (Mobile Touch Optimized) */}
                {q.optionsType !== 'STAFF_DETAILS' && (
                <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-0 border-slate-100 dark:border-slate-800">
                  {/* Option: YES */}
                  <button
                    type="button"
                    onClick={() => onQuestionResponseChange(q.id, 'YES')}
                    className={`min-h-[50px] sm:min-h-[54px] min-w-[105px] sm:min-w-[125px] px-4 py-2.5 rounded-xl flex items-center justify-center gap-2.5 font-bold text-sm transition-all select-none border active:scale-95 cursor-pointer ${
                      currentVal === 'YES'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${currentVal === 'YES' ? 'border-white bg-white text-emerald-600' : 'border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-900'}`}>
                      {currentVal === 'YES' && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                    </div>
                    <span className="tracking-wide">YES</span>
                  </button>

                  {/* Option: NO */}
                  <button
                    type="button"
                    onClick={() => onQuestionResponseChange(q.id, 'NO')}
                    className={`min-h-[50px] sm:min-h-[54px] min-w-[105px] sm:min-w-[125px] px-4 py-2.5 rounded-xl flex items-center justify-center gap-2.5 font-bold text-sm transition-all select-none border active:scale-95 cursor-pointer ${
                      currentVal === 'NO'
                        ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-600/25 ring-2 ring-rose-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${currentVal === 'NO' ? 'border-white bg-white text-rose-600' : 'border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-900'}`}>
                      {currentVal === 'NO' && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                    </div>
                    <span className="tracking-wide">NO</span>
                  </button>
                </div>
                )}
              </div>

              {/* STAFF_DETAILS: Manpower roster pre-fill + Add New */}
              {q.optionsType === 'STAFF_DETAILS' && (() => {
                const entries = getStaffEntries(q.id);
                const suggestions = getManpowerSuggestions(q);

                return (
                  <div className="mt-4 space-y-3">
                    {/* Header count badge */}
                    <div className="flex items-center gap-2 px-1">
                      <Users className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Staff Present:
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-black font-mono">
                        {entries.length}
                      </span>
                    </div>

                    {/* Manpower roster suggestions (pre-filled from Admin upload) */}
                    {suggestions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                          Roster se select karein (tick = present):
                        </p>
                        {suggestions.map((mp, si) => {
                          const isChecked = entries.some(
                            (s) => s.mobile === mp.contactPhone && s.name === mp.contactName
                          );
                          return (
                            <button
                              key={si}
                              type="button"
                              onClick={() => handleToggleManpowerEntry(q.id, mp, !isChecked)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 transition-all active:scale-[0.98] cursor-pointer text-left ${
                                isChecked
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                                isChecked
                                  ? 'bg-emerald-500 border-emerald-500'
                                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'
                              }`}>
                                {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                              </div>
                              <div className="flex-1 min-w-0 flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{mp.contactName || '—'}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 truncate shrink-0">{mp.designation}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Manually added extra staff (not from roster) */}
                    {entries
                      .map((entry, idx) => ({ entry, idx }))
                      .filter(({ entry }) => !suggestions.some(
                        (mp) => mp.contactPhone === entry.mobile && mp.contactName === entry.name
                      ))
                      .map(({ entry, idx }) => (
                        <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">New Staff #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveStaff(q.id, idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-2.5">
                            <div className="relative">
                              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                value={entry.name}
                                onChange={(e) => handleStaffFieldChange(q.id, idx, 'name', e.target.value)}
                                placeholder="Staff Name (नाम)*"
                                className="w-full pl-9 pr-3 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            </div>
                            <div className="relative">
                              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="tel"
                                inputMode="numeric"
                                value={entry.mobile}
                                onChange={(e) => handleStaffFieldChange(q.id, idx, 'mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="Mobile Number (10 digits)"
                                className="w-full pl-9 pr-3 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    }

                    {/* Add New Staff button */}
                    <button
                      type="button"
                      onClick={() => handleAddNewStaff(q.id)}
                      className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 font-bold text-sm hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer active:scale-[0.98]"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Naya Staff Add Karein</span>
                    </button>
                  </div>
                );
              })()}

              {/* Optional Question-specific Remark / Note */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  <MessageSquare className="w-3 h-3 text-amber-500" />
                  <span>
                    {language === 'hi'
                      ? 'इस प्रश्न पर रिमार्क्स / टिप्पणी (वैकल्पिक):'
                      : 'Remark / Observation for this question (Optional):'}
                  </span>
                  {currentVal === 'NO' && (
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-900">
                      {language === 'hi' ? 'कमी का कारण लिखें' : 'Specify deficiency'}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={questionRemarks[q.id] || ''}
                  onChange={(e) => onQuestionRemarkChange?.(q.id, e.target.value)}
                  placeholder={
                    currentVal === 'NO'
                      ? (language === 'hi' ? 'यहाँ कमी या आवश्यक कार्यवाही का विवरण दर्ज करें...' : 'Note deficiency or pending resolution...')
                      : (language === 'hi' ? 'यदि कोई विशेष टिप्पणी या विवरण हो तो यहाँ लिखें (वैकल्पिक)...' : 'Add any observation for this checkpoint (optional)...')
                  }
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </div>
          );
        })}
      </div>
    )}

      {/* ================= BEFORE SUBMISSION: REMARKS & SUBMISSION (Only shown if active questions exist) ================= */}
      {activeQuestions.length > 0 && (
        <>
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>REMARKS (OPTIONAL)</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Remarks are not mandatory</span>
            </div>

            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter any additional observations, notes, or center specific comments (optional)..."
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Answer status alert */}
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
              allAnswered
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {allAnswered ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <span className="font-semibold">
                {allAnswered
                  ? `All ${activeQuestions.length} questions answered. You may proceed to submit.`
                  : `${unansweredQuestions.length} of ${activeQuestions.length} questions remaining. All questions must be answered.`}
              </span>
            </div>

            <span className="font-mono font-bold self-end sm:self-auto">
              {answeredCount} / {activeQuestions.length} Answered
            </span>
          </div>

          {/* ================= SUBMIT SURVEY BUTTON ================= */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handlePreSubmit}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-800 hover:to-indigo-800 text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-blue-950/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 border border-blue-700/60 cursor-pointer"
            >
              <FileCheck2 className="w-5 h-5 text-amber-400" />
              <span className="tracking-wide">SUBMIT SURVEY</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
