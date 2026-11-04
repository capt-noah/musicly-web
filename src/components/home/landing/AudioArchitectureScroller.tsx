'use client';

import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Send,
  Sliders,
  Smartphone,
  CheckCircle2,
  Radio,
  Disc3,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const STAGES = [
  {
    step: '01',
    tab: 'Send',
    title: 'Forward to Telegram Bot',
    desc: 'Send your favorite songs, FLAC albums, or audio files to @tone_sync_bot on Telegram. Tone automatically indexes song titles, artists, and high-resolution artwork with unlimited free cloud storage.',
    stats: [
      { label: 'Storage', val: 'Unlimited Free' },
      { label: 'Setup Time', val: 'Instant' },
      { label: 'Formats', val: 'FLAC, MP3, WAV' },
    ],
  },
  {
    step: '02',
    tab: 'Sound',
    title: 'Pure Lossless Sound',
    desc: 'Listen to music exactly the way the artist created it. Enjoy rich, uncompressed audio streaming directly to your headphones without any audio compression or quality loss.',
    stats: [
      { label: 'Audio Quality', val: 'Lossless Master' },
      { label: 'Compression', val: 'Zero Loss' },
      { label: 'Streaming', val: 'Fast & Gapless' },
    ],
  },
  {
    step: '03',
    tab: 'Everywhere',
    title: 'Listen on Any Device',
    desc: 'Enjoy seamless playback wherever you are. Stream directly in your browser or install the Android app to save songs offline and keep listening anywhere without internet.',
    stats: [
      { label: 'Android App', val: 'Offline Caching' },
      { label: 'Web Player', val: 'Instant Access' },
      { label: 'Cross-Device', val: 'Synced Queue' },
    ],
  },
];

