'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Send,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Unlink,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { useSync } from '@/context/SyncContext';

interface ConnectTelegramModalProps {
  onClose: () => void;
}

export function ConnectTelegramModal({ onClose }: ConnectTelegramModalProps) {
  const {
    telegramStatus,
    refreshTelegramStatus,
    generateTelegramLinkToken,
    unlinkTelegram,
  } = useSync();

  const [token, setToken] = useState<string | null>(null);
  const [botUsername, setBotUsername] = useState<string>('tone_sync_bot');
  const [copied, setCopied] = useState(false);
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [unlinkError, setUnlinkError] = useState<string | null>(null);

  // Generate pairing token once on mount or when unlinked
  const loadToken = useCallback(async () => {
    setIsLoadingToken(true);
    try {
      const res = await generateTelegramLinkToken();
      if (res) {
        setToken(res.token);
        if (res.botUsername) setBotUsername(res.botUsername);
      }
    } catch (err) {
      console.error('Failed to load token:', err);
    } finally {
      setIsLoadingToken(false);
    }
  }, [generateTelegramLinkToken]);

  // Initial load effect strictly when unlinked and token has not yet been fetched
  useEffect(() => {
    if (!telegramStatus.linked && !token) {
      loadToken();
    }
  }, [telegramStatus.linked, token, loadToken]);

  // Real-time status polling while open (every 3 seconds) without regenerating pairing tokens
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTelegramStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshTelegramStatus]);

  const handleCopy = () => {
    if (!token) return;
    navigator.clipboard.writeText(`/start ${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUnlink = async () => {
    setIsUnlinking(true);
    setUnlinkError(null);
    try {
      const success = await unlinkTelegram();
      if (success) {
        setShowUnlinkConfirm(false);
        // Refresh pairing token immediately so user can re-link anytime
        loadToken();
      } else {
        setUnlinkError('Failed to unlink. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error unlinking account';
      setUnlinkError(msg);
    } finally {
      setIsUnlinking(false);
    }
  };

  const telegramDeepLink = `https://t.me/${botUsername}?start=${token || ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-[32px] bg-[#111412] border border-white/10 p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.9)] space-y-6">
        {/* Header with Comfortable Spacing */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#b9cbba]/15 border border-[#b9cbba]/30 flex items-center justify-center flex-shrink-0">
              <Send className="w-6 h-6 text-[#b9cbba]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#fff8f2] tracking-tight">
                Telegram Cloud Sync
              </h3>
              <p className="text-xs text-[#a6ada6] mt-0.5">
                Lossless audio import with @{botUsername}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-[#a6ada6] hover:text-[#fff8f2] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        {telegramStatus.linked ? (
          /* ================= LINKED STATE ================= */
          <div className="space-y-6">
            {/* Status Banner */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#3b4b3e]/30 via-[#1c211d] to-[#111412] border border-[#b9cbba]/30 space-y-4 shadow-lg">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#b9cbba] text-[#0d0f0d] text-xs font-bold shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>CONNECTED & SYNCED</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#b9cbba]">
                  <span className="w-2 h-2 rounded-full bg-[#b9cbba] animate-ping" />
                  <span>Cloud Active</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-[#fff8f2]">
                  Your Telegram Account is Linked
                </h4>
                <p className="text-xs text-[#a6ada6] leading-relaxed">
                  Send music tracks directly to{' '}
                  <strong className="text-[#fff8f2]">@{botUsername}</strong> on Telegram.
                  They will automatically appear in your Tone library and stream across all your devices.
                </p>
              </div>

              {/* Status Details Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-[#111412]/80 border border-white/[0.06] space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#a6ada6]">
                    Telegram ID
                  </span>
                  <p className="text-xs font-bold text-[#fff8f2] font-mono truncate">
                    {telegramStatus.telegramId || 'Linked'}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-[#111412]/80 border border-white/[0.06] space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#a6ada6]">
                    Auto Ingestion
                  </span>
                  <p className="text-xs font-bold text-[#b9cbba] font-mono">
                    Enabled (Live)
                  </p>
                </div>
              </div>
            </div>

            {/* Unlink Confirmation Card (if triggered) */}
            {showUnlinkConfirm ? (
              <div className="p-5 rounded-3xl bg-[#ee7d77]/10 border border-[#ee7d77]/30 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#ee7d77] flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="text-sm font-bold text-[#fff8f2]">
                      Unlink Telegram Account?
                    </h5>
                    <p className="text-xs text-[#a6ada6] leading-relaxed">
                      This will remove your linked Telegram ID and reset your profile picture to the default icon. You can re-link your Telegram account at any time.
                    </p>
                    {unlinkError && (
                      <p className="text-xs font-bold text-[#ee7d77] pt-1">
                        {unlinkError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleUnlink}
                    disabled={isUnlinking}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#ee7d77] hover:bg-[#ff8f8a] text-[#0d0f0d] font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isUnlinking ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Unlinking...</span>
                      </>
                    ) : (
                      <>
                        <Unlink className="w-4 h-4" />
                        <span>Yes, Unlink Account</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowUnlinkConfirm(false)}
                    disabled={isUnlinking}
                    className="px-5 py-3 rounded-2xl bg-[#1c211d] hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#fff8f2] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Action Buttons */
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={`https://t.me/${botUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open @{botUsername}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setShowUnlinkConfirm(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#1c211d] hover:bg-[#ee7d77]/20 border border-white/10 hover:border-[#ee7d77]/40 text-[#a6ada6] hover:text-[#ee7d77] text-xs font-bold transition-all cursor-pointer"
                >
                  <Unlink className="w-4 h-4" />
                  <span>Unlink Telegram</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ================= UNLINKED / PAIRING STATE ================= */
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-[#fff8f2]">
                Pair with @{botUsername}
              </h4>
              <p className="text-xs text-[#a6ada6] leading-relaxed">
                Send music directly to @{botUsername} on Telegram. Tracks will automatically appear in your Tone library.
              </p>
            </div>

            {isLoadingToken ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-7 h-7 text-[#b9cbba] animate-spin mx-auto" />
                <p className="text-xs text-[#a6ada6] font-mono animate-pulse">
                  GENERATING SECURE PAIRING KEY...
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Method 1: Instant Deep Link */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#b9cbba] block">
                    Option 1: Instant One-Click Connect
                  </span>
                  <a
                    href={telegramDeepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] font-bold text-sm shadow-[0_0_25px_rgba(185,203,186,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <span>Open @{botUsername} in Telegram</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Method 2: Copy Command */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#a6ada6] block">
                    Option 2: Or Send Command Manually
                  </span>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1c211d] border border-white/10 font-mono text-xs text-[#fff8f2]">
                    <span className="truncate pr-2 select-all">/start {token || '...'}</span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#b9cbba] transition-colors flex-shrink-0 text-xs font-semibold cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#4ade80]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Real-time waiting radar */}
                <div className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-[#1c211d]/50 border border-white/[0.06] text-xs font-mono text-[#a6ada6]">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b9cbba] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#b9cbba]" />
                  </span>
                  <span>Listening for Telegram bot confirmation...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
