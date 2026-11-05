'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Apple,
  ShieldCheck,
  Download,
  Check,
  ChevronRight,
  ArrowLeft,
  Smartphone,
  ExternalLink,
  Info,
} from 'lucide-react';

export default function IosInstallPage() {
  const [origin, setOrigin] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const manifestUrl = 'https://musicly-4l0y.onrender.com/ios/manifest.plist';
  const itmsUrl = `itms-services://?action=download-manifest&url=${encodeURIComponent(manifestUrl)}`;

  return (
    <main className="min-h-screen bg-[#0d0f0d] text-[#fff8f2] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-x-hidden selection:bg-[#b9cbba] selection:text-[#0d0f0d]">
      {/* Ambient Radial Lighting */}
      <div
        className="fixed top-[-100px] left-1/2 -translate-x-1/2 w-[550px] h-[550px] pointer-events-none rounded-full"
        style={{
          background:
            'radial-gradient(circle at center, rgba(185, 203, 186, 0.12) 0%, rgba(59, 75, 62, 0.05) 45%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-lg relative z-10 py-8">
        {/* Top Back Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#a6ada6] hover:text-[#fff8f2] transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Tone</span>
        </Link>

        {/* Header Hero */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-[#1c241e] to-[#121613] border border-[#b9cbba]/30 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(185,203,186,0.15)] flex items-center justify-center">
            <Apple className="w-10 h-10 sm:w-12 sm:h-12 text-[#b9cbba]" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#fff8f2] mb-2">
            Tone for iOS
          </h1>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#b9cbba]/10 border border-[#b9cbba]/25 text-xs font-mono font-medium text-[#b9cbba]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Enterprise Edition • Valid through 2027</span>
          </div>

          <p className="mt-3 text-xs sm:text-sm text-[#a6ada6] max-w-sm mx-auto leading-relaxed">
            Install Tone directly to your iPhone with full Master Audio, offline cache, and zero 7-day limits.
          </p>
        </div>

        {/* 3 Step Interactive Card List */}
        <div className="space-y-4 mb-8">
          {/* ESign Recommended Direct Install Card */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#1b261e] via-[#141b16] to-[#0f1410] border border-[#b9cbba]/40 p-5 sm:p-6 shadow-[0_0_30px_rgba(185,203,186,0.15)] transition-all">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-[#b9cbba] text-[#0d0f0d] flex items-center justify-center font-black text-sm shrink-0 mt-0.5 shadow-[0_0_20px_rgba(185,203,186,0.5)]">
                ★
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-[#fff8f2]">
                    Install with ESign (100% Working)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                    Recommended ✅
                  </span>
                </div>
                <p className="text-xs text-[#a6ada6] leading-relaxed">
                  Sign Tone directly inside ESign with your active certificate. Zero 75% OTA errors, full master lossless audio, and offline library caching.
                </p>

                <div className="pt-2 flex flex-wrap gap-2.5">
                  <a
                    href="https://musicly-4l0y.onrender.com/ios/Tone-Enterprise.ipa"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(185,203,186,0.25)] transition-all hover:scale-105 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Tone.ipa (36 MB)</span>
                  </a>

                  <a
                    href="https://musicly-web.vercel.app/esign.json"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1c241e] hover:bg-white/10 border border-[#b9cbba]/30 text-xs font-semibold text-[#b9cbba] hover:text-[#fff8f2] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>ESign Repo Source</span>
                  </a>
                </div>

                <div className="mt-3 p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 text-[11px] sm:text-xs text-[#a6ada6] leading-relaxed">
                  <div className="font-bold text-[#fff8f2] flex items-center gap-1.5">
                    <span>How to Install in ESign in 30 Seconds:</span>
                  </div>
                  <div>1. Tap <strong>Download Tone.ipa</strong> above (or in ESign, tap <strong>⋯ ➔ Download</strong> and paste URL).</div>
                  <div>2. In ESign, open the <strong>Apps / File</strong> tab and tap <strong>Tone.ipa</strong>.</div>
                  <div>3. Tap <strong>Signature (Sign)</strong> with your active cert ➔ tap <strong>Install</strong>.</div>
                  <div className="text-emerald-400 font-semibold">Done! Tone installs directly onto your Home Screen.</div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 1 */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#18201a] via-[#121613] to-[#0f120f] border border-white/10 p-5 sm:p-6 shadow-xl transition-all">
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-[#b9cbba] text-[#0d0f0d] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-[0_0_15px_rgba(185,203,186,0.4)]">
                1
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-[#fff8f2]">
                    Activate Anti-Revoke DNS Shield
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                    DNS Shield Only (No Bookmark)
                  </span>
                </div>
                <p className="text-xs text-[#a6ada6] leading-relaxed">
                  Blocks Apple revocation and verification checks so enterprise apps install and run without being revoked.
                </p>

                <div className="pt-3 flex flex-wrap gap-2.5">
                  <a
                    href="/ios/antirevoke.mobileconfig"
                    download="Tone-AntiRevoke.mobileconfig"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1c241e] hover:bg-white/10 border border-[#b9cbba]/30 text-xs font-semibold text-[#b9cbba] hover:text-[#fff8f2] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download DNS Shield Profile</span>
                  </a>
                </div>

                <div className="mt-3 p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-[11px] text-[#a6ada6] leading-relaxed">
                  <div className="font-semibold text-[#fff8f2] flex items-center gap-1.5">
                    <span>Profile Setup Instructions:</span>
                  </div>
                  <div>1. <em>(Important)</em>: Go to <strong>Settings ➔ General ➔ VPN &amp; Device Management</strong> and remove any old Tone profiles.</div>
                  <div>2. Tap <strong>Download DNS Shield Profile</strong> above ➔ tap <strong>Allow</strong>.</div>
                  <div>3. Open <strong>Settings ➔ Profile Downloaded ➔ Install</strong>.</div>
                  <div>4. Toggle <strong>Airplane Mode ON for 5s and OFF</strong> to flush iOS DNS cache.</div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#18201a] via-[#121613] to-[#0f120f] border border-[#b9cbba]/25 p-5 sm:p-6 shadow-xl transition-all">
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-[#b9cbba] text-[#0d0f0d] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-[0_0_15px_rgba(185,203,186,0.4)]">
                2
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-[#fff8f2]">
                  Install Tone Native App (Swift)
                </h3>
                <p className="text-xs text-[#a6ada6] leading-relaxed">
                  Signed with active 2027 In-House Enterprise Certificate. When prompted in Safari, tap{' '}
                  <strong className="text-[#fff8f2]">Install</strong>. The native app downloads all the way to 100%.
                </p>

                <div className="pt-3">
                  <a
                    href={itmsUrl}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-xs sm:text-sm font-bold shadow-[0_0_25px_rgba(185,203,186,0.3)] transition-all hover:scale-105 active:scale-95"
                  >
                    <Apple className="w-4 h-4" />
                    <span>Install Tone Native on iPhone</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#18201a] via-[#121613] to-[#0f120f] border border-white/10 p-5 sm:p-6 shadow-xl transition-all">
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-white/10 text-[#a6ada6] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-[#fff8f2]">
                  Trust Enterprise Developer
                </h3>
                <p className="text-xs text-[#a6ada6] leading-relaxed">
                  Before launching the native app the first time, go to:
                </p>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] sm:text-xs text-[#b9cbba] space-y-1 mt-2">
                  <div>Settings ➔ General ➔ VPN &amp; Device Management</div>
                  <div>➔ Under Enterprise App: Tap <strong>Moving Increasingly Interconnected Technology Co., Ltd</strong></div>
                  <div>➔ Tap <strong>Trust</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* ALTERNATIVE: DIRECT IPA DOWNLOAD */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#141815] to-[#0f120f] border border-white/5 p-4 sm:p-5 text-center">
            <p className="text-xs text-[#a6ada6] mb-3">
              Want to share via Telegram / AirDrop or install using AltStore, SideStore, Feather, or TrollStore?
            </p>
            <a
              href="https://musicly-4l0y.onrender.com/ios/Tone-Enterprise.ipa"
              download="Tone-Enterprise.ipa"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-[#fff8f2] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#b9cbba]" />
              <span>Download Raw Tone-Enterprise.ipa (34 MB)</span>
            </a>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="text-center space-y-2">
          <p className="text-xs font-mono text-[#a6ada6]/80">
            Zero 7-day expiration • Lossless Master Audio • Full Dynamic Island
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="text-xs text-[#b9cbba] hover:underline inline-flex items-center gap-1"
            >
              <span>Return to Tone Web Player</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
