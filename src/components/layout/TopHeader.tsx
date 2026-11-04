'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  RefreshCw,
  LogIn,
  User,
  Sparkles,
  LogOut,
  Smartphone,
  Apple,
  HardDrive,
  PictureInPicture2,
  Home,
  Radio,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { useDesktop } from '@/context/DesktopContext';
import { GlassCard } from '@/components/shared/GlassCard';
import { getProfileImageUrl } from '@/lib/utils';
import { WrapModal } from '../modals/WrapModal';
import { SyncModal } from '../modals/SyncModal';
import { StorageManagerModal } from '../desktop/StorageManagerModal';
import { ToneMatchModal } from '../modals/ToneMatchModal';

export function TopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isMounted, isLoading, logout } = useAuth();
  const { syncAll, isSyncing, progress, syncModalOpen, setSyncModalOpen } = useSync();
  const { isDesktop, storageInfo, toggleWidgetWindow } = useDesktop();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [wrapModalOpen, setWrapModalOpen] = useState(false);
  const [storageModalOpen, setStorageModalOpen] = useState(false);
  const [toneMatchModalOpen, setToneMatchModalOpen] = useState(false);
  const downloadUrl =
    process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL ||
    'https://musicly-4l0y.onrender.com/download/musicly.apk';

  // If not mounted yet on client: render clean neutral dock matching SSR without flashing unauthenticated CTA boxes
  if (!isMounted) {
    return (
      <GlassCard variant="top" className="sticky top-0 z-30 h-16 w-full px-4 sm:px-6 md:px-8 flex items-center select-none !rounded-none">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-lg border border-white/15 bg-[#1c211d]">
              <Image
                src="/images/icon.png"
                alt="Tone Logo"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-[#fff8f2] block leading-none">
                TONE
              </span>
            </div>
          </Link>

          {/* Neutral placeholder while mounting */}
          <div className="h-8 w-24" />
        </div>
      </GlassCard>
    );
  }

  // If mounted and unauthenticated: render Landing Navbar
  if (!isAuthenticated) {
    return (
      <GlassCard variant="top" className="sticky top-0 z-30 h-16 w-full px-4 sm:px-6 md:px-8 flex items-center select-none animate-in fade-in duration-200 !rounded-none">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-lg border border-white/15 group-hover:scale-105 transition-transform bg-[#1c211d]">
              <Image
                src="/images/icon.png"
                alt="Tone Logo"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-[#fff8f2] block leading-none">
                TONE
              </span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            <a
              href={downloadUrl}
              download="tone.apk"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 backdrop-blur-md text-xs font-semibold text-[#fff8f2] transition-all hover:scale-105"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#b9cbba]" />
              <span>APK</span>
            </a>
            <Link
              href="/ios"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 backdrop-blur-md text-xs font-semibold text-[#fff8f2] transition-all hover:scale-105"
            >
              <Apple className="w-3.5 h-3.5 text-[#fff8f2]" />
              <span>iOS</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Get Started</span>
            </Link>
          </div>
        </div>
      </GlassCard>
    );
  }

  // If authenticated: render Streaming App Top Header
  return (
    <>
      <GlassCard variant="top" className="sticky top-0 z-30 h-16 w-full px-4 sm:px-6 md:px-8 flex items-center justify-between select-none !rounded-none">
        {/* Left Section: Logo + Home Button + Search Shortcut */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link href="/" className="flex items-center gap-2.5 group mr-1">
            <div className="relative w-7 h-7 rounded-xl overflow-hidden shadow-sm border border-white/15 group-hover:scale-105 transition-transform bg-[#1c211d]">
              <Image
                src="/images/icon.png"
                alt="Tone"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
            <span className="font-black text-base tracking-tight text-[#fff8f2] hidden sm:inline-block">
              TONE
            </span>
          </Link>

          {/* Dedicated Home Navigation Button */}
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all backdrop-blur-md cursor-pointer ${
              pathname === '/'
                ? 'bg-[#3b4b3e]/70 border-[#b9cbba]/60 text-[#fff8f2] shadow-sm'
                : 'bg-white/[0.08] hover:bg-white/[0.14] border-white/15 text-[#a6ada6] hover:text-[#fff8f2]'
            }`}
            title="Go to Home"
          >
            <Home className="w-3.5 h-3.5 text-[#b9cbba]" />
            <span className="inline">Home</span>
          </Link>

          {/* Search Shortcut Pill */}
          <Link
            href="/search"
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 hover:border-white/25 backdrop-blur-md text-xs text-[#a6ada6] hover:text-[#fff8f2] transition-all shadow-inner group"
          >
            <Search className="w-3.5 h-3.5 text-[#a6ada6] group-hover:text-[#b9cbba] transition-colors" />
            <span className="hidden sm:inline">Search tracks, artists, albums...</span>
            <span className="sm:hidden">Search...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-mono text-white/50 border border-white/10">
              /
            </kbd>
          </Link>

          {/* Tone Match (Shazam Recognition) Button */}
          <button
            onClick={() => setToneMatchModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-[#3b4b3e]/60 border border-white/15 hover:border-[#b9cbba]/50 backdrop-blur-md text-xs font-semibold text-[#a6ada6] hover:text-[#fff8f2] transition-all cursor-pointer shadow-inner group"
            title="Identify ambient music with Tone Match"
          >
            <Radio className="w-3.5 h-3.5 text-[#b9cbba] group-hover:animate-pulse" />
            <span className="hidden md:inline">Tone Match</span>
          </button>
        </div>

        {/* Right Section: Android CTA + Sync Pill + Sync Button + User Profile Capsule */}
        <div className="flex items-center gap-2.5">
          {/* Desktop-specific Quick Actions: Storage Manager & Floating Widget Toggle */}
          {isDesktop && (
            <>
              {/* Storage Manager Pill */}
              <button
                onClick={() => setStorageModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 backdrop-blur-md text-xs font-semibold text-[#fff8f2] transition-all hover:scale-105 cursor-pointer"
                title={`macOS Local Storage: ${storageInfo?.formattedSize || '0 MB'}`}
              >
                <HardDrive className="w-3.5 h-3.5 text-[#b9cbba]" />
                <span className="hidden md:inline">{storageInfo?.formattedSize || 'Storage'}</span>
              </button>

              {/* Floating Widget Toggle */}
              <button
                onClick={() => toggleWidgetWindow()}
                className="flex items-center gap-1.5 p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 backdrop-blur-md text-[#a6ada6] hover:text-[#b9cbba] transition-all hover:scale-105 cursor-pointer"
                title="Toggle macOS Floating Mini-Player Widget"
              >
                <PictureInPicture2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Mobile App Links */}
          {!isDesktop && (
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/ios"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 backdrop-blur-md text-xs font-semibold text-[#fff8f2] transition-colors"
              >
                <Apple className="w-3.5 h-3.5 text-[#fff8f2]" />
                <span>iOS</span>
              </Link>
              <a
                href={downloadUrl}
                download="tone.apk"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 backdrop-blur-md text-xs font-semibold text-[#fff8f2] transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#b9cbba]" />
                <span>APK</span>
              </a>
            </div>
          )}

          {/* Dynamic Expanding/Contracting Sync Capsule Button */}
          <button
            onClick={() => {
              if (isSyncing) {
                setSyncModalOpen(true);
              } else {
                syncAll();
              }
            }}
            className={`group flex items-center rounded-full border transition-all duration-500 ease-out cursor-pointer select-none overflow-hidden backdrop-blur-md ${
              isSyncing
                ? 'bg-[#3b4b3e]/50 border-[#b9cbba]/60 pl-3 pr-3.5 py-1.5 shadow-lg shadow-[#b9cbba]/15'
                : 'bg-white/[0.08] border-white/15 hover:border-white/25 p-2 hover:bg-white/[0.14]'
            }`}
            title={
              isSyncing
                ? `Syncing: ${Math.floor(progress.current)}/${progress.total} (Click to view)`
                : 'Sync Library from Telegram'
            }
          >
            <RefreshCw
              className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-700 ${
                isSyncing ? 'animate-spin text-[#b9cbba]' : 'text-[#a6ada6] group-hover:text-[#b9cbba]'
              }`}
            />

            {/* Expanding/Contracting Progress Counter (e.g. 12/40) */}
            <div
              className={`flex items-center transition-all duration-500 ease-out overflow-hidden ${
                isSyncing && progress.total > 0
                  ? 'max-w-[120px] opacity-100 scale-100 ml-2'
                  : 'max-w-0 opacity-0 scale-90 ml-0 pointer-events-none'
              }`}
            >
              <span className="font-mono text-[11px] font-bold text-[#b9cbba] tabular-nums whitespace-nowrap">
                {Math.floor(progress.current)}/{progress.total}
              </span>
            </div>
          </button>

          {/* User Profile Capsule */}
          {user && (() => {
            const avatarUrl = getProfileImageUrl(user.profilePhoto);
            return (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full bg-white/[0.08] border border-white/15 hover:border-white/25 backdrop-blur-md transition-colors cursor-pointer"
                >
                  <div className="relative w-7 h-7 rounded-full overflow-hidden bg-[#1c211d] flex items-center justify-center border border-white/15 flex-shrink-0">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={user.username || 'User'}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <User className="w-3.5 h-3.5 text-[#b9cbba]" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-[#fff8f2] max-w-[100px] truncate">
                    {user.username || 'Account'}
                  </span>
                </button>

                {/* Profile Menu Dropdown */}
                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <GlassCard variant="panel" className="absolute right-0 top-10 z-50 w-48 !rounded-2xl shadow-2xl p-1.5 space-y-0.5 animate-in fade-in duration-150">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#fff8f2] hover:bg-white/10 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[#b9cbba]" />
                        <span>Account Profile</span>
                      </Link>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          setWrapModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#fff8f2] hover:bg-white/10 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#b9cbba]" />
                        <span>Tone Wrap</span>
                      </button>

                      <div className="border-t border-white/[0.06] my-1" />

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#ee7d77] hover:bg-[#ee7d77]/20 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </GlassCard>
                  </>
                )}
              </div>
            );
          })()}
        </div>
      </GlassCard>

      {wrapModalOpen && <WrapModal onClose={() => setWrapModalOpen(false)} />}
      {syncModalOpen && <SyncModal onClose={() => setSyncModalOpen(false)} />}
      {storageModalOpen && <StorageManagerModal onClose={() => setStorageModalOpen(false)} />}
      <ToneMatchModal
        isOpen={toneMatchModalOpen}
        onClose={() => setToneMatchModalOpen(false)}
        onSelectTrack={(title, artist) => {
          router.push(`/search?q=${encodeURIComponent(`${artist} ${title}`)}`);
        }}
      />
    </>
  );
}
