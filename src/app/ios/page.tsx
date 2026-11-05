'use client';

import React from 'react';
import Link from 'next/link';
import { Apple, ArrowLeft, Download, ChevronRight } from 'lucide-react';

export default function IosInstallPage() {
  const manifestUrl = 'https://musicly-4l0y.onrender.com/ios/manifest.plist';
  const itmsUrl = `itms-services://?action=download-manifest&url=${encodeURIComponent(manifestUrl)}`;

  return (
    <main className="min-h-screen bg-[#0d0f0d] text-[#fff8f2] flex flex-col items-center justify-center p-4 sm:p-6 relative selection:bg-[#b9cbba] selection:text-[#0d0f0d]">
      <div className="w-full max-w-sm relative z-10 py-10">
        
        {/* Top Back Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#a6ada6] hover:text-[#fff8f2] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Tone</span>
        </Link>

        {/* Minimal Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#141815] border border-white/10 shadow-lg flex items-center justify-center">
            <Apple className="w-8 h-8 text-[#b9cbba]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fff8f2] mb-1.5">
            Install Tone
          </h1>
          <p className="text-xs sm:text-sm text-[#a6ada6]">
            Follow two quick steps to install Tone on your iPhone.
          </p>
        </div>

        {/* Two Simple Steps */}
        <div className="space-y-4 mb-6">
          
          {/* STEP 1 */}
          <div className="rounded-2xl bg-[#121613] border border-white/10 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#b9cbba] text-[#0d0f0d] text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <h2 className="text-sm font-semibold text-[#fff8f2]">
                Download Profile
              </h2>
            </div>
            
            <p className="text-xs text-[#a6ada6] leading-relaxed">
              Tap below, tap <strong>Allow</strong>, then go to <strong>Settings ➔ Profile Downloaded ➔ Install</strong>.
            </p>

            <a
              href="/ios/antirevoke.mobileconfig"
              download="Tone.mobileconfig"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#fff8f2] transition-colors"
            >
              <Download className="w-4 h-4 text-[#b9cbba]" />
              <span>1. Download Profile</span>
            </a>
          </div>

          {/* STEP 2 */}
          <div className="rounded-2xl bg-[#121613] border border-[#b9cbba]/30 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#b9cbba] text-[#0d0f0d] text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <h2 className="text-sm font-semibold text-[#fff8f2]">
                Install App
              </h2>
            </div>

            <p className="text-xs text-[#a6ada6] leading-relaxed">
              Tap below, then tap <strong>Install</strong>. Tone will start downloading to your home screen.
            </p>

            <a
              href={itmsUrl}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-xs sm:text-sm font-bold transition-all shadow-md active:scale-[0.99]"
            >
              <Apple className="w-4 h-4" />
              <span>2. Install Tone</span>
            </a>
          </div>

          {/* Opening Note */}
          <div className="rounded-xl bg-black/40 border border-white/5 p-4 text-[11px] sm:text-xs text-[#a6ada6] leading-relaxed space-y-1">
            <p className="font-semibold text-[#fff8f2]">Before opening Tone:</p>
            <p>Go to <strong>Settings ➔ General ➔ VPN &amp; Device Management</strong>, tap <strong>Beihang University</strong>, and tap <strong>Trust</strong>.</p>
          </div>

        </div>

        {/* Quiet raw download / back link */}
        <div className="text-center space-y-3">
          <div>
            <a
              href="https://musicly-4l0y.onrender.com/ios/Tone-Enterprise.ipa"
              download="Tone.ipa"
              className="text-[11px] text-[#a6ada6]/60 hover:text-[#b9cbba] transition-colors underline underline-offset-4"
            >
              Download .ipa file directly
            </a>
          </div>

          <div>
            <Link
              href="/"
              className="text-xs text-[#b9cbba] hover:underline inline-flex items-center gap-1"
            >
              <span>Return to Tone Web</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