export function AudioArchitectureScroller() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinTargetRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(0);

  useGSAP(
    () => {
      if (!containerRef.current || !pinTargetRef.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // 1. Set explicit initial visibility and styles
      gsap.set('.stage-layer-0', { opacity: 1, visibility: 'visible', pointerEvents: 'auto' });
      gsap.set('.stage-layer-0 .anim-item', { opacity: 1, y: 0 });

      gsap.set('.stage-layer-1', { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
      gsap.set('.stage-layer-1 .anim-item', { opacity: 0, y: 35 });

      gsap.set('.stage-layer-2', { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
      gsap.set('.stage-layer-2 .anim-item', { opacity: 0, y: 35 });

      // 2. Continuous scrubbed timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=160%',
          pin: pinTargetRef.current,
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.36) {
              setActiveStage(0);
            } else if (p < 0.72) {
              setActiveStage(1);
            } else {
              setActiveStage(2);
            }
          },
        },
      });

      // Stage 0 -> Stage 1
      tl.to('.stage-layer-0 .anim-item', {
        opacity: 0,
        y: -25,
        stagger: 0.04,
        duration: 0.4,
        ease: 'power2.in',
      })
        .set('.stage-layer-0', { opacity: 0, visibility: 'hidden', pointerEvents: 'none' })
        .set('.stage-layer-1', { opacity: 1, visibility: 'visible', pointerEvents: 'auto' })
        .to('.stage-layer-1 .anim-item', {
          opacity: 1,
          y: 0,
          stagger: 0.07,
          duration: 0.5,
          ease: 'power2.out',
        })
        // Brief hold on Stage 1
        .to({}, { duration: 0.25 })
        // Stage 1 -> Stage 2
        .to('.stage-layer-1 .anim-item', {
          opacity: 0,
          y: -25,
          stagger: 0.04,
          duration: 0.4,
          ease: 'power2.in',
        })
        .set('.stage-layer-1', { opacity: 0, visibility: 'hidden', pointerEvents: 'none' })
        .set('.stage-layer-2', { opacity: 1, visibility: 'visible', pointerEvents: 'auto' })
        .to('.stage-layer-2 .anim-item', {
          opacity: 1,
          y: 0,
          stagger: 0.07,
          duration: 0.5,
          ease: 'power2.out',
        })
        // Brief hold on Stage 2
        .to({}, { duration: 0.25 });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[220vh] bg-gradient-to-b from-[#0d0f0d] via-[#111612] to-[#0d0f0d] border-t border-white/[0.06]"
    >
      {/* Pinned Stage Container */}
      <div
        ref={pinTargetRef}
        className="w-full h-screen flex flex-col justify-center items-center px-4 sm:px-6 md:px-8 py-8 relative overflow-hidden"
      >
        {/* Ambient Stage Glow (Smooth Multi-Stop Radial) */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(59, 75, 62, 0.18) 0%, rgba(59, 75, 62, 0.08) 35%, rgba(185, 203, 186, 0.03) 60%, transparent 80%)',
            transform: 'translateZ(0)',
          }}
        />

        <div className="max-w-6xl w-full mx-auto relative z-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#fff8f2] tracking-tight">
              How It Works
            </h2>

            {/* Interactive Stage Pill Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#161a17] border border-white/10 shadow-lg">
              {STAGES.map((stg, idx) => {
                const isCurrent = activeStage === idx;
                return (
                  <div
                    key={stg.step}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono transition-all duration-300 ${
                      isCurrent
                        ? 'bg-[#b9cbba] text-[#0d0f0d] font-bold shadow-md scale-105'
                        : 'text-[#a6ada6]'
                    }`}
                  >
                    <span>{stg.step}</span>
                    <span>{stg.tab}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Layered Scrollytelling Stage Grid */}
          <div className="relative min-h-[380px] sm:min-h-[340px] grid grid-cols-1">
            {/* Stage 01 Layer */}
            <div className="stage-layer-0 col-start-1 row-start-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5 text-left">
                <h3 className="anim-item text-2xl sm:text-3xl md:text-4xl font-black text-[#fff8f2] tracking-tight leading-tight">
                  {STAGES[0].title}
                </h3>
                <p className="anim-item text-sm sm:text-base text-[#a6ada6] leading-relaxed">
                  {STAGES[0].desc}
                </p>

                <div className="anim-item grid grid-cols-3 gap-3 pt-2">
                  {STAGES[0].stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="p-3 rounded-2xl bg-[#161a17] border border-white/[0.06] space-y-1"
                    >
                      <span className="text-[10px] font-mono text-[#a6ada6] block uppercase truncate">
                        {stat.label}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#b9cbba] block truncate">
                        {stat.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="anim-item lg:col-span-6">
                <div className="rounded-3xl p-6 sm:p-8 bg-[#131714] border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#3b4b3e] flex items-center justify-center text-[#b9cbba]">
                        <Send className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#fff8f2] block">
                          @tone_sync_bot
                        </span>
                        <span className="text-[10px] font-mono text-green-400">
                          ONLINE &amp; READY
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#a6ada6]">UNLIMITED CLOUD</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1a201b] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#fff8f2]">
                        favorite_song.flac
                      </span>
                      <span className="text-[11px] font-mono text-[#b9cbba]">Lossless</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#b9cbba] h-full w-full animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#a6ada6]">
                      <span>Organizing Album Art &amp; Lyrics...</span>
                      <span className="text-[#b9cbba]">SAVED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage 02 Layer */}
            <div className="stage-layer-1 col-start-1 row-start-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5 text-left">
                <h3 className="anim-item text-2xl sm:text-3xl md:text-4xl font-black text-[#fff8f2] tracking-tight leading-tight">
                  {STAGES[1].title}
                </h3>
                <p className="anim-item text-sm sm:text-base text-[#a6ada6] leading-relaxed">
                  {STAGES[1].desc}
                </p>

                <div className="anim-item grid grid-cols-3 gap-3 pt-2">
                  {STAGES[1].stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="p-3 rounded-2xl bg-[#161a17] border border-white/[0.06] space-y-1"
                    >
                      <span className="text-[10px] font-mono text-[#a6ada6] block uppercase truncate">
                        {stat.label}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#b9cbba] block truncate">
                        {stat.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="anim-item lg:col-span-6">
                <div className="rounded-3xl p-6 sm:p-8 bg-[#131714] border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#b9cbba] flex items-center gap-1.5">
                      <Sliders className="w-4 h-4" />
                      <span>STUDIO SOUND ENGINE</span>
                    </span>
                    <span className="text-[11px] font-mono text-[#fff8f2]">LOSSLESS AUDIO</span>
                  </div>

                  <div className="flex items-end justify-between gap-1.5 h-32 p-4 rounded-2xl bg-[#181d19] border border-white/10">
                    {[65, 80, 45, 95, 70, 85, 60, 90, 75, 88, 55, 92].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-[#3b4b3e] via-[#b9cbba] to-[#fff8f2] rounded-t-sm transition-all duration-300"
                        style={{
                          height: `${height}%`,
                          boxShadow: '0 0 10px rgba(185,203,186,0.2)',
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#a6ada6]">
                    <span>DEEP BASS</span>
                    <span>CLEAR VOCALS</span>
                    <span>CRISP HIGHS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage 03 Layer */}
            <div className="stage-layer-2 col-start-1 row-start-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5 text-left">
                <h3 className="anim-item text-2xl sm:text-3xl md:text-4xl font-black text-[#fff8f2] tracking-tight leading-tight">
                  {STAGES[2].title}
                </h3>
                <p className="anim-item text-sm sm:text-base text-[#a6ada6] leading-relaxed">
                  {STAGES[2].desc}
                </p>

                <div className="anim-item grid grid-cols-3 gap-3 pt-2">
                  {STAGES[2].stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="p-3 rounded-2xl bg-[#161a17] border border-white/[0.06] space-y-1"
                    >
                      <span className="text-[10px] font-mono text-[#a6ada6] block uppercase truncate">
                        {stat.label}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#b9cbba] block truncate">
                        {stat.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="anim-item lg:col-span-6">
                <div className="rounded-3xl p-6 sm:p-8 bg-[#131714] border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#b9cbba] flex items-center gap-1.5">
                      <Disc3 className="w-4 h-4" />
                      <span>CROSS-DEVICE PLAYBACK</span>
                    </span>
                    <span className="text-[10px] font-mono text-green-400">READY</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-[#1a201b] border border-[#b9cbba]/30 space-y-2">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#b9cbba]" />
                        <span className="text-xs font-bold text-[#fff8f2]">Android App</span>
                      </div>
                      <p className="text-[11px] text-[#a6ada6]">
                        Save songs offline for zero-data listening anywhere.
                      </p>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-[#b9cbba]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>OFFLINE READY</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#1a201b] border border-white/10 space-y-2">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-[#b9cbba]" />
                        <span className="text-xs font-bold text-[#fff8f2]">Web Player</span>
                      </div>
                      <p className="text-[11px] text-[#a6ada6]">
                        Play directly in your browser with zero install needed.
                      </p>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-[#b9cbba]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>INSTANT ACCESS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
