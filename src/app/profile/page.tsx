'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  User,
  Camera,
  Send,
  Sparkles,
  Headphones,
  Flame,
  Music2,
  LogOut,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { getProfileImageUrl } from '@/lib/utils';
import { ConnectTelegramModal } from '@/components/modals/ConnectTelegramModal';
import { WrapModal } from '@/components/modals/WrapModal';
import { ProfileSkeleton } from '@/components/shared/Skeletons';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, isMounted, logout, updateAvatar, updateEmail } = useAuth();
  const { stats, telegramStatus, isPageLoading } = useSync();
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);
  const [wrapModalOpen, setWrapModalOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState(user?.email || '');
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        await updateAvatar(base64);
      }
      setIsUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  if (!isMounted || isLoading || isPageLoading) {
    return <ProfileSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="py-20 text-center space-y-4 select-none">
        <div className="w-16 h-16 rounded-full bg-[#1c211d] border border-white/10 flex items-center justify-center mx-auto text-[#b9cbba]">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#fff8f2]">You are not signed in</h2>
        <p className="text-xs text-[#a6ada6] max-w-sm mx-auto">
          Sign in to sync your audio library, pair your Telegram bot, and curate custom playlists.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#b9cbba] text-[#0d0f0d] font-bold text-xs shadow-lg hover:bg-[#fff8f2] transition-colors"
        >
          <span>Sign In / Register</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 select-none">
      {/* Profile Header Hero */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#1c211d] via-[#111412] to-[#0d0f0d] border border-white/[0.08] shadow-2xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar with Camera Upload Overlay & Default Profile Icon fallback */}
          {(() => {
            const avatarUrl = getProfileImageUrl(user.profilePhoto);
            return (
              <div className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-[#1c211d] border-2 border-white/15 shadow-xl flex-shrink-0 flex items-center justify-center">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={user.username || 'User'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#b9cbba]">
                    <User className="w-12 h-12 stroke-[1.5]" />
                  </div>
                )}

                {/* Uploading Spinner Overlay */}
                {isUploadingPhoto ? (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
                    <RefreshCw className="w-6 h-6 text-[#b9cbba] animate-spin mb-1" />
                    <span className="text-[9px] font-mono text-[#b9cbba] tracking-wider">SAVING...</span>
                  </div>
                ) : (
                  /* Hover Camera overlay */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity"
                  >
                    <Camera className="w-6 h-6 text-[#b9cbba] mb-1" />
                    <span className="text-[9px] font-mono text-[#fff8f2]">CHANGE</span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>
            );
          })()}

          <div className="text-center sm:text-left space-y-1.5">
            <span className="text-[10px] font-mono tracking-widest text-[#b9cbba] uppercase block font-semibold">
              Tone Member
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#fff8f2] tracking-tight">
              {user.username || 'Tone Listener'}
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
              {telegramStatus.linked ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3b4b3e]/40 border border-[#b9cbba]/30 text-[11px] font-mono text-[#b9cbba]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b9cbba] animate-pulse" />
                  <span>TG: @{user.telegramId || telegramStatus.telegramId || 'Linked'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono text-[#a6ada6]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a6ada6]/60" />
                  <span>TG: UNPAIRED</span>
                </span>
              )}

              {user.id && (
                <span className="text-[11px] text-[#a6ada6] font-mono">
                  ID: {String(user.id).slice(0, 8)}
                </span>
              )}
            </div>
            {isUploadingPhoto && (
              <p className="text-[10px] text-[#b9cbba] font-mono animate-pulse">
                SAVING NEW AVATAR...
              </p>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1c211d] hover:bg-[#ee7d77]/20 border border-white/10 hover:border-[#ee7d77]/40 text-[#a6ada6] hover:text-[#ee7d77] text-xs font-semibold transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* 3-Column Bento Grid: Tone Wrap, Telegram Integration & Recovery Email */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tone Wrap Promo Card */}
        <div
          onClick={() => setWrapModalOpen(true)}
          className="group relative p-7 rounded-[28px] bg-gradient-to-br from-[#3b4b3e]/40 via-[#1c211d] to-[#111412] border border-white/[0.08] hover:border-[#b9cbba]/40 shadow-xl cursor-pointer transition-all duration-300 overflow-hidden flex flex-col justify-between space-y-4"
        >
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#b9cbba] text-xs font-mono tracking-widest uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Audio Wrap Story</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#b9cbba] text-[#0d0f0d] font-bold">
                READY
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#fff8f2] tracking-tight group-hover:text-[#b9cbba] transition-colors">
              Explore Your Tone Wrap
            </h3>

            <p className="text-xs text-[#a6ada6] leading-relaxed">
              View your total listening time, top artists, stream counts, and export high-res shareable story cards.
            </p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b9cbba]">
              <span>Launch Wrap Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Telegram Integration Card */}
        <div className="p-7 rounded-[28px] bg-[#111412] border border-white/[0.08] shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Send className="w-5 h-5 text-[#b9cbba]" />
                <h3 className="text-base font-bold text-[#fff8f2]">Telegram Music Cloud</h3>
              </div>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold ${
                  telegramStatus.linked
                    ? 'bg-[#3b4b3e]/40 text-[#b9cbba] border border-[#b9cbba]/30'
                    : 'bg-[#ee7d77]/20 text-[#ee7d77] border border-[#ee7d77]/30'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    telegramStatus.linked ? 'bg-[#b9cbba] animate-pulse' : 'bg-[#ee7d77]'
                  }`}
                />
                <span>{telegramStatus.linked ? 'LINKED' : 'UNPAIRED'}</span>
              </div>
            </div>

            <p className="text-xs text-[#a6ada6] leading-relaxed">
              Send music directly to @tone_sync_bot on Telegram to automatically sync with your Tone library.
            </p>
          </div>

          <button
            onClick={() => setTelegramModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#1c211d] hover:bg-white/10 border border-white/10 text-xs font-bold text-[#fff8f2] transition-all cursor-pointer hover:border-white/20"
          >
            <ShieldCheck className="w-4 h-4 text-[#b9cbba]" />
            <span>{telegramStatus.linked ? 'Manage Telegram Pairing' : 'Pair @tone_sync_bot'}</span>
          </button>
        </div>

        {/* Account Recovery Email Card */}
        <div className="p-7 rounded-[28px] bg-[#111412] border border-white/[0.08] shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-[#b9cbba]" />
                <h3 className="text-base font-bold text-[#fff8f2]">Account Recovery</h3>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-[#a6ada6] uppercase">
                {user.email ? 'ATTACHED' : 'OPTIONAL'}
              </span>
            </div>

            <p className="text-xs text-[#a6ada6] leading-relaxed">
              {user.email
                ? `Recovery email: ${user.email}`
                : 'No recovery email attached. You can optionally add one for account recovery.'}
            </p>
          </div>

          {isEditingEmail ? (
            <div className="space-y-2 pt-1">
              <input
                type="email"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c211d] border border-white/10 text-xs text-[#fff8f2] focus:outline-none focus:border-[#b9cbba]"
              />
              {emailStatus && (
                <p className="text-[11px] text-[#ee7d77] font-medium">{emailStatus}</p>
              )}
              <div className="flex items-center gap-2">
                <button
                  disabled={isSavingEmail}
                  onClick={async () => {
                    setIsSavingEmail(true);
                    setEmailStatus(null);
                    const res = await updateEmail(emailValue.trim() || null);
                    setIsSavingEmail(false);
                    if (res.success) {
                      setIsEditingEmail(false);
                    } else {
                      setEmailStatus(res.error || 'Failed to update email');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#b9cbba] text-[#0d0f0d] text-xs font-bold hover:bg-[#b9cbba]/90 transition-all cursor-pointer"
                >
                  {isSavingEmail ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditingEmail(false);
                    setEmailStatus(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] text-[#a6ada6] text-xs font-semibold hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setEmailValue(user.email || '');
                setIsEditingEmail(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#1c211d] hover:bg-white/10 border border-white/10 text-xs font-bold text-[#fff8f2] transition-all cursor-pointer hover:border-white/20"
            >
              <span>{user.email ? 'Edit Recovery Email' : 'Attach Recovery Email'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Listening Stats Bento Grid */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#fff8f2]">Listening Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#111412] border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-2 text-[#b9cbba]">
              <Headphones className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Listening Time</span>
            </div>
            <p className="text-2xl font-black text-[#fff8f2] tabular-nums">
              {stats.totalMinutes}
            </p>
            <p className="text-[10px] text-[#a6ada6] font-mono">MINUTES LISTENED</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#111412] border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-2 text-[#ee7d77]">
              <Flame className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Total Plays</span>
            </div>
            <p className="text-2xl font-black text-[#fff8f2] tabular-nums">
              {stats.totalPlays}
            </p>
            <p className="text-[10px] text-[#a6ada6] font-mono">TRACK ROTATIONS</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#111412] border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-2 text-[#b9cbba]">
              <Music2 className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Library Size</span>
            </div>
            <p className="text-2xl font-black text-[#fff8f2] tabular-nums">
              {stats.uniqueTracksCount}
            </p>
            <p className="text-[10px] text-[#a6ada6] font-mono">SYNCHRONIZED TRACKS</p>
          </div>
        </div>
      </section>

      {telegramModalOpen && (
        <ConnectTelegramModal onClose={() => setTelegramModalOpen(false)} />
      )}

      {wrapModalOpen && <WrapModal onClose={() => setWrapModalOpen(false)} />}
    </div>
  );
}
