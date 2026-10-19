import React from 'react';
import { ShieldCheck, Globe, LogOut, Building2 } from 'lucide-react';
import { CSOProfile, Language } from '../types/survey';

interface HeaderProps {
  csoProfile: CSOProfile | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  isAdminActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  csoProfile,
  language,
  onLanguageChange,
  onOpenAdmin,
  onLogout,
  isAdminActive = false
}) => {
  return (
    <header className="sticky top-0 z-40 bg-blue-950 text-white border-b border-blue-900 shadow-md">
      {/* Top micro administrative stripe */}
      <div className="bg-blue-900/70 px-4 py-1 text-[11px] font-medium text-blue-200 border-b border-blue-800/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="font-black text-amber-400 tracking-wider">SSSG SOLUTIONS</span>
            <span className="opacity-60">·</span>
            <span className="truncate">
              {language === 'hi'
                ? 'यूपीएसएसएससी पीईटी 2026 · परीक्षा केंद्र मॉक डे सर्वेक्षण पोर्टल'
                : 'UPSSSC PET 2026 · Examination Centre Survey Portal'}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onLanguageChange(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1 text-[11px] font-medium text-amber-300 hover:text-white px-2 py-0.5 rounded transition-colors cursor-pointer"
              title="Toggle Language"
            >
              <Globe className="w-3 h-3" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400 shadow-inner">
            <Building2 className="w-5 h-5 text-amber-400" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-amber-400 tracking-wider text-xs uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                SSSG SOLUTIONS
              </span>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                CSO CENTRE SURVEY PORTAL
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-blue-200/90 truncate">
              {language === 'hi'
                ? 'उ०प्र० अधीनस्थ सेवा चयन आयोग · पीईटी 2026'
                : 'UPSSSC PET 2026 · Mock Day Examination Readiness'}
            </p>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Admin Panel button is ONLY shown on Login page or when Admin is active - NOT inside CSO profile */}
          {!csoProfile && (
            <button
              onClick={onOpenAdmin}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border whitespace-nowrap shadow-xs cursor-pointer ${
                isAdminActive
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                  : 'text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/40'
              }`}
              title="Open Commission Admin Console"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAdminActive ? 'Exit Admin' : 'Admin Panel'}</span>
            </button>
          )}

          {/* Inside CSO Profile: STRICTLY only Logout button. Absolutely NO switch option! */}
          {csoProfile && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-bold text-slate-200 truncate max-w-[180px]">
                  {csoProfile.csoName || csoProfile.name}
                </span>
                <span className="text-[10px] text-amber-300/90 font-mono">
                  {csoProfile.districtName || csoProfile.district}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-rose-200 hover:text-white bg-rose-600/30 hover:bg-rose-600 border border-rose-500/50 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Log out from CSO Portal"
                aria-label="Log out"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                <span>{language === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
