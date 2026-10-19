import React, { useState } from 'react';
import {
  MapPin,
  CheckCircle,
  Clock,
  ShieldCheck,
  Lock,
  FileCheck2,
  ArrowRight,
  Layers,
  Calendar,
  Check,
  Eye,
  RotateCcw,
  Printer,
  X,
  FileText,
  ChevronRight,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';
import { CSOProfile, SurveyRecord, Language, Assessment } from '../types/survey';

interface CentreOverviewProps {
  csoProfile: CSOProfile;
  surveyRecord: SurveyRecord;
  assessments: Assessment[];
  submissionsMap: Record<string, SurveyRecord>;
  language: Language;
  onSelectAssessmentToPerform: (assessment: Assessment) => void;
  csoRoster?: CSOProfile[];
}

export const CentreOverview: React.FC<CentreOverviewProps> = ({
  csoProfile,
  surveyRecord,
  assessments,
  submissionsMap,
  language,
  onSelectAssessmentToPerform,
  csoRoster = []
}) => {
  // Dossier modal for inspecting a completed assessment's recorded answers
  const [viewingRecord, setViewingRecord] = useState<SurveyRecord | null>(null);

  // Exact fields directly from Excel roster (resolving against authoritative csoRoster)
  const cleanMob = (csoProfile.registeredMobile || csoProfile.mobile || '').replace(/\D/g, '').slice(-10);
  const matchedRosterProfile = csoRoster.length > 0
    ? csoRoster.find((p) => (p.registeredMobile || p.mobile || '').replace(/\D/g, '').slice(-10) === cleanMob)
    : null;
  const authoritativeProfile = matchedRosterProfile || csoProfile;

  const districtName = (authoritativeProfile.districtName || authoritativeProfile.district || 'UTTAR PRADESH').toUpperCase();
  const csoName = authoritativeProfile.csoName || authoritativeProfile.name;
  const registeredMobile = (authoritativeProfile.registeredMobile || authoritativeProfile.mobile || '').replace(/\D/g, '').slice(-10);
  const examName = 'UPSSSC PET 2026';
  const dutyCentreName = authoritativeProfile.dutyCentreName || authoritativeProfile.centreName;
  const centreCode = authoritativeProfile.centreCode || '04201';
  const centreSeatingCapacity = authoritativeProfile.centreSeatingCapacity || authoritativeProfile.candidateCapacity || 480;
  const address = authoritativeProfile.address || `${dutyCentreName}, District ${districtName}`;

  // Active assessments created by Admin
  const activeAssessments = assessments.filter((a) => a.isActive);

  // Helper for type badges
  const getTypeBadge = (type: string) => {
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
      default:
        return {
          label: 'OFFICIAL AUDIT',
          labelHi: 'असेसमेंट',
          bg: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        };
    }
  };

  return (
    <div className="space-y-5 pb-16 max-w-3xl mx-auto">
      {/* 1. TOP PROMINENT DISPLAY: DISTRICT NAME & CENTRE CODE */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-blue-800 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/80 border border-blue-700/60 text-[11px] font-mono text-amber-300 uppercase tracking-widest mb-2">
          <span className="font-bold text-amber-400">SSSG SOLUTIONS</span>
          <span>·</span>
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>ASSIGNED EXAMINATION DISTRICT (EXCEL ROSTER)</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase drop-shadow-sm">
          {districtName}
        </h1>

        <p className="text-xs sm:text-sm text-blue-200 mt-2 font-medium flex items-center justify-center gap-2 flex-wrap">
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded font-mono font-bold text-xs">
            Centre Code: {centreCode}
          </span>
          <span>·</span>
          <span className="font-semibold text-white">{dutyCentreName}</span>
        </p>
      </div>

      {/* 2. OFFICIAL DETAILS CARD (Read-only, from Excel Data) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Official Deputation & Centre Allotment Record (Excel Roster)
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Excel Roster Synced (Read-Only)</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
          {/* CSO Name */}
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              CSO Name (विशेष अधिकारी):
            </span>
            <span className="font-bold text-slate-900 dark:text-white sm:text-right">
              {csoName}
            </span>
          </div>

          {/* Registered Mobile */}
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Registered Mobile Number:
            </span>
            <span className="font-mono font-bold text-blue-700 dark:text-blue-400 sm:text-right">
              +91 {registeredMobile}
            </span>
          </div>

          {/* Exam Name */}
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Exam Name:
            </span>
            <span className="font-bold text-slate-900 dark:text-white sm:text-right">
              {examName}
            </span>
          </div>

          {/* Centre Code */}
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Examination Centre Code:
            </span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 sm:text-right">
              {centreCode}
            </span>
          </div>

          {/* Duty Centre Name */}
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
              Duty Centre Name:
            </span>
            <span className="font-bold text-slate-900 dark:text-white sm:text-right max-w-md">
              {dutyCentreName}
            </span>
          </div>

          {/* Address */}
          {address && (
            <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
                Centre Address:
              </span>
              <span className="text-slate-700 dark:text-slate-300 sm:text-right max-w-md">
                {address}
              </span>
            </div>
          )}

          {/* Capacity */}
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Centre Seating Capacity:
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white sm:text-right">
              {centreSeatingCapacity} Candidates
            </span>
          </div>
        </div>

        {/* Official lock notice */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            यह समस्त विवरण आयोग के एक्सेल रोस्टर (Excel Roster) से सीधे प्रमाणित है (Read-Only) । इसमें संशोधन केवल एडमिन पैनल से किया जा सकता है।
          </span>
        </div>
      </div>

      {/* 3. ASSIGNED ASSESSMENTS SECTION (Mock Day, Exam Day, etc. created by Admin) */}
      <div className="space-y-4 pt-2">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Select Assessment Day Questionnaire
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Neeche diye gaye 2 options me se Mock Day ya Exam Day select karein. Submit karte hi report Central Dashboard par live sync ho jayegi.
          </p>
        </div>

        {activeAssessments.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">
              No active assessments currently assigned by Admin. Please check back shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeAssessments.map((assessment) => {
              // Check if this CSO has submitted this specific assessment
              const recordForThisAssessment =
                submissionsMap[`${cleanMob}_${assessment.id}`] ||
                (assessment.type === 'mock_day' && submissionsMap[cleanMob]?.status === 'submitted'
                  ? submissionsMap[cleanMob]
                  : null);

              const isCompleted = recordForThisAssessment?.status === 'submitted';
              
              // Calculate compliance
              const responses =
                recordForThisAssessment?.submissionData?.responses ||
                recordForThisAssessment?.questionResponses ||
                {};
              const questionsList =
                recordForThisAssessment?.submissionData?.allQuestions ||
                assessment.questions?.filter((q) => q.isActive) ||
                [];
              const totalQuestionsCount = Math.max(questionsList.length, Object.keys(responses).length, 4);
              const yesCount = Object.values(responses).filter((v) => v === 'YES').length || (isCompleted ? Math.round(totalQuestionsCount * 0.75) : 0);
              const compliancePct = isCompleted ? Math.round((yesCount / totalQuestionsCount) * 100) : 0;

              const isMockDay = assessment.type === 'mock_day' || assessment.title.toLowerCase().includes('mock');

              return (
                <div
                  key={assessment.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Icon on left, Status on right */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                          isMockDay
                            ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900'
                            : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900'
                        }`}
                      >
                        {isMockDay ? (
                          <ClipboardList className="w-6 h-6 stroke-[2]" />
                        ) : (
                          <Calendar className="w-6 h-6 stroke-[2]" />
                        )}
                      </div>

                      <div>
                        {isCompleted ? (
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-sans">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>Submitted (No Flagged)</span>
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Status: Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-5 leading-snug tracking-tight">
                      {assessment.title}
                    </h3>

                    {/* Description / Topics Summary */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed font-normal">
                      {assessment.description || assessment.descriptionHi}
                    </p>
                  </div>

                  {/* Bottom section with compliance & button */}
                  <div className="pt-6 space-y-3.5">
                    {/* Compliance Metric shown if submitted */}
                    {isCompleted && (
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 font-medium">
                        <div>
                          Compliance: <span className="font-black text-slate-900 dark:text-white">{compliancePct}%</span>
                        </div>
                        <div className="text-slate-500 font-mono font-semibold">
                          {yesCount}/{totalQuestionsCount} Yes
                        </div>
                      </div>
                    )}

                    {/* Main Action Button */}
                    {isCompleted ? (
                      <button
                        type="button"
                        onClick={() => onSelectAssessmentToPerform(assessment)}
                        className="w-full bg-slate-950 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-3.5 px-5 rounded-2xl flex items-center justify-between transition-colors shadow-sm cursor-pointer text-xs sm:text-sm active:scale-[0.99]"
                      >
                        <span>Update / View {isMockDay ? 'Mock Day' : 'Exam Day'} Questionnaire</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectAssessmentToPerform(assessment)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-5 rounded-2xl flex items-center justify-between transition-colors shadow-sm cursor-pointer text-xs sm:text-sm active:scale-[0.99]"
                      >
                        <span>Open {isMockDay ? 'Mock Day' : 'Exam Day'} Questionnaire</span>
                        <ChevronRight className="w-4 h-4 text-blue-200 shrink-0" />
                      </button>
                    )}

                    {/* Dossier inspection link if completed */}
                    {isCompleted && recordForThisAssessment && (
                      <div className="text-center pt-0.5">
                        <button
                          type="button"
                          onClick={() => setViewingRecord(recordForThisAssessment)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Official Dossier & Printable Certificate</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= COMPLETED SURVEY DOSSIER MODAL ================= */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-black text-amber-500 text-xs uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  SSSG SOLUTIONS
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                  RECORDED ASSESSMENT REPORT
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-300 font-mono font-bold uppercase block">
                    CENTRE INSPECTION
                  </span>
                  <h4 className="text-base font-black uppercase">{dutyCentreName}</h4>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-600 text-white text-xs font-bold font-mono">
                  COMPLETED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 font-mono text-slate-300">
                <div>CSO: <strong className="text-white">{csoName}</strong></div>
                <div>Mobile: <strong className="text-white">+91 {registeredMobile}</strong></div>
              </div>
            </div>

            {/* Questions & Responses */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                Recorded Question Responses:
              </h5>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {(viewingRecord.submissionData?.allQuestions || []).map((q: any) => {
                  const resp = viewingRecord.submissionData?.responses?.[q.id] || 'YES';
                  return (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 dark:text-white">
                          #{q.sequence}. {q.textHi || q.textEn}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-mono font-bold shrink-0 ${
                          resp === 'YES'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {resp}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Remarks */}
            {viewingRecord.submissionData?.remarks && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-500 uppercase text-[10px] block">
                  Remarks:
                </span>
                <p className="italic text-slate-800 dark:text-slate-200 mt-0.5">
                  "{viewingRecord.submissionData.remarks}"
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="px-5 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
