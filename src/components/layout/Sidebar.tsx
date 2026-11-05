'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Search,
  Library,
  Heart,
  Plus,
  Send,
  Music2,
  Disc3,
  Mic2,
  Radio,
} from 'lucide-react';
import { AppleLogo } from '@/components/common/AppleLogo';
import { useSync } from '@/context/SyncContext';
import { usePlayer } from '@/context/PlayerContext';
import { getCoverImageUrl } from '@/lib/utils';
import { CreatePlaylistModal } from '../modals/CreatePlaylistModal';
import { ConnectTelegramModal } from '../modals/ConnectTelegramModal';
import { AudioVisualizer } from '../player/AudioVisualizer';
import { ToneMatchModal } from '../modals/ToneMatchModal';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { playlists, albums, artists, telegramStatus } = useSync();
  const { currentSong, isPlaying } = usePlayer();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);
  const [toneMatchModalOpen, setToneMatchModalOpen] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'playlists' | 'albums' | 'artists'>('all');

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Your Library', href: '/library', icon: Library },
    { label: 'Liked Songs', href: '/favorites', icon: Heart, iconColor: 'text-[#ee7d77]' },
  ];

  const libraryItems = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      subtitle: string;
      href: string;
      coverUrl?: string;
      iconType: 'playlist' | 'album' | 'artist';
    }> = [];

    if (libraryFilter === 'all' || libraryFilter === 'playlists') {
      playlists.forEach((p) => {
        items.push({
          id: `pl-${p.id}`,
          title: p.title,
          subtitle: `Playlist • ${p.itemCount || p.songs?.length || 0} songs`,
          href: `/playlist/${p.id}`,
          coverUrl: getCoverImageUrl(p.coverArt),
          iconType: 'playlist',
        });
      });
    }

    if (libraryFilter === 'all' || libraryFilter === 'albums') {
      albums.forEach((a) => {
        items.push({
          id: a.id,
          title: a.title,
          subtitle: `Album • ${a.artistName}`,
          href: `/album/${encodeURIComponent(a.id)}`,
          coverUrl: getCoverImageUrl(a.coverFileId),
          iconType: 'album',
        });
      });
    }

    if (libraryFilter === 'all' || libraryFilter === 'artists') {
      artists.forEach((art) => {
        items.push({
          id: `art-${art.name}`,
          title: art.name,
          subtitle: `Artist • ${art.songs.length} songs`,
          href: `/library`,
          iconType: 'artist',
        });
      });
    }

    return items;
  }, [playlists, albums, artists, libraryFilter]);

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen fixed left-0 top-0 bottom-0 z-30 p-3 select-none justify-between space-y-2.5 pb-28">
        {/* Top Segment: Brand & Primary Navigation */}
        <div className="rounded-2xl bg-[#111412]/90 backdrop-blur-xl border border-white/[0.07] p-3.5 shadow-xl space-y-3">
          {/* Official Tone Logo & Typography */}
          <Link href="/" className="flex items-center gap-3 px-1 py-1 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg border border-white/10 group-hover:scale-105 transition-transform bg-[#1c211d]">
              <Image
                src="/images/icon.png"
                alt="Tone"
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
              <span className="text-[9px] font-mono tracking-widest text-[#b9cbba] block mt-0.5">
                AUDIO WORKSTATION
              </span>
            </div>
          </Link>

          {/* Primary Nav Links */}
          <nav className="space-y-0.5 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1c211d] text-[#b9cbba] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                      : 'text-[#a6ada6] hover:text-[#fff8f2] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#b9cbba]' : item.iconColor || 'text-[#a6ada6]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#b9cbba] shadow-[0_0_8px_#b9cbba]" />
                  )}
                </Link>
              );
            })}

            {/* Tone Match (Shazam Recognition) Sidebar Button */}
            <button
              onClick={() => setToneMatchModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#a6ada6] hover:text-[#fff8f2] hover:bg-white/[0.04] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Radio className="w-4 h-4 text-[#b9cbba] group-hover:animate-pulse" />
                <span>Tone Match</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-[#b9cbba]">
                SHAZAM
              </span>
            </button>
          </nav>
        </div>

        {/* Middle Segment: Spotify-Style Your Library Container */}
        <div className="flex-1 flex flex-col rounded-2xl bg-[#111412]/90 backdrop-blur-xl border border-white/[0.07] p-3 shadow-xl overflow-hidden min-h-0">
          {/* Library Header */}
          <div className="flex items-center justify-between px-1 mb-2">
            <Link
              href="/library"
              className="flex items-center gap-2 text-xs font-bold text-[#fff8f2] hover:text-[#b9cbba] transition-colors"
            >
              <Library className="w-4 h-4 text-[#a6ada6]" />
              <span>Your Library</span>
            </Link>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="p-1.5 rounded-full hover:bg-white/10 text-[#a6ada6] hover:text-[#fff8f2] transition-colors"
              title="Create Playlist"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Filter Pills */}
          <div className="flex items-center gap-1 pb-2 overflow-x-auto scrollbar-none px-0.5">
            {(['all', 'playlists', 'albums', 'artists'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setLibraryFilter(tab)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider transition-all flex-shrink-0 ${
                  libraryFilter === tab
                    ? 'bg-[#1c211d] text-[#b9cbba] font-bold border border-white/10'
                    : 'text-[#a6ada6] hover:text-[#fff8f2] hover:bg-white/[0.04]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Scrollable Rich Library Items List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 pt-1">
            {libraryItems.length === 0 ? (
              <div className="py-8 text-center text-[11px] text-[#a6ada6]/60">
                No items in your collection
              </div>
            ) : (
              libraryItems.map((item) => {
                const isActiveRoute = pathname === item.href;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-2.5 p-1.5 rounded-xl transition-all group ${
                      isActiveRoute
                        ? 'bg-[#1c211d] border border-white/10'
                        : 'hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    {/* Thumbnail Image / Icon */}
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#1c211d] flex-shrink-0 flex items-center justify-center shadow-sm">
                      {item.coverUrl ? (
                        <Image
                          src={item.coverUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : item.iconType === 'artist' ? (
                        <div className="w-full h-full bg-[#3b4b3e] rounded-full flex items-center justify-center text-xs font-bold text-[#b9cbba]">
                          <Mic2 className="w-4 h-4" />
                        </div>
                      ) : item.iconType === 'album' ? (
                        <Disc3 className="w-5 h-5 text-[#b9cbba]/60" />
                      ) : (
                        <Music2 className="w-5 h-5 text-[#b9cbba]/60" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-medium truncate ${
                          isActiveRoute ? 'text-[#b9cbba] font-bold' : 'text-[#fff8f2] group-hover:text-[#b9cbba]'
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-[10px] text-[#a6ada6] truncate">
                        {item.subtitle}
                      </p>
                    </div>

                    {currentSong && isPlaying && isActiveRoute && (
                      <AudioVisualizer isPlaying={isPlaying} barCount={3} className="mr-1" />
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Utility Segment: Telegram Bot Cloud & iOS App Download */}
        <div className="rounded-2xl bg-[#111412]/90 backdrop-blur-xl border border-white/[0.07] p-2.5 shadow-xl space-y-1.5">
          {/* Telegram Sync Pill */}
          <button
            onClick={() => setTelegramModalOpen(true)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-[#1c211d]/70 hover:bg-[#1c211d] border border-white/[0.05] hover:border-white/[0.12] transition-colors text-left group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Send className="w-3.5 h-3.5 text-[#b9cbba] flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#fff8f2] truncate">Telegram Cloud</p>
                <p className="text-[9px] font-mono text-[#a6ada6] truncate">
                  {telegramStatus.linked ? 'Synced @tone_sync_bot' : 'Pair @tone_sync_bot'}
                </p>
              </div>
            </div>

            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                telegramStatus.linked
                  ? 'bg-[#b9cbba] shadow-[0_0_8px_#b9cbba]'
                  : 'bg-[#ee7d77] animate-pulse'
              }`}
            />
          </button>

          {/* iOS App Pill */}
          <Link
            href="/ios"
            className="w-full flex items-center justify-between p-2 rounded-xl bg-[#1c211d]/70 hover:bg-[#1c211d] border border-white/[0.05] hover:border-[#b9cbba]/30 transition-colors group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <AppleLogo className="w-3.5 h-3.5 text-[#b9cbba] flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#fff8f2] truncate">Tone for iOS</p>
                <p className="text-[9px] text-[#a6ada6] truncate">Lossless audio & air-sync</p>
              </div>
            </div>

            <span className="text-[9px] font-mono font-bold text-[#b9cbba] px-1.5 py-0.5 rounded bg-[#3b4b3e]/40 border border-[#b9cbba]/20">
              iOS
            </span>
          </Link>
        </div>
      </aside>

      {createModalOpen && (
        <CreatePlaylistModal onClose={() => setCreateModalOpen(false)} />
      )}

      {telegramModalOpen && (
        <ConnectTelegramModal onClose={() => setTelegramModalOpen(false)} />
      )}

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
