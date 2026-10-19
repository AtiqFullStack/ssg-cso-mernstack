import React, { useState, useEffect } from 'react';
import { ShieldCheck, Phone, ArrowRight, Lock, AlertCircle, Building2, ShieldAlert, Sparkles, Upload, Wifi } from 'lucide-react';
import { CSOProfile, Language } from '../types/survey';
import { lookupCSOLive } from '../utils/apiSync';

interface LoginViewProps {
  onLoginSuccess: (profile: CSOProfile) => void;
  onOpenAdmin: () => void;
  csoRoster: CSOProfile[];
  language: Language;
  initialMobile?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onOpenAdmin,
  csoRoster,
  language,
  initialMobile = ''
}) => {
  const [mobileNumber, setMobileNumber] = useState(initialMobile);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialMobile) {
      const clean = initialMobile.replace(/\D/g, '').slice(-10);
      setMobileNumber(clean);
    }
  }, [initialMobile]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleaned = mobileNumber.replace(/\D/g, '').slice(-10);

    if (cleaned.length !== 10) {
      setErrorMessage(
        language === 'hi'
          ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।'
          : 'Please enter a valid 10-digit registered mobile number.'
      );
      return;
    }

    setIsLoading(true);

    try {
      // 1. First check live server database (ensures cross-device login works!)
      const liveResult = await lookupCSOLive(cleaned);
      if (liveResult.success && liveResult.cso) {
        setIsLoading(false);
        onLoginSuccess(liveResult.cso);
        return;
      }

      // 2. Fallback check local roster
      const matchedCSO = csoRoster.find((p) => {
        const pMob = (p.registeredMobile || p.mobile || '').replace(/\D/g, '').slice(-10);
        return pMob === cleaned;
      });

      setIsLoading(false);
      if (matchedCSO) {
        onLoginSuccess(matchedCSO);
      } else {
        setErrorMessage('Is Mobile Number se koi Centre registered nahi mila');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Is Mobile Number se koi Centre registered nahi mila');
    }
  };

  const handleSelectQuickRoster = (cso: CSOProfile) => {
    const mob = (cso.registeredMobile || cso.mobile).replace(/\D/g, '').slice(-10);
    setMobileNumber(mob);
    setErrorMessage('');
    onLoginSuccess(cso);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col justify-center items-center px-4 py-8 bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="w-full max-w-md">
        {/* Emblem & Portal Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>SSSG SOLUTIONS</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase drop-shadow-sm">
            {language === 'hi' ? 'केन्द्र विशेष अधिकारी लॉगिन' : 'CSO CENTRE SURVEY LOGIN'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto font-medium">
            {language === 'hi'
              ? 'उ०प्र० अधीनस्थ सेवा चयन आयोग — पीईटी 2026'
              : 'UPSSSC PET 2026 Examination Centre Mock Day Portal'}
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  {language === 'hi' ? 'पंजीकृत मोबाइल नंबर (Unique Login ID)' : 'Registered Mobile Number'}
                </label>
                <span className="text-[10px] text-amber-400 font-mono font-bold">Unique Login ID</span>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-mono text-sm">
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => {
                    setMobileNumber(e.target.value.replace(/\D/g, ''));
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Enter 10-digit registered number"
                  autoFocus
                  className="w-full pl-14 pr-4 py-3.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white font-mono text-base placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500 transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-1.5">
                {language === 'hi'
                  ? 'आयोग के एक्सेल डेटा में पंजीकृत 10 अंकों का मोबाइल नंबर दर्ज करें।'
                  : 'Enter the 10-digit mobile number registered in the uploaded Excel roster.'}
              </p>
            </div>

            {/* Error Message Display if number not registered */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs flex items-start gap-2.5 shadow-sm animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="font-bold leading-relaxed">
                  {errorMessage}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || mobileNumber.length < 10}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-600/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span className="text-sm font-bold">
                  {language === 'hi' ? 'डेटाबेस में जांच हो रही है...' : 'Verifying Roster Data...'}
                </span>
              ) : (
                <>
                  <span className="text-sm font-black tracking-wide">
                    {language === 'hi' ? 'सत्यापित करें एवं डैशबोर्ड खोलें' : 'VERIFY & OPEN CSO DASHBOARD'}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>

            {/* Excel Uploaded CSOs (or Empty State) */}
            <div className="pt-4 border-t border-slate-800">
              {/* <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'hi' ? 'एक्सेल रोस्टर में उपलब्ध अधिकारी:' : 'Uploaded Excel Roster:'}
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">
                  {csoRoster.length} Registered
                </span>
              </div> */}

              {/* {csoRoster.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-700 text-center space-y-2">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Abhi koi Centre registered nahi hai. Admin Console se Excel file upload karein ya CSO add karein.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Excel in Admin</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {csoRoster.map((cso) => {
                    const mob = (cso.registeredMobile || cso.mobile).replace(/\D/g, '').slice(-10);
                    const csoTitle = cso.csoName || cso.name;
                    const centre = cso.dutyCentreName || cso.centreName;
                    const dist = cso.districtName || cso.district;
                    const code = cso.centreCode || '';
                    const cap = cso.centreSeatingCapacity || cso.candidateCapacity || 480;

                    return (
                      <button
                        key={mob}
                        type="button"
                        onClick={() => handleSelectQuickRoster(cso)}
                        className="w-full text-left p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/60 transition-all group flex items-start justify-between gap-3 cursor-pointer shadow-xs"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-100 group-hover:text-amber-300 truncate flex items-center gap-1.5">
                            <span>{csoTitle}</span>
                            {code && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700/80 text-amber-300 font-bold">
                                #{code}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            <span className="text-amber-400/90 font-semibold">{dist}</span> · {centre}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 block">
                            +91 {mob}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
                            {cap} Seats
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )} */}
            </div>

            {/* Admin Console Shortcut */}
            <div className="pt-3 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={onOpenAdmin}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1.5 p-1 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Console: Survey Progress, Excel Upload & Questions</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security & Regulatory footer note */}
        <div className="mt-6 text-center text-[11px] text-slate-400 space-y-1">
          <p className="flex items-center justify-center gap-1.5 text-slate-400">
            <Lock className="w-3 h-3 text-amber-500" />
            <span>
              Restricted Portal · Access limited strictly to CSOs registered in Excel data.
            </span>
          </p>
          <p className="text-[11px] text-amber-400/90 font-bold tracking-wide">
            SSSG SOLUTIONS · UPSSSC PET 2026 CENTRE SURVEY SYSTEM
          </p>
        </div>
      </div>
    </div>
  );
};
