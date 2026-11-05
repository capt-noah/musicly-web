'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Download, ShieldCheck, CheckCircle2, FileDown } from 'lucide-react';

export default function IosInstallPage() {
  const manifestUrl = 'https://musicly-web.vercel.app/ios/manifest.plist';
  const itmsUrl = `itms-services://?action=download-manifest&url=${encodeURIComponent(manifestUrl)}`;

  return (
    <main className="min-h-screen bg-[#0d0f0d] text-[#fff8f2] flex flex-col items-center justify-center p-4 sm:p-6 relative selection:bg-[#b9cbba] selection:text-[#0d0f0d]">
      <div className="w-full max-w-sm relative z-10 py-10">
        
        {/* Top Back Navigation Pill */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 backdrop-blur-md text-xs font-medium text-[#a6ada6] hover:text-[#fff8f2] transition-all hover:scale-105 active:scale-95 group shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-[#b9cbba]" />
            <span>Back to Tone</span>
          </Link>
        </div>

        {/* Minimal Hero with Tone Icon & Version */}
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-4 rounded-3xl p-1 bg-gradient-to-b from-white/20 to-white/5 border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.65)] flex items-center justify-center">
            <div className="relative w-full h-full rounded-[22px] overflow-hidden bg-[#141815]">
              <Image
                src="/images/icon.png"
                alt="Tone Icon"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fff8f2] mb-1.5 flex items-center justify-center gap-2.5">
            <span>Install Tone</span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/10 text-[#b9cbba] border border-white/10 tracking-wide">
              v1.1.1
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-[#a6ada6]">
            Follow two quick steps to install and protect Tone on your iPhone.
          </p>
        </div>

        {/* 2 Step Sequence in Correct Order */}
        <div className="space-y-4 mb-6">
          
          {/* STEP 1: DOWNLOAD PROFILE */}
          <div className="rounded-2xl bg-[#121613] border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#b9cbba] text-[#0d0f0d] text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <h2 className="text-sm font-semibold text-[#fff8f2]">
                  Download Profile
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#b9cbba]/10 text-[#b9cbba] text-[10px] font-medium border border-[#b9cbba]/20">
                <ShieldCheck className="w-3 h-3" />
                <span>Protected</span>
              </span>
            </div>
            
            <p className="text-xs text-[#a6ada6] leading-relaxed">
              Tap below, tap <strong>Allow</strong>, then go to <strong>Settings ➔ Profile Downloaded ➔ Install</strong> to activate anti-revoke DNS.
            </p>

            <a
              href="/ios/antirevoke.mobileconfig"
              download="Tone.mobileconfig"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#fff8f2] transition-colors"
            >
              <Download className="w-4 h-4 text-[#b9cbba]" />
              <span>1. Download Anti-Revoke Profile</span>
            </a>

            <p className="text-[11px] text-[#7d857e] text-center">
              Signed by Beihang University &bull; Tone Sanctuary
            </p>
          </div>

          {/* STEP 2: INSTALL APP */}
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
              Tap below, then tap <strong>Install</strong> on the iOS prompt. Tone will download directly to your home screen.
            </p>

            <a
              href={itmsUrl}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-xs sm:text-sm font-bold transition-all shadow-md active:scale-[0.99] group"
            >
              <div className="relative w-4 h-4 rounded-md overflow-hidden bg-[#0d0f0d] shrink-0">
                <Image
                  src="/images/icon.png"
                  alt="Tone"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span>2. Install Tone</span>
            </a>
          </div>

          {/* Trust Developer Guidance Note */}
          <div className="rounded-xl bg-black/40 border border-white/5 p-4 text-[11px] sm:text-xs text-[#a6ada6] leading-relaxed space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#fff8f2] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#b9cbba]" />
              <span>Before opening Tone:</span>
            </div>
            <p>
              Open iPhone <strong>Settings ➔ General ➔ VPN &amp; Device Management</strong>, tap <strong>Beihang University</strong>, and tap <strong>Trust</strong>.
            </p>
          </div>

          {/* Direct IPA Sideload Option */}
          <div className="pt-2 text-center">
            <a
              href="/ios/Tone.ipa"
              download="Tone.ipa"
              className="inline-flex items-center gap-1.5 text-[11px] text-[#7d857e] hover:text-[#b9cbba] transition-colors"
            >
              <FileDown className="w-3 h-3" />
              <span>Direct IPA Download (for ESign / Scarlet / Sideloading)</span>
            </a>
          </div>

        </div>

      </div>
    </main>
  );
}
