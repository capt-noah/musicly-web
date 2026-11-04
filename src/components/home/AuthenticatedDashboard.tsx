'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  Disc3,
  ListMusic,
  Play,
  ArrowRight,
  Flame,
  Send,
  Plus,
  GripVertical,
  X,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { usePlayer } from '@/context/PlayerContext';
import { getCoverImageUrl, formatTime } from '@/lib/utils';
import { ShuffleCarousel } from './ShuffleCarousel';
import { AlbumCard } from '../shared/AlbumCard';
import { PlaylistCard } from '../shared/PlaylistCard';
import { TrackRow } from '../shared/TrackRow';
import { AudioVisualizer } from '../player/AudioVisualizer';
import { DashboardSkeleton } from '../shared/Skeletons';
import { AddToQueueModal } from '../modals/AddToQueueModal';

export function AuthenticatedDashboard() {
  const { user } = useAuth();
  const { songs, albums, playlists, likedSongIds, isSyncing, isInitialized } = useSync();
  const {
    currentSong,
    isPlaying,
    isLoadingAudio,
    playSong,
    togglePlay,
    queue,
    queueIndex,
    removeFromQueue,
    reorderQueue,
    clearQueue,
  } = usePlayer();

  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      reorderQueue(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Dynamic time greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const favoriteSongs = useMemo(() => {
    return songs.filter((s) => likedSongIds.has(s.id));
  }, [songs, likedSongIds]);

  const heavyRotationSongs = useMemo(() => {
    return [...songs].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 5);
  }, [songs]);

  // Spotify-style Quick Access Cards (Liked Songs + Playlists + Top Tracks)
  const quickAccessItems = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      coverUrl?: string;
      isLiked?: boolean;
      onClick: () => void;
      isPlayingNow?: boolean;
    }> = [];

    // 1. Liked Songs tile
    if (favoriteSongs.length > 0) {
      items.push({
        id: 'liked-songs',
        title: 'Liked Songs',
        isLiked: true,
        onClick: () => playSong(favoriteSongs[0], favoriteSongs, 0),
        isPlayingNow: isPlaying && !!currentSong && likedSongIds.has(currentSong.id),
      });
    }

    // 2. Playlists tiles
    playlists.slice(0, 3).forEach((pl) => {
      items.push({
        id: `pl-${pl.id}`,
        title: pl.title,
        coverUrl: getCoverImageUrl(pl.coverArt),
        onClick: () => {
          if (pl.songs && pl.songs.length > 0) {
            playSong(pl.songs[0], pl.songs, 0);
          }
        },
        isPlayingNow: false,
      });
    });

    // 3. Top Tracks tiles
    songs.slice(0, 4).forEach((song) => {
      items.push({
        id: `song-${song.id}`,
        title: song.title,
        coverUrl: getCoverImageUrl(song.coverFileId, song.audioFileId || song.fileId),
        onClick: () => {
          if (currentSong?.id === song.id) {
            togglePlay();
          } else {
            playSong(song, songs, 0);
          }
        },
        isPlayingNow: isPlaying && currentSong?.id === song.id,
      });
    });

    return items.slice(0, 6);
  }, [favoriteSongs, playlists, songs, currentSong, isPlaying, likedSongIds, playSong, togglePlay]);

  // If library is uninitialized or performing initial sync with empty local cache, display skeleton loader
  if (!isInitialized || (isSyncing && songs.length === 0)) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-10 pb-16 select-none">
      {/* 1. Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#fff8f2] tracking-tight">
            {greeting}, {user?.username || 'Listener'}
          </h1>
          <p className="text-xs text-[#a6ada6] mt-1">
            {songs.length} tracks synchronized in your cloud library
          </p>
        </div>

        {songs.length > 0 && (
          <button
            onClick={() => playSong(songs[0], songs, 0)}
            className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-xs font-bold shadow-[0_0_20px_rgba(185,203,186,0.35)] transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            <span>Play Library</span>
          </button>
        )}
      </div>

      {/* 2. Spotify-Style Quick Access Grid */}
      {quickAccessItems.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickAccessItems.map((item) => (
            <div
              key={item.id}
              onClick={item.onClick}
              className="group flex items-center justify-between rounded-xl bg-[#111412]/80 hover:bg-[#1c211d] border border-white/[0.06] hover:border-white/[0.15] transition-all duration-200 cursor-pointer shadow-md overflow-hidden pr-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Thumbnail */}
                <div className="relative w-14 h-14 bg-[#1c211d] flex-shrink-0 flex items-center justify-center">
                  {item.isLiked ? (
                    <div className="w-full h-full bg-gradient-to-br from-[#ee7d77]/40 to-[#3b4b3e] flex items-center justify-center">
                      <Heart className="w-6 h-6 text-[#ee7d77] fill-[#ee7d77]" />
                    </div>
                  ) : item.coverUrl ? (
                    <Image
                      src={item.coverUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <Disc3 className="w-6 h-6 text-[#b9cbba]/60" />
                  )}
                </div>

                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs font-bold text-[#fff8f2] truncate group-hover:text-[#b9cbba] transition-colors">
                    {item.title}
                  </p>
                </div>
              </div>

              {/* Floating Play / Equalizer Indicator */}
              <div className="flex items-center">
                {item.isPlayingNow ? (
                  <AudioVisualizer isPlaying={true} barCount={3} />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#b9cbba] text-[#0d0f0d] flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 3. Empty Library Helper state */}
      {songs.length === 0 && (
        <section className="p-8 sm:p-12 rounded-3xl bg-[#111412] border border-white/[0.08] shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#b9cbba]/15 border border-[#b9cbba]/30 flex items-center justify-center mx-auto text-[#b9cbba]">
            <Send className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#fff8f2]">Your Music Cloud is Ready</h3>
            <p className="text-xs text-[#a6ada6] max-w-md mx-auto">
              Send music directly to @tone_sync_bot on Telegram to populate your library automatically.
            </p>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-xs font-bold shadow-md transition-all hover:scale-105"
          >
            <span>Connect @tone_sync_bot</span>
          </Link>
        </section>
      )}

      {/* 4. Jump Back In / Spotlight Rotation Carousel */}
      {songs.length > 0 && (
        <ShuffleCarousel
          songs={songs}
          title="Jump Back In"
          subtitle="Your personalized library stream and recently synchronized tracks"
        />
      )}

      {/* 4.5. Up Next / Play Queue Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-[#b9cbba]" />
            <h3 className="text-xl font-bold text-[#fff8f2]">Play Queue</h3>
            <span className="text-xs font-mono text-[#b9cbba] bg-[#3b4b3e]/40 border border-[#b9cbba]/30 px-2.5 py-0.5 rounded-full shadow-sm">
              {queue.length} {queue.length === 1 ? 'track' : 'tracks'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {queue.length > 1 && (
              <span className="text-[10px] font-mono text-[#a6ada6] hidden sm:inline">
                DRAG TO REORDER
              </span>
            )}
            {queue.length > 1 && (
              <button
                onClick={clearQueue}
                className="text-xs font-medium text-[#a6ada6] hover:text-[#ee7d77] hover:bg-white/5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="bg-[#111412]/60 p-4 rounded-3xl border border-white/[0.08] space-y-3 shadow-xl">
          {/* Currently Playing Card */}
          {currentSong ? (
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#1c211d]/90 border border-white/10 shadow-md">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#0d0f0d]">
                <Image
                  src={getCoverImageUrl(currentSong.coverFileId, currentSong.audioFileId || currentSong.fileId)}
                  alt={currentSong.title}
                  fill
                  className={`object-cover ${isLoadingAudio ? 'brightness-75 animate-pulse' : ''}`}
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-mono font-bold tracking-widest text-[#b9cbba] uppercase block mb-0.5">
                  NOW PLAYING
                </span>
                <p className="text-sm font-bold text-[#fff8f2] truncate">
                  {currentSong.title}
                </p>
                <p className="text-xs text-[#a6ada6] truncate mt-0.5">
                  {currentSong.artistName}
                </p>
              </div>
              {isLoadingAudio ? (
                <Loader2 className="w-4 h-4 text-[#b9cbba] animate-spin flex-shrink-0 mr-2" />
              ) : (
                <div className="mr-2">
                  <AudioVisualizer isPlaying={isPlaying} barCount={3} />
                </div>
              )}
            </div>
          ) : (
            <div className="py-3 text-center text-xs text-[#a6ada6]">
              No track currently playing. Add songs below or play an album.
            </div>
          )}

          {/* Up Next Draggable Items */}
          {queue.length > 1 && (
            <div className="space-y-1.5 pt-1">
              {queue.map((song, idx) => {
                if (idx === queueIndex) return null;
                const isDragging = draggedIndex === idx;
                const isOver = dragOverIndex === idx;

                return (
                  <div
                    key={`${song.id}-${idx}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all cursor-pointer group select-none ${
                      isDragging
                        ? 'opacity-40 scale-95 border-dashed border-white/40 bg-white/[0.08]'
                        : isOver
                        ? 'border-white/30 bg-white/[0.12] translate-y-1'
                        : 'border-white/[0.06] hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.06]'
                    }`}
                  >
                    {/* Drag Handle */}
                    <div
                      className="text-[#a6ada6]/60 group-hover:text-white cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>

                    {/* Thumb */}
                    <div
                      onClick={() => playSong(song, queue, idx)}
                      className="relative w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-[#0d0f0d] shadow-sm"
                    >
                      <Image
                        src={getCoverImageUrl(song.coverFileId, song.audioFileId || song.fileId)}
                        alt={song.title}
                        fill
                        className="object-cover group-hover:opacity-40 transition-opacity"
                        unoptimized
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Play className="w-3.5 h-3.5 text-[#b9cbba] fill-current" />
                      </div>
                    </div>

                    {/* Info */}
                    <div
                      onClick={() => playSong(song, queue, idx)}
                      className="min-w-0 flex-1"
                    >
                      <p className="text-xs font-semibold text-[#fff8f2] truncate group-hover:text-[#b9cbba] transition-colors">
                        {song.title}
                      </p>
                      <p className="text-[11px] text-[#a6ada6] truncate">
                        {song.artistName}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono text-[#a6ada6] tabular-nums">
                      {typeof song.durationSec === 'number' ? formatTime(song.durationSec) : ''}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(idx);
                      }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 text-[#a6ada6] hover:text-[#ee7d77] transition-all cursor-pointer"
                      title="Remove from queue"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dotted border 'Add Songs to Queue' Row */}
          <button
            onClick={() => setIsQueueModalOpen(true)}
            className="w-full border-2 border-dashed border-white/20 hover:border-[#b9cbba]/80 hover:bg-white/[0.04] active:bg-white/[0.08] rounded-2xl p-3.5 flex items-center justify-center gap-2.5 text-xs font-semibold text-[#a6ada6] hover:text-[#fff8f2] transition-all cursor-pointer group shadow-sm"
          >
            <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-[#b9cbba] group-hover:text-[#0d0f0d] flex items-center justify-center transition-all">
              <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90 duration-200" />
            </div>
            <span>Add Songs to Queue</span>
          </button>
        </div>
      </section>

      {/* 5. Heavy Rotation (Top Streamed Tracks) */}
      {heavyRotationSongs.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#ee7d77]" />
              <h3 className="text-xl font-bold text-[#fff8f2]">Heavy Rotation</h3>
            </div>
            <span className="text-[10px] font-mono text-[#a6ada6]">MOST PLAYED</span>
          </div>

          <div className="space-y-1 bg-[#111412]/50 p-3 rounded-2xl border border-white/[0.06]">
            {heavyRotationSongs.map((song, idx) => (
              <TrackRow
                key={song.id}
                song={song}
                index={idx}
                queueContext={heavyRotationSongs}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. Albums Grid */}
      {albums.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Disc3 className="w-4 h-4 text-[#b9cbba]" />
              <h3 className="text-xl font-bold text-[#fff8f2]">Albums in Your Collection</h3>
            </div>
            <Link
              href="/library"
              className="flex items-center gap-1 text-xs font-mono text-[#a6ada6] hover:text-[#b9cbba] transition-colors"
            >
              <span>SEE ALL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.slice(0, 5).map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Your Playlists Grid */}
      {playlists.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-[#b9cbba]" />
              <h3 className="text-xl font-bold text-[#fff8f2]">Your Playlists</h3>
            </div>
            <Link
              href="/library"
              className="flex items-center gap-1 text-xs font-mono text-[#a6ada6] hover:text-[#b9cbba] transition-colors"
            >
              <span>SEE ALL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlists.slice(0, 5).map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </section>
      )}

      <AddToQueueModal
        isOpen={isQueueModalOpen}
        onClose={() => setIsQueueModalOpen(false)}
      />
    </div>
  );
}
