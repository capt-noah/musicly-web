'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Heart,
  Play,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Wifi,
  Battery,
  ChevronDown,
  MoreVertical,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { AppleLogo } from '@/components/common/AppleLogo';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function ToneIOSShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !cardRef.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });

      // 1. Showcase Outer Card Container Reveal
      tl.fromTo(
        cardRef.current,
        { y: 50, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }
      )
        // 2. Title appears delayed
        .fromTo(
          '.showcase-title-anim',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' },
          '-=0.4'
        )
        // 3. Description appears delayed
        .fromTo(
          '.showcase-desc-anim',
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
          '-=0.3'
        )
        // 4. Action buttons appear delayed
        .fromTo(
          '.showcase-cta-anim',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' },
          '-=0.25'
        )
        // 5. Badges appear delayed
        .fromTo(
          '.showcase-badges-anim',
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
          '-=0.2'
        )
        // 6. iPhone chassis floats in with 3D perspective
        .fromTo(
          phoneRef.current,
          {
            y: 60,
            rotateY: -14,
            rotateX: 6,
            opacity: 0,
            scale: 0.92,
          },
          {
            y: 0,
            rotateY: -2,
            rotateX: 2,
            opacity: 1,
            scale: 1,
            duration: 1.0,
            ease: 'power3.out',
          },
          '-=0.5'
        )
        // 7. Inner phone UI elements reveal one by one
        .fromTo(
          '.phone-ui-item',
          { y: 15, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.09,
            duration: 0.5,
            ease: 'power2.out',
          },
          '-=0.6'
        );
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="download-ios"
      ref={sectionRef}
      className="w-full py-20 sm:py-32 border-t border-white/[0.06] bg-[#0d0f0d] relative select-none [perspective:1200px]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div
          ref={cardRef}
          className="showcase-card-container relative rounded-3xl p-8 sm:p-12 md:p-16 overflow-hidden bg-gradient-to-br from-[#18201a] via-[#111612] to-[#0d0f0d] border border-[#b9cbba]/20 shadow-[0_30px_90px_rgba(0,0,0,0.85)]"
        >
          {/* Ambient Lighting Gradients */}
          <div
            className="absolute -top-10 -right-10 w-[450px] h-[450px] pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at center, rgba(185, 203, 186, 0.12) 0%, rgba(59, 75, 62, 0.04) 40%, transparent 70%)',
              transform: 'translateZ(0)',
            }}
          />
          <div
            className="absolute -bottom-10 -left-10 w-[450px] h-[450px] pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at center, rgba(59, 75, 62, 0.22) 0%, rgba(185, 203, 186, 0.04) 40%, transparent 70%)',
              transform: 'translateZ(0)',
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono text-[#b9cbba]">
                <Sparkles className="w-3.5 h-3.5 text-[#b9cbba]" />
                <span>NATIVE APPLE EXPERIENCE</span>
              </div>

              <h2 className="showcase-title-anim text-3xl sm:text-4xl md:text-5xl font-black text-[#fff8f2] tracking-tight leading-[1.08]">
                Tone for iPhone
              </h2>

              <p className="showcase-desc-anim text-sm sm:text-base text-[#a6ada6] leading-relaxed">
                Experience studio-grade lossless playback, Dynamic Island live activities, and zero-latency air-sync directly from your private Telegram vault.
              </p>

              {/* Action Buttons */}
              <div className="showcase-cta-anim flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/ios"
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-xs sm:text-sm font-bold shadow-[0_0_30px_rgba(185,203,186,0.3)] transition-all hover:scale-105 active:scale-95"
                >
                  <AppleLogo className="w-4 h-4 fill-[#0d0f0d]" />
                  <span>Install for iPhone</span>
                </Link>
              </div>

              {/* Badges */}
              <div className="showcase-badges-anim pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#a6ada6] font-mono">
                <span className="flex items-center gap-1.5 text-[#b9cbba]">
                  <AppleLogo className="w-3.5 h-3.5 text-[#b9cbba]" />
                  iOS 17+
                </span>
                <span>•</span>
                <span>24-bit Lossless</span>
                <span>•</span>
                <span>Instant Air-Sync</span>
              </div>
            </div>

            {/* Right: Flagship Luxury iPhone Chassis Mockup */}
            <div className="lg:col-span-6 flex justify-center py-4">
              <div
                ref={phoneRef}
                className="relative w-[300px] sm:w-[320px] aspect-[9/18.8] rounded-[52px] bg-[#0c0e0c] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.14),inset_0_0_0_2px_rgba(0,0,0,0.8)] transition-transform select-none"
              >
                {/* Outer Titanium Chassis Rim Highlight */}
                <div className="absolute inset-0 rounded-[52px] border border-white/10 pointer-events-none" />

                {/* iPhone Action Button & Volume Indents */}
                <div className="absolute -left-[3px] top-20 w-[3px] h-6 bg-[#283029] rounded-l-sm" />
                <div className="absolute -left-[3px] top-28 w-[3px] h-10 bg-[#283029] rounded-l-sm" />
                <div className="absolute -left-[3px] top-40 w-[3px] h-10 bg-[#283029] rounded-l-sm" />
                <div className="absolute -right-[3px] top-30 w-[3px] h-14 bg-[#283029] rounded-r-sm" />

                {/* OLED Screen Surface */}
                <div className="relative w-full h-full rounded-[42px] bg-gradient-to-b from-[#161c17] via-[#0f1310] to-[#0a0c0a] overflow-hidden flex flex-col justify-between p-4 text-[#fff8f2] shadow-inner border border-white/[0.04]">
                  {/* Status Bar with Dynamic Island */}
                  <div className="phone-ui-item flex items-center justify-between px-2 pt-1 pb-2 text-[10px] font-mono text-[#a6ada6]">
                    <span className="font-semibold text-[#fff8f2]">9:41</span>
                    {/* iPhone Dynamic Island */}
                    <div className="w-24 h-5 bg-black rounded-full flex items-center justify-between px-2.5 shadow-md border border-white/10">
                      <div className="w-2 h-2 rounded-full bg-blue-950/80 border border-blue-400/40" />
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#b9cbba] animate-pulse" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3 h-3 text-[#b9cbba]" />
                      <Battery className="w-3.5 h-3.5 text-[#b9cbba]" />
                    </div>
                  </div>

                  {/* App Header Navigation */}
                  <div className="phone-ui-item flex items-center justify-between px-1 py-1 text-xs">
                    <ChevronDown className="w-4 h-4 text-[#a6ada6]" />
                    <div className="text-center">
                      <span className="text-[9px] font-mono text-[#b9cbba] tracking-wider uppercase block">
                        PLAYING FROM TELEGRAM
                      </span>
                      <span className="text-[11px] font-bold text-[#fff8f2] truncate">
                        Lossless Studio Vault
                      </span>
                    </div>
                    <MoreVertical className="w-4 h-4 text-[#a6ada6]" />
                  </div>

                  {/* Album Cover Art Sleeve with Showcase Artwork */}
                  <div className="phone-ui-item my-auto py-2 flex flex-col items-center">
                    <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-[0_20px_45px_rgba(0,0,0,0.85)] border border-white/10 bg-[#121613] group">
                      <Image
                        src="/images/showcase-album.jpg"
                        alt="Tone Album Art"
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>

                  {/* Track Metadata & Heart Action */}
                  <div className="space-y-3 px-1">
                    <div className="phone-ui-item flex items-center justify-between">
                      <div className="space-y-0.5 max-w-[80%]">
                        <h4 className="text-sm sm:text-base font-bold text-[#fff8f2] truncate">
                          Solar Resonance
                        </h4>
                        <p className="text-xs text-[#b9cbba] font-medium truncate">
                          Tone Studio Master
                        </p>
                      </div>
                      <button className="p-2 rounded-full hover:bg-white/10 text-[#b9cbba]">
                        <Heart className="w-4 h-4 fill-[#b9cbba]" />
                      </button>
                    </div>

                    {/* Progress Bar & Timestamps */}
                    <div className="phone-ui-item space-y-1">
                      <div className="w-full bg-white/15 h-1 rounded-full overflow-hidden">
                        <div className="bg-[#b9cbba] h-full w-[45%]" />
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-mono text-[#a6ada6]">
                        <span>1:42</span>
                        <span>3:48</span>
                      </div>
                    </div>

                    {/* Audio Controls */}
                    <div className="phone-ui-item flex items-center justify-between px-2 pt-1">
                      <Shuffle className="w-3.5 h-3.5 text-[#b9cbba]" />
                      <SkipBack className="w-4 h-4 text-[#fff8f2]" />
                      <div className="w-11 h-11 rounded-full bg-[#b9cbba] text-[#0d0f0d] flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
                        <Play className="w-5 h-5 fill-[#0d0f0d] ml-0.5" />
                      </div>
                      <SkipForward className="w-4 h-4 text-[#fff8f2]" />
                      <Repeat className="w-3.5 h-3.5 text-[#a6ada6]" />
                    </div>

                    {/* Bottom Status Badge */}
                    <div className="phone-ui-item pt-1 flex items-center justify-between text-[9px] font-mono text-[#a6ada6] border-t border-white/[0.06]">
                      <span className="flex items-center gap-1 text-[#b9cbba]">
                        <Volume2 className="w-3 h-3" />
                        <span>FLAC 24-BIT</span>
                      </span>
                      <span className="text-green-400">OFFLINE CACHED</span>
                    </div>
                  </div>

                  {/* Home Swipe Indicator */}
                  <div className="phone-ui-item w-28 h-1 bg-white/30 rounded-full mx-auto mt-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


