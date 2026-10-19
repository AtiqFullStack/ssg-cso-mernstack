import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  QrCode,
  Smartphone,
  Radio,
  Send,
  Users,
  PlayCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';
import { CSOProfile } from '../../types/survey';

interface CSOLiveLinkCardProps {
  csoRoster: CSOProfile[];
  completedCount: number;
  totalCount: number;
  onSwitchToCSOLogin?: () => void;
  onDirectTestCSO?: (cso: CSOProfile) => void;
}

export const CSOLiveLinkCard: React.FC<CSOLiveLinkCardProps> = ({
  csoRoster,
  completedCount,
  totalCount,
  onSwitchToCSOLogin,
  onDirectTestCSO
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedMobile, setSelectedMobile] = useState('');
  const [copiedSpecific, setCopiedSpecific] = useState(false);

  // Compute URLs dynamically:
  // AI Studio Dev URL vs Public Shared URL
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Public URL replacing ais-dev- with ais-pre- (or fallback to shared app origin)
  const publicOrigin = currentOrigin.replace('ais-dev-', 'ais-pre-') || 'https://ais-pre-yvd73iqk3bh3as7ktgj4iv-973121622465.asia-southeast1.run.app';
  
  // Live URLs
  const csoPublicUrl = `${publicOrigin}/?mode=cso`;

  // Use the public URL as the primary shareable link for mobile / WhatsApp
  const shareableUrl = csoPublicUrl;
  const specificUrl = selectedMobile ? `${publicOrigin}/?mode=cso&mobile=${selectedMobile}` : shareableUrl;

  const handleCopyPublic = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopySpecific = () => {
    navigator.clipboard.writeText(specificUrl);
    setCopiedSpecific(true);
    setTimeout(() => setCopiedSpecific(false), 2500);
  };

  const selectedCSO = csoRoster.find(
    (c) => (c.registeredMobile || c.mobile || '').replace(/\D/g, '').slice(-10) === selectedMobile
  );

  const whatsappMessage = encodeURIComponent(
    `*SSSG SOLUTIONS — UPSSSC PET 2026 Examination Centre Mock Day Survey*\n\n` +
    `सभी केन्द्र विशेष अधिकारी (CSO) कृपया नीचे दिए गए लिंक पर क्लिक करें और अपने रजिस्टर्ड 10-अंकों के मोबाइल नंबर से लॉगिन करके मॉक डे सर्वे तुरंत सबमिट करें:\n\n` +
    `🔗 *सर्वेक्षण लिंक:* ${shareableUrl}\n\n` +
    `नोट: केवल आयोग/एडमिन पोर्टल पर पंजीकृत मोबाइल नंबर से ही लॉगिन होगा।`
  );

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${whatsappMessage}`;

  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(
    shareableUrl
  )}`;

  return (
    <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-blue-700/80 shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Live Sync Badge & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span>CSO Live Survey Shareable Link</span>
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span>Live Connected</span>
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              CSO अपने रजिस्टर्ड 10-अंकों के मोबाइल नंबर से लॉगिन करके मॉक सर्वे करेंगे और डेटा रियल-टाइम में यहाँ अपडेट होगा।
            </p>
          </div>
        </div>

        {/* Live counter */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 self-start sm:self-auto shrink-0 font-mono text-xs">
          <div>
            <span className="text-[10px] text-blue-200 block uppercase">Completed</span>
            <span className="font-black text-emerald-400 text-sm">
              {completedCount} / {totalCount}
            </span>
          </div>
          <div className="h-6 w-px bg-white/20" />
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Quick Action Test Buttons Row (Foolproof direct testing without new tabs) */}
      <div className="mt-4 p-3 bg-blue-950/70 border border-blue-600/50 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shrink-0">
            Direct In-App Test
          </span>
          <span className="text-blue-100 font-medium text-xs">
            बिना किसी बाहरी लिंक के, सीधे यहीं पोर्टल पर CSO लॉगिन और मॉक सबमिशन टेस्ट करें:
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onSwitchToCSOLogin && (
            <button
              type="button"
              onClick={onSwitchToCSOLogin}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              title="Open CSO login screen right now in the portal"
            >
              <PlayCircle className="w-4 h-4" />
              <span>📱 यहाँ सीधे CSO लॉगिन खोलें</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="px-2.5 py-2 bg-blue-800/80 hover:bg-blue-700 text-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-blue-600/60 transition-colors cursor-pointer"
            title="Help about external links"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">लिंक गाइड</span>
          </button>
        </div>
      </div>

      {/* Help Note on AI Studio Link Permissions */}
      {showHelp && (
        <div className="mt-3 p-3.5 bg-slate-950/90 border border-amber-500/40 rounded-xl text-xs space-y-2 text-slate-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Info className="w-4 h-4 shrink-0" />
            <span>मोबाइल पर लिंक नहीं खुलने का कारण और समाधान (Why link may not open on mobile):</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-300">
            <li>
              <strong>Development Link (<code className="text-amber-300 font-mono">ais-dev-...</code>)</strong>: Google AI Studio सुरक्षा कारणों से इस लिंक को केवल डेवलपर के Google अकाउंट में ही खोलने की अनुमति देता है। यदि इसे दूसरे फोन या WhatsApp पर खोला जाए तो &apos;403 Forbidden&apos; या &apos;Cookie Check&apos; आता है।
            </li>
            <li>
              <strong>Public Shared Link (<code className="text-emerald-400 font-mono">ais-pre-...</code>)</strong>: यह लिंक किसी भी फोन पर बिना Google लॉगिन के खुलता है। इसे चालू करने के लिए AI Studio के सबसे ऊपर दाईं ओर दिए गए <strong>&apos;Share&apos;</strong> बटन पर क्लिक करें।
            </li>
            <li>
              <strong>तुरंत टेस्ट करने के लिए</strong>: ऊपर दिए गए पीले बटन <span className="text-amber-300 font-bold">&quot;यहाँ सीधे CSO लॉगिन खोलें&quot;</span> पर क्लिक करें। यह बिना किसी नए टैब या लिंक के तुरंत खुल जाता है!
            </li>
          </ul>
        </div>
      )}

      {/* Main Link Input & Action Buttons */}
      <div className="mt-4 pt-4 border-t border-blue-800/80 relative z-10 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Link box */}
          <div className="flex-1 bg-slate-950/70 border border-blue-700/60 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs font-mono text-blue-200 overflow-hidden shadow-inner">
            <span className="truncate select-all">{shareableUrl}</span>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded ml-2 shrink-0 border border-emerald-500/20">
              Public Link
            </span>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyPublic}
            className={`min-h-[42px] px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0 ${
              copied
                ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied Link!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          {/* Share to WhatsApp */}
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[42px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
            title="Share directly via WhatsApp"
          >
            <Send className="w-4 h-4" />
            <span>WhatsApp Share</span>
          </a>

          {/* QR Code Toggle */}
          <button
            type="button"
            onClick={() => setShowQR(!showQR)}
            className="min-h-[42px] px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer shrink-0"
            title="Toggle QR Code display"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>{showQR ? 'Hide QR' : 'Show QR'}</span>
          </button>
        </div>

        {/* QR Code Expansion Panel */}
        {showQR && (
          <div className="bg-slate-950/80 border border-blue-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in duration-200">
            <div className="bg-white p-2.5 rounded-xl shadow-lg shrink-0">
              <img
                src={qrCodeImageUrl}
                alt="CSO Portal QR Code"
                className="w-36 h-36 object-contain rounded"
              />
            </div>
            <div className="text-xs space-y-1.5 text-center sm:text-left">
              <span className="inline-block px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold uppercase text-[10px] tracking-wider">
                Scan to Open on Mobile
              </span>
              <h4 className="text-sm font-bold text-white">CSO Mobile QR Code Scanner</h4>
              <p className="text-slate-300 text-[11px] leading-relaxed max-w-md">
                CSO अपने फोन के कैमरा से इस QR कोड को स्कैन करके सीधे <strong>SSSG SOLUTIONS</strong> मॉक सर्वे पोर्टल खोल सकते हैं और अपने 10-अंकों के रजिस्टर्ड नंबर से लॉगिन कर सकते हैं।
              </p>
              <div className="pt-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  ● Real-time Live Connection Active
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Individual CSO Link Generator and Direct Quick Login Button */}
        {csoRoster.length > 0 && (
          <div className="pt-2 flex flex-col lg:flex-row lg:items-center justify-between gap-2 text-[11px] text-blue-200 border-t border-blue-900/60 mt-2">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>पंजीकृत CSO के लिए त्वरित डायरेक्ट टेस्ट (Quick Officer Test):</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedMobile}
                onChange={(e) => setSelectedMobile(e.target.value)}
                className="bg-slate-950/90 border border-blue-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono max-w-[240px]"
              >
                <option value="">— Select Registered CSO —</option>
                {csoRoster.map((c) => {
                  const m = (c.registeredMobile || c.mobile || '').replace(/\D/g, '').slice(-10);
                  const name = c.csoName || c.name || 'Officer';
                  const dist = c.districtName || c.district || '';
                  return (
                    <option key={m} value={m}>
                      {name} (+91 {m}) - {dist}
                    </option>
                  );
                })}
              </select>

              {selectedCSO && onDirectTestCSO && (
                <button
                  type="button"
                  onClick={() => onDirectTestCSO(selectedCSO)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 transition-all"
                  title="Directly login as this CSO to test survey submission"
                >
                  <PlayCircle className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Login As {selectedCSO.csoName?.split(' ')[0] || 'CSO'}</span>
                </button>
              )}

              {selectedMobile && (
                <button
                  type="button"
                  onClick={handleCopySpecific}
                  className="px-2.5 py-1.5 bg-blue-800 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Copy direct pre-filled link"
                >
                  {copiedSpecific ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSpecific ? 'Copied!' : 'Copy Link'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
