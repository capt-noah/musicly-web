'use client';

import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Send,
  Headphones,
  FileText,
  Disc3,
  Share2,
  Zap,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
}

function SpotlightCard({ children, className = '' }: SpotlightCardProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bento-card-item relative rounded-3xl p-8 sm:p-10 bg-[#111412] border border-white/[0.08] hover:border-[#b9cbba]/30 transition-all duration-300 shadow-xl overflow-hidden group ${className}`}
    >
      {/* Radial Spotlight Shader */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, rgba(185, 203, 186, 0.12), transparent 80%)`,
        }}
      />
      <div className="relative z-10 h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}

export function AudiophileBentoGrid() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // Master Timeline for "Everything You Need" Section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });

      // 1. Title appears first
      tl.fromTo(
        '.bento-main-title',
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
      )
        // 2. Subtitle appears next with delay
        .fromTo(
          '.bento-main-subtext',
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
          '-=0.3'
        )
        // 3. Bento cards appear one by one with distinct delayed cascade
        .fromTo(
          '.bento-card-item',
          {
            y: 60,
            opacity: 0,
            scale: 0.94,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.22,
            duration: 0.85,
            ease: 'power3.out',
          },
          '-=0.2'
        )
        // 4. Inner card components reveal sequentially
        .fromTo(
          '.bento-card-inner-anim',
          { y: 15, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            duration: 0.5,
            ease: 'power2.out',
          },
          '-=0.5'
        );
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="features"
      ref={sectionRef}
      className="w-full py-24 sm:py-32 border-t border-white/[0.06] bg-[#0d0f0d] relative select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Heading with One-by-One Delayed Reveal */}
        <div className="text-center space-y-3 mb-16">
          <h2 className="bento-main-title text-3xl sm:text-4xl md:text-5xl font-black text-[#fff8f2] tracking-tight">
            Everything You Need
          </h2>
          <p className="bento-main-subtext text-sm sm:text-base text-[#a6ada6] max-w-xl mx-auto leading-relaxed">
            Unlimited cloud storage, pure lossless audio, and instant offline listening with zero subscription fees.
          </p>
        </div>

        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-flow-dense gap-6">
          {/* Bento 1: Telegram Cloud Storage (Spans 2 cols) */}
          <SpotlightCard className="lg:col-span-2">
            <div className="space-y-4">
              <div className="bento-card-inner-anim w-10 h-10 rounded-2xl bg-[#b9cbba]/15 border border-[#b9cbba]/30 flex items-center justify-center text-[#b9cbba]">
                <Send className="w-5 h-5" />
              </div>
              <h3 className="bento-card-inner-anim text-2xl sm:text-3xl font-black text-[#fff8f2] tracking-tight">
                Unlimited Cloud Storage
              </h3>
              <p className="bento-card-inner-anim text-xs sm:text-sm text-[#a6ada6] max-w-xl leading-relaxed">
                Save your whole music collection without file limits. Forward or upload your songs to your bot, and Tone connects directly to your cloud storage for instant, secure streaming.
              </p>
            </div>

            <div className="bento-card-inner-anim mt-8 p-4 rounded-2xl bg-[#090b09] border border-white/[0.08] font-mono text-xs space-y-1.5 text-[#a6ada6]">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-[11px] text-[#b9cbba]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  @tone_sync_bot
                </span>
                <span>STATUS: READY</span>
              </div>
              <p className="text-[11px] text-[#fff8f2]/90">
                &gt; Tone is ready to receive and play your tracks.
              </p>
            </div>
          </SpotlightCard>

          {/* Bento 2: Lossless Sound Quality */}
          <SpotlightCard>
            <div className="space-y-4">
              <div className="bento-card-inner-anim w-10 h-10 rounded-2xl bg-[#b9cbba]/15 border border-[#b9cbba]/30 flex items-center justify-center text-[#b9cbba]">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="bento-card-inner-anim text-xl sm:text-2xl font-bold text-[#fff8f2] tracking-tight">
                Lossless Sound Quality
              </h3>
              <p className="bento-card-inner-anim text-xs sm:text-sm text-[#a6ada6] leading-relaxed">
                Enjoy rich, uncompressed audio streaming. Every track plays cleanly just the way it was recorded in the studio.
              </p>
            </div>

            <div className="bento-card-inner-anim mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#b9cbba]">
              <span>STUDIO QUALITY</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>UNCOMPRESSED</span>
              </span>
            </div>
          </SpotlightCard>

          {/* Bento 3: Dynamic Synced Lyrics */}
          <SpotlightCard>
            <div className="space-y-4">
              <div className="bento-card-inner-anim w-10 h-10 rounded-2xl bg-[#b9cbba]/15 border border-[#b9cbba]/30 flex items-center justify-center text-[#b9cbba]">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="bento-card-inner-anim text-xl sm:text-2xl font-bold text-[#fff8f2] tracking-tight">
                Real-Time Lyrics
              </h3>
              <p className="bento-card-inner-anim text-xs sm:text-sm text-[#a6ada6] leading-relaxed">
                Follow along with word-by-word synchronized lyrics and dynamic ambient glow matched to song artwork.
              </p>
            </div>

            <div className="bento-card-inner-anim mt-8 p-3 rounded-2xl bg-[#161a17] border border-white/[0.06] space-y-1">
              <span className="text-[11px] text-[#a6ada6] block">Synced Lyric Line:</span>
              <span className="text-xs font-bold text-[#b9cbba] block">
                &ldquo;Where the melody lives forever&rdquo;
              </span>
            </div>
          </SpotlightCard>

          {/* Bento 4: Tone Wrapped & Insights (Spans 2 cols) */}
          <SpotlightCard className="lg:col-span-2">
            <div className="space-y-4">
              <div className="bento-card-inner-anim w-10 h-10 rounded-2xl bg-[#b9cbba]/15 border border-[#b9cbba]/30 flex items-center justify-center text-[#b9cbba]">
                <Disc3 className="w-5 h-5" />
              </div>
              <h3 className="bento-card-inner-anim text-2xl sm:text-3xl font-black text-[#fff8f2] tracking-tight">
                Tone Wrapped &amp; Listening Stats
              </h3>
              <p className="bento-card-inner-anim text-xs sm:text-sm text-[#a6ada6] max-w-xl leading-relaxed">
                Discover your top songs, favorite artists, and total listening time. Generate beautiful story cards to share with friends.
              </p>
            </div>

            <div className="bento-card-inner-anim mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c211d] border border-white/10 text-xs font-mono text-[#fff8f2]">
                <Share2 className="w-3.5 h-3.5 text-[#b9cbba]" />
                <span>Shareable Story Cards</span>
              </div>
              <span className="text-xs font-mono text-[#a6ada6]">
                Instant high-resolution export
              </span>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
