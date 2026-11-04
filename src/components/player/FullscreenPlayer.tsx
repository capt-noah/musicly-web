'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  ChevronDown,
  Heart,
  Shuffle,
  Repeat,
  Repeat1,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Mic2,
  ListMusic,
  Volume2,
  Volume1,
  VolumeX,
  X,
  Trash2,
  Loader2,
  GripVertical,
  Plus,
  Disc3,
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { useSync } from '@/context/SyncContext';
import { getCoverImageUrl, formatTime } from '@/lib/utils';
import { ProgressBar } from './ProgressBar';
import { LyricsViewer } from './LyricsViewer';
import { EditLyricsModal } from '../modals/EditLyricsModal';
import { AddToQueueModal } from '../modals/AddToQueueModal';
import { AudioVisualizer } from './AudioVisualizer';
import { fetchLyricsFromLrclib } from '@/lib/lyrics';

const springTransition = {
  type: 'spring',
  stiffness: 280,
  damping: 30,
  mass: 0.8,
} as const;

export function FullscreenPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    isFullscreen,
    isLoadingAudio,
    setFullscreen,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setSeeking,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    queue,
    queueIndex,
    playSong,
    removeFromQueue,
    reorderQueue,
    clearQueue,
    isAutoMixEnabled,
    autoMixDuration,
    toggleAutoMix,
    isAutoMixing,
  } = usePlayer();

  const { isLiked, toggleLike, updateSongLyrics } = useSync();
  const [activeTab, setActiveTab] = useState<'art' | 'lyrics' | 'queue'>('art');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isQueueAddModalOpen, setIsQueueAddModalOpen] = useState(false);
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

  const isSplitView = activeTab === 'lyrics' || activeTab === 'queue';

  const handleFindLyrics = async () => {
    if (!currentSong) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const result = await fetchLyricsFromLrclib(
        currentSong.title,
        currentSong.artistName,
        currentSong.albumTitle,
        duration || currentSong.durationSec
      );
      if (result && (result.syncedLyrics || result.plainLyrics)) {
        updateSongLyrics(currentSong.id, result.syncedLyrics || result.plainLyrics);
      } else {
        setSearchError('No lyrics found on LRCLIB');
      }
    } catch {
      setSearchError('Failed to fetch lyrics');
    } finally {
      setIsSearching(false);
    }
  };

  if (!isFullscreen || !currentSong) return null;

  const coverUrl = getCoverImageUrl(currentSong.coverFileId, currentSong.audioFileId || currentSong.fileId);
  const songIsLiked = isLiked(currentSong.id);
  const effectiveVolume = isMuted ? 0 : volume;

  const getVolumeIcon = () => {
    if (isMuted || effectiveVolume === 0) {
      return <VolumeX className="w-3.5 h-3.5 text-[#ee7d77]" />;
    }
    if (effectiveVolume < 0.5) {
      return <Volume1 className="w-3.5 h-3.5 text-[#a6ada6]" />;
    }
    return <Volume2 className="w-3.5 h-3.5 text-[#b9cbba]" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#070907] select-none animate-in fade-in duration-300 overflow-hidden">
      {/* 1. Dynamic Mesh Ambient Gradient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -inset-24 opacity-45 blur-[120px] scale-135 transition-all duration-1000 ease-out">
          <Image
            src={coverUrl}
            alt="Ambient Background"
            fill
            className="object-cover"
            unoptimized
            priority
          />
        </div>

        {/* Dynamic ambient color orbs */}
        <div
          className="absolute top-1/4 left-1/3 w-[65vw] h-[65vw] max-w-[750px] max-h-[750px] rounded-full blur-[140px] opacity-45 animate-ambient-drift pointer-events-none transition-all duration-1000"
          style={{
            background: 'radial-gradient(circle, var(--ambient-glow, rgba(185,203,186,0.4)) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full blur-[130px] opacity-35 animate-ambient-drift pointer-events-none transition-all duration-1000"
          style={{
            background: 'radial-gradient(circle, var(--ambient-secondary, rgba(59,75,62,0.3)) 0%, transparent 70%)',
            animationDelay: '-6s',
          }}
        />

        {/* Deep dark vignette overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      </div>

      {/* Subtle Top Pull-Down Dismiss Grabber */}
      <div className="w-full flex items-center justify-center pt-3 pb-1 relative z-20 flex-shrink-0">
        <button
          onClick={() => setFullscreen(false)}
          className="w-12 h-1.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors cursor-pointer"
          title="Dismiss Fullscreen"
        />
      </div>

      {/* 2. Main Stage (Fluid GPU-Accelerated Choreographed Layout) */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 md:px-12 py-2 sm:py-4 overflow-hidden relative z-10 min-h-0">
        <div className="w-full h-full max-w-5xl flex items-center justify-center min-h-0 relative">
          <LayoutGroup id="fullscreen-player-stage">
            {/* Split / Centered Layout Frame */}
            <motion.div
              layout
              transition={springTransition}
              className="w-full h-full flex items-center justify-center min-h-0 flex-col lg:flex-row gap-6 lg:gap-12 relative"
            >
              {/* Persistent Left/Center Cover Art & Metadata Block (NEVER remounts, slides together) */}
              <motion.div
                layout
                transition={springTransition}
                className={`flex flex-col flex-shrink-0 text-left ${
                  isSplitView
                    ? 'hidden lg:flex w-72'
                    : 'flex items-center justify-center w-full max-w-[390px] mx-auto'
                }`}
              >
                {/* 1. Cover Art Card */}
                <motion.div
                  layout
                  transition={springTransition}
                  className={`relative aspect-square rounded-3xl overflow-hidden border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_10px_30px_rgba(0,0,0,0.5)] bg-[#111412] ${
                    isSplitView
                      ? 'w-72 h-72 mb-5'
                      : 'w-60 h-60 sm:w-76 sm:h-76 md:w-92 md:h-92 lg:w-[390px] lg:h-[390px] mb-5 sm:mb-6'
                  }`}
                >
                  <Image
                    src={coverUrl}
                    alt={currentSong.title}
                    fill
                    className={`object-cover transition-all duration-300 ${
                      isLoadingAudio ? 'scale-95 brightness-75 animate-pulse' : ''
                    }`}
                    priority
                    unoptimized
                  />
                  {isLoadingAudio && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px] flex flex-col items-center justify-center gap-2.5 z-20 animate-in fade-in duration-200">
                      <div className="w-12 h-12 rounded-full bg-[#1c211d]/90 border border-white/20 shadow-2xl flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-[#b9cbba] animate-spin" />
                      </div>
                      <span className="text-[11px] font-mono font-bold tracking-widest text-[#b9cbba] drop-shadow-md">
                        PREPARING AUDIO…
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </motion.div>

                {/* 2. Metadata container (Title, Artist/Album, and Like Button move in unison with Cover) */}
                <motion.div
                  layout
                  transition={springTransition}
                  className={`w-full flex items-center justify-between gap-4 ${
                    isSplitView ? 'px-0' : 'px-2'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <h1
                      className={`font-black text-[#fff8f2] tracking-tight truncate ${
                        isSplitView ? 'text-xl' : 'text-2xl sm:text-3xl md:text-4xl'
                      }`}
                    >
                      {currentSong.title}
                    </h1>

                    <p
                      className={`font-medium truncate mt-0.5 ${
                        isSplitView
                          ? 'text-sm text-[#b9cbba]'
                          : 'text-sm sm:text-base md:text-lg text-[#b9cbba]'
                      }`}
                    >
                      {currentSong.artistName}
                      {currentSong.albumTitle && (
                        <span
                          className={`font-normal text-[#a6ada6]/70 ml-2 ${
                            isSplitView ? 'text-xs' : 'text-xs sm:text-sm'
                          }`}
                        >
                          • {currentSong.albumTitle}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* 3. Heart Like Button */}
                  <button
                    onClick={() => toggleLike(currentSong.id)}
                    className={`rounded-full hover:bg-white/10 transition-transform active:scale-90 flex-shrink-0 cursor-pointer ${
                      isSplitView ? 'p-1.5' : 'p-2.5'
                    }`}
                    title={songIsLiked ? 'Unlike' : 'Like'}
                  >
                    <Heart
                      className={`transition-colors ${
                        isSplitView ? 'w-5 h-5' : 'w-6 h-6 sm:w-7 sm:h-7'
                      } ${
                        songIsLiked ? 'text-[#ee7d77] fill-[#ee7d77]' : 'text-[#a6ada6] hover:text-[#fff8f2]'
                      }`}
                    />
                  </button>
                </motion.div>
              </motion.div>

              {/* 5. Right-Hand Section: Lyrics or In-Player Queue (Fluid Depth Entrance & Exit) */}
              <AnimatePresence mode="popLayout">
                {isSplitView && (
                  <motion.div
                    key="content-panel"
                    initial={{ opacity: 0, scale: 0.95, x: 24 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: 24 }}
                    transition={springTransition}
                    className="flex-1 w-full h-full max-h-[500px] lg:max-h-[560px] flex flex-col rounded-3xl bg-black/25 backdrop-blur-xl border border-white/[0.08] overflow-hidden shadow-2xl min-w-0"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {activeTab === 'lyrics' ? (
                        <motion.div
                          key="tab-lyrics"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="w-full h-full overflow-hidden"
                        >
                          <LyricsViewer
                            lyrics={currentSong.lyrics}
                            currentTime={currentTime}
                            onSeek={seek}
                            onFindLyrics={handleFindLyrics}
                            onOpenEditor={() => setEditModalOpen(true)}
                            isSearching={isSearching}
                            searchError={searchError}
                            className="h-full"
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="tab-queue"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="w-full h-full flex flex-col overflow-hidden"
                        >
                          {/* Header inside In-Player Queue */}
                          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
                            <div className="flex items-center gap-2.5">
                              <ListMusic className="w-5 h-5 text-[#b9cbba]" />
                              <h3 className="font-bold text-sm text-[#fff8f2] tracking-wide">Playing Queue</h3>
                              <span className="text-xs font-mono text-[#b9cbba] bg-[#3b4b3e]/40 border border-[#b9cbba]/20 px-2.5 py-0.5 rounded-full">
                                {queue.length} tracks
                              </span>
                            </div>

                            {queue.length > 1 && (
                              <button
                                onClick={clearQueue}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-[#a6ada6] hover:text-[#ee7d77] hover:bg-white/[0.06] transition-colors cursor-pointer"
                                title="Clear Queue"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Clear</span>
                              </button>
                            )}
                          </div>

                          {/* Queue list scroll container */}
                          <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Currently Playing Track */}
                            <div>
                              <span className="text-[10px] font-mono tracking-widest text-[#b9cbba] uppercase block mb-2 px-1">
                                Now Playing
                              </span>
                              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.08] border border-white/15 backdrop-blur-md shadow-lg">
                                <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-[#111412]">
                                  <Image
                                    src={coverUrl}
                                    alt={currentSong.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-[#fff8f2] truncate">
                                    {currentSong.title}
                                  </p>
                                  <p className="text-xs text-[#b9cbba] truncate mt-0.5">
                                    {currentSong.artistName}
                                  </p>
                                </div>

                                <AudioVisualizer isPlaying={isPlaying} barCount={3} />
                              </div>
                            </div>

                            {/* Up Next List */}
                            <div>
                              <div className="flex items-center justify-between mb-2 px-1">
                                <span className="text-[10px] font-mono tracking-widest text-[#a6ada6] uppercase">
                                  Up Next
                                </span>
                                <span className="text-[10px] font-mono text-white/40">
                                  DRAG TO REORDER
                                </span>
                              </div>

                              {queue.length <= 1 ? (
                                <div className="py-8 text-center text-[#a6ada6] space-y-1">
                                  <p className="text-xs">No more tracks queued</p>
                                  <p className="text-[10px] font-mono mt-1 text-white/40">
                                    QUEUE TRACKS FROM ALBUMS OR PLAYLISTS BELOW
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
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
                                        className={`flex items-center gap-2.5 p-2.5 rounded-2xl border backdrop-blur-md shadow-sm transition-all cursor-pointer group ${
                                          isDragging
                                            ? 'opacity-40 scale-95 border-dashed border-white/40 bg-white/[0.08]'
                                            : isOver
                                            ? 'border-white/30 bg-white/[0.14] translate-y-1'
                                            : 'border-white/10 hover:border-white/20 bg-white/[0.05] hover:bg-white/[0.09]'
                                        }`}
                                      >
                                        {/* Drag Grip Handle */}
                                        <div
                                          className="text-[#a6ada6]/60 group-hover:text-white cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
                                          title="Drag to reorder"
                                        >
                                          <GripVertical className="w-3.5 h-3.5" />
                                        </div>

                                        <div
                                          onClick={() => playSong(song, queue, idx)}
                                          className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#111412] shadow-sm"
                                        >
                                          <Image
                                            src={getCoverImageUrl(song.coverFileId, song.audioFileId || song.fileId)}
                                            alt={song.title}
                                            fill
                                            className="object-cover group-hover:opacity-40 transition-opacity"
                                            unoptimized
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <Play className="w-4 h-4 text-[#b9cbba] fill-current" />
                                          </div>
                                        </div>

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

                                        <span className="text-[11px] font-mono text-[#a6ada6] tabular-nums">
                                          {typeof song.durationSec === 'number' ? formatTime(song.durationSec) : ''}
                                        </span>

                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeFromQueue(idx);
                                          }}
                                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 text-[#a6ada6] hover:text-[#ee7d77] transition-all cursor-pointer"
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
                                onClick={() => setIsQueueAddModalOpen(true)}
                                className="w-full border-2 border-dashed border-white/20 hover:border-[#b9cbba]/80 hover:bg-white/[0.04] active:bg-white/[0.08] rounded-2xl p-3 flex items-center justify-center gap-2.5 text-xs font-semibold text-[#a6ada6] hover:text-[#fff8f2] transition-all cursor-pointer group mt-3 shadow-sm"
                              >
                                <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-[#b9cbba] group-hover:text-[#0d0f0d] flex items-center justify-center transition-all">
                                  <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90 duration-200" />
                                </div>
                                <span>Add Songs to Queue</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        </div>
      </main>

      <EditLyricsModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        song={currentSong}
      />

      <AddToQueueModal
        isOpen={isQueueAddModalOpen}
        onClose={() => setIsQueueAddModalOpen(false)}
      />

      {/* 3. Streamlined Minimalist Bottom Controls Footer */}
      <footer className="w-full max-w-2xl mx-auto px-6 sm:px-8 pb-6 pt-1 space-y-3.5 relative z-20 flex-shrink-0">
        {/* Row 1: Scrubber Timeline Bar */}
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={seek}
          onSeekingChange={setSeeking}
          showTimestamps
          isLoading={isLoadingAudio}
        />

        {/* Row 2: Transport Playback Controls */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                isShuffle ? 'text-[#b9cbba] bg-[#3b4b3e]/40 shadow-inner' : 'text-[#a6ada6] hover:text-[#fff8f2]'
              }`}
              title="Shuffle (S)"
            >
              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={toggleAutoMix}
              className={`p-2 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                isAutoMixEnabled ? 'text-[#b9cbba] bg-[#3b4b3e]/40 shadow-inner' : 'text-[#a6ada6] hover:text-[#fff8f2]'
              } ${isAutoMixing ? 'animate-pulse ring-1 ring-[#b9cbba]/50' : ''}`}
              title={`AutoMix: ${isAutoMixEnabled ? `${autoMixDuration.toFixed(1)}s Active` : 'Disabled'}`}
            >
              <Disc3 className={`w-4 h-4 sm:w-5 sm:h-5 ${isAutoMixing ? 'animate-spin' : ''}`} />
              {isAutoMixEnabled && (
                <span className="hidden sm:inline text-[10px] font-mono font-bold tracking-tight">
                  {autoMixDuration.toFixed(1)}s
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={prevTrack}
              className="p-2.5 rounded-full hover:bg-white/10 text-[#fff8f2] transition-transform active:scale-90 cursor-pointer"
              title="Previous Track (Shift+Left)"
            >
              <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              disabled={isLoadingAudio}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#fff8f2] hover:bg-white text-[#0d0f0d] shadow-[0_0_30px_rgba(185,203,186,0.45)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
                isLoadingAudio ? 'animate-pulse cursor-wait' : 'cursor-pointer'
              }`}
              title={isLoadingAudio ? 'Buffering audio...' : 'Play/Pause (Space)'}
            >
              {isLoadingAudio ? (
                <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 animate-spin text-[#0d0f0d]" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
              ) : (
                <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-2.5 rounded-full hover:bg-white/10 text-[#fff8f2] transition-transform active:scale-90 cursor-pointer"
              title="Next Track (Shift+Right)"
            >
              <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </button>
          </div>

          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              repeatMode !== 'off' ? 'text-[#b9cbba] bg-[#3b4b3e]/40 shadow-inner' : 'text-[#a6ada6] hover:text-[#fff8f2]'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>

        {/* Row 3: Minimalist Dock (Lyrics, Volume, Queue & Dismiss) */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/[0.06] text-xs font-semibold">
          {/* Left: Lyrics Button */}
          <button
            onClick={() => setActiveTab((prev) => (prev === 'lyrics' ? 'art' : 'lyrics'))}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'lyrics'
                ? 'bg-[#b9cbba] text-[#111412] font-bold shadow-md shadow-[#b9cbba]/25'
                : 'text-[#a6ada6] hover:text-[#fff8f2] hover:bg-white/[0.08]'
            }`}
            title="Lyrics"
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>

          {/* Center: Clean Smooth Volume Slider */}
          <div className="flex items-center gap-2 flex-1 max-w-[170px] sm:max-w-[210px] select-none group">
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              className="p-1 rounded-full hover:bg-white/10 text-[#a6ada6] hover:text-[#fff8f2] transition-colors flex-shrink-0 cursor-pointer"
            >
              {getVolumeIcon()}
            </button>

            <div className="relative flex-1 flex items-center h-4">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={effectiveVolume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 group-hover:h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer focus:outline-none transition-all duration-150"
                style={{
                  background: `linear-gradient(to right, #b9cbba 0%, #b9cbba ${effectiveVolume * 100}%, rgba(255, 255, 255, 0.15) ${effectiveVolume * 100}%, rgba(255, 255, 255, 0.15) 100%)`,
                }}
              />
            </div>
          </div>

          {/* Right: Queue Button & Close Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab((prev) => (prev === 'queue' ? 'art' : 'queue'))}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-[#b9cbba] text-[#111412] font-bold shadow-md shadow-[#b9cbba]/25'
                  : 'text-[#a6ada6] hover:text-[#fff8f2] hover:bg-white/[0.08]'
              }`}
              title="Playing Queue"
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>Queue</span>
            </button>

            <button
              onClick={() => setFullscreen(false)}
              className="p-1.5 rounded-full text-[#a6ada6] hover:text-[#fff8f2] hover:bg-white/[0.08] transition-colors cursor-pointer"
              title="Minimize Fullscreen"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
