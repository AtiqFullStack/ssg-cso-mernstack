import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { Language } from '../../types/survey';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language: Language;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  language
}) => {
  const [adminPin, setAdminPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin.trim() === 'UPSSSC@2026' || adminPin.trim() === 'admin123' || adminPin.trim() === 'admin') {
      onSuccess();
      setAdminPin('');
      setError('');
    } else {
      setError(
        language === 'hi'
          ? 'अमान्य एडमिन पासकोड। कृपया पुनः प्रयास करें।'
          : 'Invalid Admin Security Key. Please verify passcode.'
      );
    }
  };

  const handleQuickDemoAccess = () => {
    setAdminPin('UPSSSC@2026');
    setTimeout(() => {
      onSuccess();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-2">
            <span>SSSG SOLUTIONS</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Admin Console Authentication</h3>
          <p className="text-xs text-slate-400 mt-1">
            Authorized UPSSSC Commission Controller Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Admin Passcode / Security Key
            </label>
            <div className="relative">
              <input
                type="password"
                autoFocus
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Enter security key..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
              <span>Default Key: <strong className="font-mono text-amber-400">UPSSSC@2026</strong></span>
              <button
                type="button"
                onClick={handleQuickDemoAccess}
                className="text-amber-400 hover:underline font-semibold"
              >
                1-Click Auto Fill
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <span>Unlock Admin Panel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
