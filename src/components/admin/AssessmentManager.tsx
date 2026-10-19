import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Users,
  Copy,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  HelpCircle,
  Search,
  Sparkles,
  Layers,
  FileCheck2,
  Clock,
  Check,
  X,
  AlertCircle,
  Tag,
  Eye,
  EyeOff
} from 'lucide-react';
import { Assessment, SurveyQuestion, Language, AssessmentType } from '../../types/survey';
import {
  MOCK_DAY_TEMPLATE_QUESTIONS,
  EXAM_DAY_TEMPLATE_QUESTIONS
} from '../../data/defaultAssessments';

interface AssessmentManagerProps {
  assessments: Assessment[];
  onUpdateAssessments: (assessments: Assessment[]) => void;
  language: Language;
}

export const AssessmentManager: React.FC<AssessmentManagerProps> = ({
  assessments,
  onUpdateAssessments,
  language
}) => {
  // Current view: either list of assessments (null) or managing questions of a specific assessment (assessmentId)
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  // Assessment Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);

  // New Assessment Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formTitleHi, setFormTitleHi] = useState('');
  const [formType, setFormType] = useState<AssessmentType>('mock_day');
  const [formExamName, setFormExamName] = useState('UPSSSC PET 2026');
  const [formDate, setFormDate] = useState('25 OCT 2026');
  const [formShifts, setFormShifts] = useState('TWO SHIFTS');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formTemplateChoice, setFormTemplateChoice] = useState<'empty' | 'mock_day' | 'exam_day'>('mock_day');

  // Question Editor State inside Selected Assessment
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionStatusFilter, setQuestionStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);

  // Question Form Fields
  const [newTextHi, setNewTextHi] = useState('');
  const [newTextEn, setNewTextEn] = useState('');
  const [newCategoryEn, setNewCategoryEn] = useState('General Inspection');
  const [newCategoryHi, setNewCategoryHi] = useState('सामान्य निरीक्षण');
  const [newOptionsType, setNewOptionsType] = useState<'YES_NO' | 'STAFF_DETAILS'>('YES_NO');
  const [newIsActive, setNewIsActive] = useState(true);

  const selectedAssessment = assessments.find((a) => a.id === selectedAssessmentId);

  // ================= ASSESSMENT HANDLERS =================
  const handleOpenCreate = () => {
    setFormTitle('');
    setFormTitleHi('');
    setFormType('mock_day');
    setFormExamName('UPSSSC PET 2026');
    setFormDate('25 OCT 2026');
    setFormShifts('TWO SHIFTS');
    setFormDescription('');
    setFormIsActive(true);
    setFormTemplateChoice('mock_day');
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (a: Assessment, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAssessment(a);
    setFormTitle(a.title);
    setFormTitleHi(a.titleHi || '');
    setFormType(a.type);
    setFormExamName(a.examName);
    setFormDate(a.scheduledDate);
    setFormShifts(a.shifts || 'TWO SHIFTS');
    setFormDescription(a.description || '');
    setFormIsActive(a.isActive);
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingAssessment) {
      // Update
      const updated = assessments.map((a) => {
        if (a.id === editingAssessment.id) {
          return {
            ...a,
            title: formTitle.trim(),
            titleHi: formTitleHi.trim() || formTitle.trim(),
            type: formType,
            examName: formExamName.trim(),
            scheduledDate: formDate.trim(),
            shifts: formShifts.trim(),
            description: formDescription.trim(),
            isActive: formIsActive,
            updatedAt: new Date().toISOString()
          };
        }
        return a;
      });
      onUpdateAssessments(updated);
      setEditingAssessment(null);
    } else {
      // Create new
      let initialQuestions: SurveyQuestion[] = [];
      if (formTemplateChoice === 'mock_day') {
        initialQuestions = JSON.parse(JSON.stringify(MOCK_DAY_TEMPLATE_QUESTIONS));
      } else if (formTemplateChoice === 'exam_day') {
        initialQuestions = JSON.parse(JSON.stringify(EXAM_DAY_TEMPLATE_QUESTIONS));
      }

      const newId = `assessment_${Date.now().toString(36)}`;
      const newAssessment: Assessment = {
        id: newId,
        title: formTitle.trim(),
        titleHi: formTitleHi.trim() || formTitle.trim(),
        type: formType,
        examName: formExamName.trim() || 'UPSSSC PET 2026',
        scheduledDate: formDate.trim() || '25 OCT 2026',
        shifts: formShifts.trim() || 'TWO SHIFTS',
        description: formDescription.trim(),
        isActive: formIsActive,
        questions: initialQuestions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updated = [...assessments, newAssessment];
      onUpdateAssessments(updated);
      setIsCreateModalOpen(false);
      // Automatically navigate to questions management for the newly created assessment
      setSelectedAssessmentId(newId);
    }
  };

  const handleToggleAssessmentActive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = assessments.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a));
    onUpdateAssessments(updated);
  };

  const handleDeleteAssessment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this assessment?')) {
      const updated = assessments.filter((a) => a.id !== id);
      onUpdateAssessments(updated);
      if (selectedAssessmentId === id) setSelectedAssessmentId(null);
    }
  };

  const handleDuplicateAssessment = (a: Assessment, e: React.MouseEvent) => {
    e.stopPropagation();
    const cloned: Assessment = {
      ...a,
      id: `assessment_${Date.now().toString(36)}`,
      title: `${a.title} (Copy)`,
      titleHi: a.titleHi ? `${a.titleHi} (प्रति)` : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onUpdateAssessments([...assessments, cloned]);
  };

  // ================= QUESTION HANDLERS FOR CURRENT ASSESSMENT =================
  const updateQuestionsInCurrentAssessment = (questions: SurveyQuestion[]) => {
    if (!selectedAssessmentId) return;
    const updated = assessments.map((a) => {
      if (a.id === selectedAssessmentId) {
        return {
          ...a,
          questions,
          questionIds: questions.map((q) => q.id), // ← keep questionIds in sync
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    });
    onUpdateAssessments(updated);
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTextHi.trim() || !selectedAssessment) return;

    const currentQuestions = selectedAssessment.questions || [];
    const maxSeq = currentQuestions.reduce((max, q) => Math.max(max, q.sequence || 0), 0);

    const newQ: SurveyQuestion = {
      id: `q_${Date.now().toString(36)}`,
      sequence: maxSeq + 1,
      textHi: newTextHi.trim(),
      textEn: newTextEn.trim() || newTextHi.trim(),
      categoryEn: newCategoryEn.trim() || 'General Inspection',
      categoryHi: newCategoryHi.trim() || 'सामान्य निरीक्षण',
      optionsType: newOptionsType,
      isActive: newIsActive,
      assessmentId: selectedAssessment.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    updateQuestionsInCurrentAssessment([...currentQuestions, newQ]);
    setNewTextHi('');
    setNewTextEn('');
    setNewOptionsType('YES_NO');
    setIsAddQuestionModalOpen(false);
  };

  const handleUpdateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !selectedAssessment) return;

    const currentQuestions = selectedAssessment.questions || [];
    const updated = currentQuestions.map((q) =>
      q.id === editingQuestion.id ? { ...editingQuestion, updatedAt: new Date().toISOString() } : q
    );
    updateQuestionsInCurrentAssessment(updated);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!selectedAssessment) return;
    const currentQuestions = selectedAssessment.questions || [];
    const filtered = currentQuestions
      .filter((q) => q.id !== questionId)
      .map((q, idx) => ({ ...q, sequence: idx + 1 }));
    updateQuestionsInCurrentAssessment(filtered);
  };

  const handleToggleQuestionActive = (questionId: string) => {
    if (!selectedAssessment) return;
    const currentQuestions = selectedAssessment.questions || [];
    const updated = currentQuestions.map((q) =>
      q.id === questionId ? { ...q, isActive: !q.isActive } : q
    );
    updateQuestionsInCurrentAssessment(updated);
  };

  const handleMoveSequence = (index: number, direction: 'up' | 'down') => {
    if (!selectedAssessment) return;
    const currentQuestions = [...(selectedAssessment.questions || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentQuestions.length) return;

    const temp = currentQuestions[index];
    currentQuestions[index] = currentQuestions[targetIndex];
    currentQuestions[targetIndex] = temp;

    const resequenced = currentQuestions.map((q, idx) => ({
      ...q,
      sequence: idx + 1
    }));
    updateQuestionsInCurrentAssessment(resequenced);
  };

  const handleLoadTemplateQuestions = (templateType: 'mock_day' | 'exam_day') => {
    const template =
      templateType === 'mock_day' ? MOCK_DAY_TEMPLATE_QUESTIONS : EXAM_DAY_TEMPLATE_QUESTIONS;
    updateQuestionsInCurrentAssessment(JSON.parse(JSON.stringify(template)));
  };

  const handleClearAllQuestions = () => {
    if (confirm('Clear all questions in this assessment?')) {
      updateQuestionsInCurrentAssessment([]);
    }
  };

  // Helper for type badges
  const getTypeBadge = (type: AssessmentType) => {
    switch (type) {
      case 'mock_day':
        return {
          label: 'MOCK DAY',
          labelHi: 'मॉक डे',
          bg: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        };
      case 'exam_day':
        return {
          label: 'EXAM DAY',
          labelHi: 'परीक्षा दिवस',
          bg: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
        };
      case 'dry_run':
        return {
          label: 'DRY RUN',
          labelHi: 'ड्राई रन',
          bg: 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
        };
      case 'shift_audit':
        return {
          label: 'SHIFT AUDIT',
          labelHi: 'पाली निरीक्षण',
          bg: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
        };
      default:
        return {
          label: 'CUSTOM AUDIT',
          labelHi: 'कस्टम',
          bg: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
        };
    }
  };

  // ================= VIEW 1: ASSESSMENTS LIST =================
  if (!selectedAssessmentId) {
    return (
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                <Layers className="w-5 h-5" />
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Assessment Master & Questionnaires (असेसमेंट प्रबंधन)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Create Mock Day, Exam Day, or custom inspection assessments. Each assessment contains its own YES/NO questionnaire and automatically shows up on CSO mobile login.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-5 py-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-400 stroke-[3]" />
            <span>Create New Assessment</span>
          </button>
        </div>

        {/* Assessment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessments.length === 0 ? (
            <div className="col-span-full p-10 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
              <Layers className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                No Assessments Created Yet
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click "+ Create New Assessment" to create your first inspection audit (e.g. Mock Day or Exam Day).
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create Assessment Now</span>
              </button>
            </div>
          ) : (
            assessments.map((a) => {
              const badge = getTypeBadge(a.type);
              const totalQ = a.questions?.length || 0;
              const activeQ = a.questions?.filter((q) => q.isActive).length || 0;

              return (
                <div
                  key={a.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 transition-all shadow-sm flex flex-col justify-between gap-4 ${
                    a.isActive
                      ? 'border-slate-200 dark:border-slate-800 hover:border-blue-400/60'
                      : 'border-slate-200/60 dark:border-slate-800/60 opacity-75 bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Type Badge + Status Toggle */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}
                      >
                        {badge.label}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleToggleAssessmentActive(a.id, e)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                          a.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                        }`}
                        title={a.isActive ? 'Active on CSO Login' : 'Hidden from CSO Login'}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            a.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {a.isActive ? 'Active (CSO Visible)' : 'Inactive (Draft)'}
                      </button>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {a.titleHi || a.title}
                      </h4>
                      {a.titleHi && a.titleHi !== a.title && (
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                          {a.title}
                        </p>
                      )}
                      {a.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                          {a.description}
                        </p>
                      )}
                    </div>

                    {/* Meta Info: Exam Date, Shifts, Questions Count */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800 font-mono">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Scheduled:</span>
                        <strong className="text-slate-700 dark:text-slate-200">{a.scheduledDate}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Questions:</span>
                        <strong className="text-blue-600 dark:text-blue-400">
                          {activeQ} Active <span className="text-slate-400 font-normal">({totalQ} Total)</span>
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAssessmentId(a.id)}
                      className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Manage Questions ({totalQ})</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEdit(a, e)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDuplicateAssessment(a, e)}
                        className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        title="Duplicate Assessment"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteAssessment(a.id, e)}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer"
                        title="Delete Assessment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ================= MODAL: CREATE / EDIT ASSESSMENT ================= */}
        {(isCreateModalOpen || editingAssessment) && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>{editingAssessment ? 'Edit Assessment' : 'Create New Assessment'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingAssessment(null);
                  }}
                  className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAssessment} className="space-y-4 text-xs">
                {/* Title (English) */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assessment Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Mock Day Assessment or Exam Day Assessment"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Title (Hindi) */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    असेसमेंट शीर्षक (हिंदी)
                  </label>
                  <input
                    type="text"
                    value={formTitleHi}
                    onChange={(e) => setFormTitleHi(e.target.value)}
                    placeholder="उदा. मॉक डे असेसमेंट अथवा परीक्षा दिवस असेसमेंट"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Type & Date Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Assessment Type
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold cursor-pointer"
                    >
                      <option value="mock_day">Mock Day (मॉक डे)</option>
                      <option value="exam_day">Exam Day (परीक्षा दिवस)</option>
                      <option value="dry_run">Dry Run / Audit</option>
                      <option value="shift_audit">Shift Inspection</option>
                      <option value="custom">Custom Checklist</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Scheduled Date
                    </label>
                    <input
                      type="text"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      placeholder="e.g. 25 OCT 2026 or 30 OCT 2026"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Exam Name & Shifts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Exam Name
                    </label>
                    <input
                      type="text"
                      value={formExamName}
                      onChange={(e) => setFormExamName(e.target.value)}
                      placeholder="e.g. UPSSSC PET 2026"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Shifts
                    </label>
                    <input
                      type="text"
                      value={formShifts}
                      onChange={(e) => setFormShifts(e.target.value)}
                      placeholder="e.g. TWO SHIFTS"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Instructions / Description
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief description or instructions for the CSO..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Template Questions Option on Create */}
                {!editingAssessment && (
                  <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Initial Questions Setup:</span>
                    </span>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tplChoice"
                          checked={formTemplateChoice === 'mock_day'}
                          onChange={() => setFormTemplateChoice('mock_day')}
                          className="text-blue-600"
                        />
                        <span className="text-slate-700 dark:text-slate-300">
                          Pre-fill standard <strong>Mock Day Inspection Checklist</strong> (8 questions)
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tplChoice"
                          checked={formTemplateChoice === 'exam_day'}
                          onChange={() => setFormTemplateChoice('exam_day')}
                          className="text-blue-600"
                        />
                        <span className="text-slate-700 dark:text-slate-300">
                          Pre-fill standard <strong>Exam Day Security & Jammer Checklist</strong> (7 questions)
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tplChoice"
                          checked={formTemplateChoice === 'empty'}
                          onChange={() => setFormTemplateChoice('empty')}
                          className="text-blue-600"
                        />
                        <span className="text-slate-700 dark:text-slate-300">
                          Start with empty questionnaire (add questions manually)
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Active Toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="formIsActiveCheck"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label
                    htmlFor="formIsActiveCheck"
                    className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    Active (Show on CSO Login profile immediately)
                  </label>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingAssessment(null);
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md cursor-pointer"
                  >
                    {editingAssessment ? 'Save Changes' : 'Create Assessment & Add Questions'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= VIEW 2: QUESTIONS MANAGER FOR SELECTED ASSESSMENT =================
  const currentQuestions = selectedAssessment?.questions || [];
  const typeBadge = getTypeBadge(selectedAssessment?.type || 'mock_day');

  const filteredQuestions = currentQuestions.filter((q) => {
    if (questionStatusFilter === 'active' && !q.isActive) return false;
    if (questionStatusFilter === 'inactive' && q.isActive) return false;
    if (questionSearch.trim()) {
      const s = questionSearch.toLowerCase();
      return (
        (q.textHi && q.textHi.toLowerCase().includes(s)) ||
        (q.textEn && q.textEn.toLowerCase().includes(s)) ||
        (q.categoryHi && q.categoryHi.toLowerCase().includes(s))
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Assessment Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setSelectedAssessmentId(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 mb-1 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to All Assessments</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${typeBadge.bg}`}>
              {typeBadge.label}
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {selectedAssessment?.titleHi || selectedAssessment?.title}
            </h3>
          </div>

          <div className="text-xs text-slate-500 font-mono flex items-center gap-3 pt-0.5">
            <span>Exam: <strong>{selectedAssessment?.examName}</strong></span>
            <span>·</span>
            <span>Date: <strong>{selectedAssessment?.scheduledDate}</strong></span>
            <span>·</span>
            <span>
              Total Questions: <strong className="text-blue-600">{currentQuestions.length}</strong>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {currentQuestions.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllQuestions}
              className="px-3 py-2.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Questions</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddQuestionModalOpen(true)}
            className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400 stroke-[3]" />
            <span>Add New Question</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      {currentQuestions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={questionSearch}
              onChange={(e) => setQuestionSearch(e.target.value)}
              placeholder="Search survey questions in this assessment..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={questionStatusFilter}
            onChange={(e) => setQuestionStatusFilter(e.target.value as any)}
            aria-label="Filter questions by status"
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        {currentQuestions.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 mx-auto flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                No Questions in "{selectedAssessment?.titleHi || selectedAssessment?.title}"
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                Add custom YES/NO survey inspection questions for this assessment. Any active questions will immediately appear when CSOs open this assessment.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddQuestionModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question Manually</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleLoadTemplateQuestions(
                    selectedAssessment?.type === 'exam_day' ? 'exam_day' : 'mock_day'
                  )
                }
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load {selectedAssessment?.type === 'exam_day' ? 'Exam Day' : 'Mock Day'} Template</span>
              </button>
            </div>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                q.isActive
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-slate-200/60 dark:border-slate-800/60 opacity-60 bg-slate-50/50'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                {/* Sequence Badge */}
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">
                  #{q.sequence}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {q.optionsType === 'STAFF_DETAILS' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Staff Details (Count + Name/Mobile)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Options: YES / NO
                      </span>
                    )}

                    {q.isActive ? (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active (Visible in Survey)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Inactive (Hidden)
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {q.textHi || q.textEn}
                  </p>

                  {q.textEn && q.textEn !== q.textHi && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {q.textEn}
                    </p>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveSequence(idx, 'up')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  disabled={idx === currentQuestions.length - 1}
                  onClick={() => handleMoveSequence(idx, 'down')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleQuestionActive(q.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    q.isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {q.isActive ? 'Active' : 'Hidden'}
                </button>

                <button
                  type="button"
                  onClick={() => setEditingQuestion(q)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="Edit question text"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                  title="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= MODAL: ADD QUESTION ================= */}
      {isAddQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Add Question to {selectedAssessment?.titleHi || selectedAssessment?.title}
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
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  सर्वेक्षण प्रश्न (Survey Question) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newTextHi}
                  onChange={(e) => setNewTextHi(e.target.value)}
                  placeholder="यहाँ प्रश्न दर्ज करें (उदा. क्या परीक्षा दिवस पर मोबाइल जैमर्स सक्रिय हैं?)"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Question in English (Optional)
                </label>
                <input
                  type="text"
                  value={newTextEn}
                  onChange={(e) => setNewTextEn(e.target.value)}
                  placeholder="e.g. Are mobile signal jammers functional and verified?"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  Response Type / उत्तर का प्रकार *
                </span>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer flex-1 p-2.5 rounded-xl border-2 transition-all bg-white dark:bg-slate-900"
                    style={{ borderColor: newOptionsType === 'YES_NO' ? '#2563eb' : '#e2e8f0' }}>
                    <input
                      type="radio"
                      name="optionsType"
                      checked={newOptionsType === 'YES_NO'}
                      onChange={() => setNewOptionsType('YES_NO')}
                      className="text-blue-600"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">YES / NO</span>
                      <span className="text-[10px] text-slate-500">Simple yes or no answer</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer flex-1 p-2.5 rounded-xl border-2 transition-all bg-white dark:bg-slate-900"
                    style={{ borderColor: newOptionsType === 'STAFF_DETAILS' ? '#2563eb' : '#e2e8f0' }}>
                    <input
                      type="radio"
                      name="optionsType"
                      checked={newOptionsType === 'STAFF_DETAILS'}
                      onChange={() => setNewOptionsType('STAFF_DETAILS')}
                      className="text-blue-600"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Staff Details</span>
                      <span className="text-[10px] text-slate-500">Count + Name & Mobile of each staff</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeNewQ"
                  checked={newIsActive}
                  onChange={(e) => setNewIsActive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="activeNewQ" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Activate immediately (make visible in this assessment survey)
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Edit Question #{editingQuestion.sequence}
              </h4>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
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

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Question in English (Optional)
                </label>
                <input
                  type="text"
                  value={editingQuestion.textEn || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, textEn: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeEditQ"
                  checked={editingQuestion.isActive}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, isActive: e.target.checked })
                  }
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="activeEditQ" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Active (Visible in Survey)
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
    </div>
  );
};
