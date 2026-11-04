'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Trash2, ListMusic, Play, Loader2, GripVertical, Plus } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { getCoverImageUrl, formatTime } from '@/lib/utils';
import { GlassCard } from '@/components/shared/GlassCard';
import { AudioVisualizer } from '../player/AudioVisualizer';
import { AddToQueueModal } from '../modals/AddToQueueModal';

export function QueueDrawer() {
  const {
    queueOpen,
    setQueueOpen,
    queue,
    queueIndex,
    currentSong,
    isPlaying,
    isLoadingAudio,
    playSong,
    removeFromQueue,
    reorderQueue,
    clearQueue,
  } = usePlayer();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (!queueOpen) return null;

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

  return (
    <>
      <GlassCard
        variant="panel"
        className="fixed inset-y-0 right-0 w-80 sm:w-96 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 select-none !rounded-none !border-y-0 !border-r-0 border-l border-white/12"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-[#b9cbba]" />
            <h3 className="font-bold text-sm text-[#fff8f2] tracking-wide">Play Queue</h3>
            <span className="text-xs font-mono text-[#b9cbba] bg-[#3b4b3e]/40 border border-[#b9cbba]/30 px-2.5 py-0.5 rounded-full shadow-sm">
              {queue.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {queue.length > 1 && (
              <button
                onClick={clearQueue}
                className="p-1.5 rounded-lg hover:bg-white/15 text-[#a6ada6] hover:text-[#ee7d77] transition-colors cursor-pointer"
                title="Clear Queue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setQueueOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/15 text-[#a6ada6] hover:text-[#fff8f2] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Queue List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Now Playing Section */}
          {currentSong && (
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#b9cbba] uppercase block mb-2 px-1">
                Now Playing
              </span>
              <GlassCard
                variant="card"
                className="flex items-center gap-3 p-2.5 !rounded-2xl shadow-lg border border-white/20"
              >
                <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-[#111412] shadow-sm">
                  <Image
                    src={getCoverImageUrl(currentSong.coverFileId, currentSong.audioFileId || currentSong.fileId)}
                    alt={currentSong.title}
                    fill
                    className={`object-cover ${isLoadingAudio ? 'brightness-75 animate-pulse' : ''}`}
                    unoptimized
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-[#fff8f2] truncate">
                      {currentSong.title}
                    </p>
                    {isLoadingAudio && (
                      <span className="text-[8px] font-mono font-bold tracking-wider text-[#b9cbba] bg-[#3b4b3e]/70 px-1 py-0.2 rounded-full border border-[#b9cbba]/30 animate-pulse flex-shrink-0">
                        LOADING
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#b9cbba] truncate mt-0.5">
                    {currentSong.artistName}
                  </p>
                </div>

                {isLoadingAudio ? (
                  <Loader2 className="w-4 h-4 text-[#b9cbba] animate-spin flex-shrink-0" />
                ) : (
                  <AudioVisualizer isPlaying={isPlaying} barCount={3} />
                )}
              </GlassCard>
            </div>
          )}

          {/* Next In Queue */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-mono tracking-widest text-[#a6ada6] uppercase">
                Next Up
              </span>
              <span className="text-[10px] font-mono text-white/40">
                DRAG TO REORDER
              </span>
            </div>

            {queue.length <= 1 ? (
              <div className="py-8 text-center text-[#a6ada6] space-y-1">
                <p className="text-xs">No more tracks in queue</p>
                <p className="text-[10px] font-mono text-white/40">
                  PLAY AN ALBUM OR ADD SONGS BELOW
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {queue.map((song, idx) => {
                  if (idx === queueIndex) return null; // Skip currently playing (already shown above)
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
                      className={`relative flex items-center gap-2 p-2 rounded-2xl border transition-all cursor-pointer group shadow-sm ${
                        isDragging
                          ? 'opacity-40 scale-95 border-dashed border-white/40 bg-white/[0.08]'
                          : isOver
                          ? 'border-white/30 bg-white/[0.14] translate-y-1'
                          : 'border-white/10 hover:border-white/25 bg-white/[0.04] hover:bg-white/[0.08]'
                      }`}
                    >
                      {/* Drag Grip Handle */}
                      <div
                        className="text-[#a6ada6]/60 group-hover:text-white cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>

                      {/* Thumbnail with quick play */}
                      <div
                        onClick={() => playSong(song, queue, idx)}
                        className="relative w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-[#111412] shadow-sm"
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

                      <div
                        onClick={() => playSong(song, queue, idx)}
                        className="min-w-0 flex-1"
                      >
                        <p className="text-xs font-medium text-[#fff8f2] truncate group-hover:text-[#b9cbba] transition-colors">
                          {song.title}
                        </p>
                        <p className="text-[10px] text-[#a6ada6] truncate">
                          {song.artistName}
                        </p>
                      </div>

                      <span className="text-[10px] font-mono text-[#a6ada6] tabular-nums flex-shrink-0">
                        {typeof song.durationSec === 'number' ? formatTime(song.durationSec) : ''}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(idx);
                        }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 text-[#a6ada6] hover:text-[#ee7d77] transition-all cursor-pointer flex-shrink-0"
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
              onClick={() => setIsAddModalOpen(true)}
              className="w-full border-2 border-dashed border-white/20 hover:border-[#b9cbba]/80 hover:bg-white/[0.04] active:bg-white/[0.08] rounded-2xl p-3 flex items-center justify-center gap-2.5 text-xs font-semibold text-[#a6ada6] hover:text-[#fff8f2] transition-all cursor-pointer group mt-3 shadow-sm"
            >
              <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-[#b9cbba] group-hover:text-[#0d0f0d] flex items-center justify-center transition-all">
                <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90 duration-200" />
              </div>
              <span>Add Songs to Queue</span>
            </button>
          </div>
        </div>
      </GlassCard>

      <AddToQueueModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
