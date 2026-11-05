'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const MARQUEE_ITEMS = [
  'LOSSLESS AUDIO',
  'UNLIMITED CLOUD STORAGE',
  'DIRECT TELEGRAM BOT',
  'NATIVE IPHONE APP',
  'STUDIO SOUND QUALITY',
  'REAL-TIME SYNCED LYRICS',
  'GAPLESS PLAYBACK',
  'PRIVATE MUSIC HUB',
];

export function KineticAudioMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!trackRef.current || !containerRef.current) return;

      // Accelerate horizontal translation with scroll
      gsap.to(trackRef.current, {
        xPercent: -25,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full py-6 sm:py-8 border-y border-white/[0.06] bg-[#0b0d0b] overflow-hidden select-none"
    >
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0b0d0b] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0b0d0b] to-transparent z-10 pointer-events-none" />

      <div
        ref={trackRef}
        className="flex items-center gap-8 whitespace-nowrap will-change-transform"
      >
        {/* Repeat sequence 3 times for seamless continuity */}
        {[0, 1, 2].map((loopIdx) => (
          <div key={loopIdx} className="flex items-center gap-8 flex-shrink-0">
            {MARQUEE_ITEMS.map((item, idx) => (
              <div key={`${loopIdx}-${idx}`} className="flex items-center gap-8">
                <span className="text-sm sm:text-base md:text-lg font-black tracking-widest text-[#fff8f2]/90 hover:text-[#b9cbba] transition-colors">
                  {item}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#b9cbba]/60" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
