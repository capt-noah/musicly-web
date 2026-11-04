'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Smartphone,
  ArrowRight,
  Send,
  Music2,
  Apple,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ScrollWaveVisualizer } from './landing/ScrollWaveVisualizer';
import { InteractiveVinylDeck } from './landing/InteractiveVinylDeck';
import { KineticAudioMarquee } from './landing/KineticAudioMarquee';
import { AudioArchitectureScroller } from './landing/AudioArchitectureScroller';
import { AudiophileBentoGrid } from './landing/AudiophileBentoGrid';
import { AndroidShowcaseSection } from './landing/AndroidShowcaseSection';
import { SmoothScrollProvider } from '../providers/SmoothScrollProvider';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function PublicProductLanding() {
  const { isAuthenticated, user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const preFooterRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  const downloadUrl =
    process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL ||
    'https://musicly-4l0y.onrender.com/download/musicly.apk';

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // 1. Hero Entrance Timeline with Staggered Delays
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .from(
          '.hero-headline-line',
          {
            y: 60,
            opacity: 0,
            duration: 1.0,
            stagger: 0.14,
            delay: 0.1,
          }
        )
        .from(
          '.hero-subtext',
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
          },
          '-=0.6'
        )
        .from(
          '.hero-cta-btn',
          {
            y: 20,
            opacity: 0,
            duration: 0.7,
            stagger: 0.12,
          },
          '-=0.5'
        )
        .from(
          '.hero-deck-container',
          {
            y: 50,
            opacity: 0,
            scale: 0.95,
            duration: 1.1,
          },
          '-=0.6'
        );

      // 2. Parallax ambient glow orbs on scroll
      gsap.to('.hero-orb-primary', {
        y: 220,
        scale: 1.25,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      gsap.to('.hero-orb-secondary', {
        y: 180,
        scale: 0.85,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });

      // 3. Pre-footer Staggered Delayed Scroll Entrance
      if (preFooterRef.current) {
        gsap.fromTo(
          '.prefooter-anim-item',
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.14,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: preFooterRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // 4. Footer Smooth Fade-in
      if (footerRef.current) {
        gsap.fromTo(
          footerRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: footerRef.current,
              start: 'top 95%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    },
    { scope: containerRef }
  );

  return (
    <SmoothScrollProvider>
      <div
        ref={containerRef}
        className="w-full overflow-x-hidden select-none bg-[#0d0f0d] text-[#fff8f2]"
      >
        {/* 1. SEAMLESS HERO SECTION */}
        <section
          ref={heroRef}
          className="relative w-full pt-20 pb-28 sm:pt-28 sm:pb-36 overflow-hidden flex flex-col items-center justify-center text-center"
        >
          {/* Interactive 60fps Audio Waveform Canvas in Background */}
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
            <ScrollWaveVisualizer intensity={1.1} />
          </div>

          {/* Smooth Ambient Gradients (Zero Banding / Zero Pixelation) */}
          <div
            className="hero-orb-primary absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] sm:w-[1000px] h-[600px] pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(59, 75, 62, 0.20) 0%, rgba(59, 75, 62, 0.10) 25%, rgba(185, 203, 186, 0.05) 50%, transparent 75%)',
              transform: 'translateZ(0)',
            }}
          />
          <div
            className="hero-orb-secondary absolute top-10 left-10 w-[450px] h-[450px] pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at center, rgba(185, 203, 186, 0.06) 0%, rgba(59, 75, 62, 0.02) 40%, transparent 70%)',
              transform: 'translateZ(0)',
            }}
          />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 flex flex-col items-center">
            {/* Fluid High-Contrast Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#fff8f2] tracking-tight leading-[1.02] max-w-5xl">
              <span className="hero-headline-line block">Your Personal</span>
              <span className="hero-headline-line block text-transparent bg-clip-text bg-gradient-to-r from-[#b9cbba] via-[#fff8f2] to-[#a6ada6]">
                Music Cloud.
              </span>
            </h1>

            {/* Simple Subtext */}
            <p className="hero-subtext text-base sm:text-lg md:text-xl text-[#a6ada6] max-w-2xl mt-6 leading-relaxed">
              Lossless Telegram cloud storage. Studio sound quality. Native apps for iOS & Android.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 mt-9">
              {isAuthenticated ? (
                <Link
                  href="/"
                  className="hero-cta-btn flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] font-bold text-xs sm:text-sm shadow-[0_0_30px_rgba(185,203,186,0.3)] transition-all hover:scale-105 active:scale-95"
                >
                  <Music2 className="w-4 h-4" />
                  <span>Go to Music Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="hero-cta-btn flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] font-bold text-xs sm:text-sm shadow-[0_0_30px_rgba(185,203,186,0.3)] transition-all hover:scale-105 active:scale-95"
                >
                  <span>Open Web Player</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              {/* Install for iOS Button */}
              <Link
                href="/ios"
                className="hero-cta-btn flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[#fff8f2] font-semibold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 shadow-md"
              >
                <Apple className="w-4 h-4 text-[#fff8f2]" />
                <span>Install for iOS</span>
              </Link>

              <a
                href={downloadUrl}
                download="tone.apk"
                className="hero-cta-btn flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#1c211d] hover:bg-[#283029] border border-white/10 text-[#a6ada6] hover:text-[#fff8f2] font-semibold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 shadow-md"
              >
                <Smartphone className="w-4 h-4 text-[#b9cbba]" />
                <span>Get APK</span>
              </a>
            </div>

            {/* 3D Interactive Vinyl Turntable Mapped to Scroll */}
            <div className="hero-deck-container w-full mt-14 sm:mt-18">
              <InteractiveVinylDeck />
            </div>
          </div>
        </section>

        {/* 2. CONTINUOUS KINETIC AUDIO MARQUEE */}
        <KineticAudioMarquee />

        {/* 3. PINNED 3-PHASE SCROLLYTELLING JOURNEY */}
        <AudioArchitectureScroller />

        {/* 4. ASYMMETRIC BENTO GRID */}
        <AudiophileBentoGrid />

        {/* 5. NATIVE ANDROID SHOWCASE SECTION */}
        <AndroidShowcaseSection />

        {/* 6. CONVERSION PRE-FOOTER WITH DELAYED APPEARING ANIMATIONS */}
        <section
          ref={preFooterRef}
          className="w-full py-24 sm:py-32 border-t border-white/[0.06] bg-gradient-to-t from-[#141a15]/70 via-[#0d0f0d] to-[#0d0f0d] text-center relative overflow-hidden"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 relative z-10">
            <h3 className="prefooter-anim-item text-3xl sm:text-4xl md:text-5xl font-black text-[#fff8f2] tracking-tight">
              Ready to Stream in Studio Quality?
            </h3>
            <p className="prefooter-anim-item text-sm sm:text-base text-[#a6ada6] max-w-lg mx-auto leading-relaxed">
              Create your free account or sign in to start synchronizing and listening to your lossless collection across devices.
            </p>
            <div className="prefooter-anim-item flex flex-wrap items-center justify-center gap-4 pt-4">
              {isAuthenticated ? (
                <Link
                  href="/"
                  className="px-8 py-4 rounded-2xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-sm font-bold shadow-[0_0_30px_rgba(185,203,186,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Music2 className="w-4 h-4" />
                  <span>Open Your Music Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="px-8 py-4 rounded-2xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-sm font-bold shadow-[0_0_30px_rgba(185,203,186,0.3)] transition-all hover:scale-105 active:scale-95"
                  >
                    Create Free Account
                  </Link>
                  <Link
                    href="/login"
                    className="px-7 py-4 rounded-2xl bg-[#1c211d] hover:bg-white/10 border border-white/10 text-[#fff8f2] text-sm font-semibold transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* 7. LUXURY CLEAN FOOTER */}
        <footer
          ref={footerRef}
          className="w-full py-12 border-t border-white/[0.06] bg-[#090b09]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#a6ada6]">
            <div className="flex items-center gap-3">
              <div className="relative w-7 h-7 rounded-xl overflow-hidden border border-white/10 bg-[#1c211d]">
                <Image
                  src="/images/icon.png"
                  alt="Tone"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="font-bold text-sm text-[#fff8f2]">TONE</span>
            </div>

            <div className="flex items-center gap-6 sm:gap-8 font-semibold">
              <Link
                href="/ios"
                className="hover:text-[#fff8f2] text-[#b9cbba] transition-colors flex items-center gap-1.5"
              >
                <Apple className="w-3.5 h-3.5 text-[#fff8f2]" />
                <span>iOS App</span>
              </Link>
              <a
                href={downloadUrl}
                download="tone.apk"
                className="hover:text-[#b9cbba] transition-colors flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android APK</span>
              </a>
              <a
                href="https://t.me/tone_sync_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#b9cbba] transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram Bot</span>
              </a>
              <Link href="/login" className="hover:text-[#fff8f2] transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </SmoothScrollProvider>
  );
}
