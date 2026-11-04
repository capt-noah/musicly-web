'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Song, RepeatMode } from '@/types';
import { audioEngine } from '@/lib/audioEngine';
import { getAudioStreamUrl, getCoverImageUrl } from '@/lib/utils';
import { extractDominantColors } from '@/lib/colorExtractor';
import { getCachedLyrics } from '@/lib/lyrics';
import { useSync } from './SyncContext';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: Song[];
  queueIndex: number;
  lyricsOpen: boolean;
  queueOpen: boolean;
  isFullscreen: boolean;
  isLoadingAudio: boolean;
  playbackError: string | null;
  playSong: (song: Song, newQueue?: Song[], index?: number) => Promise<void>;
  togglePlay: () => Promise<void>;
  pause: () => void;
  resume: () => Promise<void>;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setSeeking: (seeking: boolean) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setFullscreen: (open: boolean) => void;
  toggleFullscreen: () => void;
  setLyricsOpen: (open: boolean) => void;
  toggleLyrics: () => void;
  setQueueOpen: (open: boolean) => void;
  toggleQueue: () => void;
  addToQueue: (songOrSongs: Song | Song[]) => void;
  playNext: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  setQueue: (songs: Song[]) => void;
  isAutoMixEnabled: boolean;
  autoMixDuration: number;
  enableBassSwap: boolean;
  preserveAlbumGapless: boolean;
  isAutoMixing: boolean;
  toggleAutoMix: () => void;
  setAutoMixDuration: (sec: number) => void;
  toggleBassSwap: () => void;
  toggleAlbumGapless: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { recordPlay, songs } = useSync();
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [queue, setQueueState] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [lyricsOpen, setLyricsOpen] = useState<boolean>(false);
  const [queueOpen, setQueueOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // AutoMix State
  const [isAutoMixEnabled, setIsAutoMixEnabled] = useState<boolean>(() => audioEngine.getAutoMixEnabled());
  const [autoMixDuration, setAutoMixDurationState] = useState<number>(() => audioEngine.getAutoMixDuration());
  const [enableBassSwap, setEnableBassSwap] = useState<boolean>(() => audioEngine.getEnableBassSwap());
  const [preserveAlbumGapless, setPreserveAlbumGapless] = useState<boolean>(() => audioEngine.getPreserveAlbumGapless());
  const [isAutoMixing, setIsAutoMixing] = useState<boolean>(false);

  const currentSongRef = useRef<Song | null>(null);
  const queueRef = useRef<Song[]>([]);
  const queueIndexRef = useRef<number>(-1);
  const repeatModeRef = useRef<RepeatMode>('off');
  const isShuffleRef = useRef<boolean>(false);

  const playDurationLoggedRef = useRef<boolean>(false);
  const playbackStartTimeRef = useRef<number>(0);

  useEffect(() => {
    currentSongRef.current = currentSong;
    queueRef.current = queue;
    queueIndexRef.current = queueIndex;
    repeatModeRef.current = repeatMode;
    isShuffleRef.current = isShuffle;
  }, [currentSong, queue, queueIndex, repeatMode, isShuffle]);

  // Sync currentSong when its lyrics or metadata are updated in SyncContext
  useEffect(() => {
    if (!currentSong) return;
    const latest = songs.find((s) => s.id === currentSong.id);
    if (latest && latest.lyrics !== currentSong.lyrics) {
      setCurrentSong((prev) => (prev && prev.id === latest.id ? { ...prev, lyrics: latest.lyrics } : prev));
    }
  }, [songs, currentSong?.id]);

  // Play a song
  const playSong = useCallback(
    async (song: Song, newQueue?: Song[], index?: number) => {
      playDurationLoggedRef.current = false;
      playbackStartTimeRef.current = Date.now();

      // Check local offline lyrics cache if not already attached
      let resolvedSong = song;
      if (!resolvedSong.lyrics) {
        const localCached = getCachedLyrics(song.id);
        if (localCached) {
          resolvedSong = { ...song, lyrics: localCached };
        } else if (typeof window !== 'undefined' && window.electronAPI?.getLyrics) {
          try {
            const diskLyrics = await window.electronAPI.getLyrics(song.id);
            if (diskLyrics) {
              resolvedSong = { ...song, lyrics: diskLyrics };
            }
          } catch {}
        }
      }

      setCurrentSong(resolvedSong);
      setIsLoadingAudio(true);
      setIsPlaying(false);
      setPlaybackError(null);

      if (newQueue) {
        setQueueState(newQueue);
        if (index !== undefined) {
          setQueueIndex(index);
        } else {
          const found = newQueue.findIndex((s) => s.id === song.id);
          setQueueIndex(found >= 0 ? found : 0);
        }
      } else if (queueRef.current.length === 0) {
        setQueueState([song]);
        setQueueIndex(0);
      }

      let audioUrl = song.audioFileId;
      if (typeof window !== 'undefined' && window.electronAPI) {
        const isLocal =
          song.isLocalOnly ||
          song.audioFileId?.startsWith('tone-local://') ||
          song.audioFileId?.startsWith('musicly-local://');
        if (!isLocal) {
          const downloadedMap: Record<string, any> = (await window.electronAPI.getDownloadedTracks().catch(() => ({}))) || {};
          if (downloadedMap[song.id]?.audioPath) {
            audioUrl = downloadedMap[song.id].audioPath;
          } else {
            audioUrl = getAudioStreamUrl(song.audioFileId);
          }
        }
      } else {
        audioUrl = getAudioStreamUrl(song.audioFileId);
      }

      await audioEngine.loadAndPlay(song, audioUrl);

      // Extract ambient colors dynamically
      const coverUrl = getCoverImageUrl(song.coverFileId, song.audioFileId || song.fileId);
      extractDominantColors(coverUrl).then((colors) => {
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--ambient-glow', colors.primary);
          document.documentElement.style.setProperty('--ambient-secondary', colors.secondary);
        }
      });
    },
    []
  );

  // Handle track ending logic
  const handleTrackEnd = useCallback(() => {
    if (repeatModeRef.current === 'one' && currentSongRef.current) {
      audioEngine.seek(0);
      audioEngine.safePlay();
      return;
    }

    const currentQueue = queueRef.current;
    const currentIndex = queueIndexRef.current;

    if (currentQueue.length > 0) {
      if (isShuffleRef.current) {
        const nextIdx = Math.floor(Math.random() * currentQueue.length);
        setQueueIndex(nextIdx);
        playSong(currentQueue[nextIdx], currentQueue, nextIdx);
        return;
      }

      if (currentIndex + 1 < currentQueue.length) {
        const nextIdx = currentIndex + 1;
        setQueueIndex(nextIdx);
        playSong(currentQueue[nextIdx], currentQueue, nextIdx);
      } else if (repeatModeRef.current === 'all') {
        setQueueIndex(0);
        playSong(currentQueue[0], currentQueue, 0);
      } else {
        setIsPlaying(false);
      }
    }
  }, [playSong]);

  const nextTrack = useCallback(() => {
    const currentQueue = queueRef.current;
    const currentIndex = queueIndexRef.current;

    if (currentQueue.length === 0) return;

    if (isShuffleRef.current) {
      const nextIdx = Math.floor(Math.random() * currentQueue.length);
      setQueueIndex(nextIdx);
      playSong(currentQueue[nextIdx], currentQueue, nextIdx);
      return;
    }

    if (currentIndex + 1 < currentQueue.length) {
      const nextIdx = currentIndex + 1;
      setQueueIndex(nextIdx);
      playSong(currentQueue[nextIdx], currentQueue, nextIdx);
    } else if (repeatModeRef.current === 'all') {
      setQueueIndex(0);
      playSong(currentQueue[0], currentQueue, 0);
    }
  }, [playSong]);

  const prevTrack = useCallback(() => {
    if (audioEngine.getCurrentTime() > 3) {
      audioEngine.seek(0);
      return;
    }

    const currentQueue = queueRef.current;
    const currentIndex = queueIndexRef.current;

    if (currentQueue.length === 0) return;

    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setQueueIndex(prevIdx);
      playSong(currentQueue[prevIdx], currentQueue, prevIdx);
    } else {
      audioEngine.seek(0);
    }
  }, [playSong]);

  // Subscribe to audio engine events
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((state) => {
      setCurrentTime(state.currentTime);
      if (state.duration > 0) setDuration(state.duration);
      setIsPlaying(state.isPlaying);
      setIsLoadingAudio(state.isLoading);
      setPlaybackError(state.error);

      // Track play count after 30 seconds of listening
      if (
        state.currentTime > 30 &&
        !playDurationLoggedRef.current &&
        currentSongRef.current
      ) {
        playDurationLoggedRef.current = true;
        recordPlay(currentSongRef.current.id, state.currentTime);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [recordPlay]);

  // Configure Audio Engine Track End, MediaSession & AutoMix Providers
  useEffect(() => {
    audioEngine.setTrackEndCallback(handleTrackEnd);
    audioEngine.setMediaSessionCallbacks(nextTrack, prevTrack);

    audioEngine.setNextTrackProvider(() => {
      if (repeatModeRef.current === 'one') return null;
      const currentQueue = queueRef.current;
      const currentIndex = queueIndexRef.current;
      if (currentQueue.length === 0) return null;

      let nextIdx = -1;
      if (isShuffleRef.current) {
        if (currentQueue.length > 1) {
          do {
            nextIdx = Math.floor(Math.random() * currentQueue.length);
          } while (nextIdx === currentIndex && currentQueue.length > 1);
        } else {
          nextIdx = 0;
        }
      } else if (currentIndex + 1 < currentQueue.length) {
        nextIdx = currentIndex + 1;
      } else if (repeatModeRef.current === 'all') {
        nextIdx = 0;
      }

      if (nextIdx < 0 || nextIdx >= currentQueue.length) return null;
      const nextSong = currentQueue[nextIdx];
      const audioUrl = getAudioStreamUrl(nextSong.audioFileId);
      return { song: nextSong, audioUrl, nextIndex: nextIdx };
    });

    audioEngine.setAutoMixHandoffCallback((nextSong, nextIdx) => {
      playDurationLoggedRef.current = false;
      playbackStartTimeRef.current = Date.now();
      setCurrentSong(nextSong);
      if (nextIdx !== undefined) {
        setQueueIndex(nextIdx);
      }
      setIsAutoMixing(true);
      const coverUrl = getCoverImageUrl(nextSong.coverFileId, nextSong.audioFileId || nextSong.fileId);
      extractDominantColors(coverUrl).then((colors) => {
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--ambient-glow', colors.primary);
          document.documentElement.style.setProperty('--ambient-secondary', colors.secondary);
        }
      });
      setTimeout(() => {
        setIsAutoMixing(false);
      }, (audioEngine.getAutoMixDuration() * 0.5 + 0.5) * 1000);
    });
  }, [handleTrackEnd, nextTrack, prevTrack]);

  const lastTimeSyncRef = useRef<number>(0);

  // Synchronize major playback state immediately
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.syncPlaybackState({
        currentSong,
        isPlaying,
        duration,
        currentTime,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
      });
    }
  }, [currentSong?.id, isPlaying, duration, volume, isMuted, isShuffle, repeatMode]);

  // Synchronize playback progress time throttled to max once per second
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI && isPlaying) {
      const now = Date.now();
      if (now - lastTimeSyncRef.current >= 1000) {
        lastTimeSyncRef.current = now;
        window.electronAPI.syncPlaybackState({
          currentSong,
          isPlaying,
          duration,
          currentTime,
          volume,
          isMuted,
          isShuffle,
          repeatMode,
        });
      }
    }
  }, [currentTime, isPlaying]);

  // Handle hardware media keys and widget IPC commands
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const unsub = window.electronAPI.onPlaybackCommand((cmd, payload) => {
        if (cmd === 'toggle') togglePlay();
        else if (cmd === 'play') resume();
        else if (cmd === 'pause') pause();
        else if (cmd === 'next') nextTrack();
        else if (cmd === 'previous') prevTrack();
        else if (cmd === 'seek' && typeof payload === 'number') seek(payload);
        else if (cmd === 'volume' && typeof payload === 'number') setVolume(payload);
      });
      return () => unsub();
    }
  }, [nextTrack, prevTrack]);

  const togglePlay = async () => {
    if (!currentSong && queue.length > 0) {
      await playSong(queue[0], queue, 0);
      return;
    }
    await audioEngine.togglePlay();
  };

  const pause = () => {
    audioEngine.pause();
  };

  const resume = async () => {
    await audioEngine.safePlay();
  };

  const seek = (seconds: number) => {
    audioEngine.seek(seconds);
    setCurrentTime(seconds);
  };

  const setSeeking = (seeking: boolean) => {
    audioEngine.setIsSeeking(seeking);
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    audioEngine.setVolume(vol);
    if (isMuted && vol > 0) {
      setIsMuted(false);
      audioEngine.setMuted(false);
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioEngine.setMuted(nextMute);
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const setFullscreen = (open: boolean) => setIsFullscreen(open);
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  const toggleLyrics = () => {
    setLyricsOpen((prev) => !prev);
    if (!lyricsOpen) setQueueOpen(false);
  };

  const toggleQueue = () => {
    setQueueOpen((prev) => !prev);
    if (!queueOpen) setLyricsOpen(false);
  };

  const addToQueue = (songOrSongs: Song | Song[]) => {
    const toAdd = Array.isArray(songOrSongs) ? songOrSongs : [songOrSongs];
    if (toAdd.length === 0) return;
    setQueueState((prev) => [...prev, ...toAdd]);
  };

  const playNext = (song: Song) => {
    setQueueState((prev) => {
      const idx = queueIndex >= 0 ? queueIndex + 1 : 0;
      const copy = [...prev];
      copy.splice(idx, 0, song);
      return copy;
    });
  };

  const removeFromQueue = (index: number) => {
    setQueueState((prev) => prev.filter((_, i) => i !== index));
    if (index < queueIndex) {
      setQueueIndex((prev) => prev - 1);
    }
  };

  const reorderQueue = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setQueueState((prev) => {
      if (fromIndex >= prev.length || toIndex >= prev.length) return prev;
      const newQueue = [...prev];
      const [movedItem] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, movedItem);
      return newQueue;
    });

    setQueueIndex((prevIndex) => {
      if (prevIndex === -1) return -1;
      if (prevIndex === fromIndex) {
        return toIndex;
      }
      if (fromIndex < prevIndex && toIndex >= prevIndex) {
        return prevIndex - 1;
      }
      if (fromIndex > prevIndex && toIndex <= prevIndex) {
        return prevIndex + 1;
      }
      return prevIndex;
    });
  };

  const clearQueue = () => {
    if (currentSong) {
      setQueueState([currentSong]);
      setQueueIndex(0);
    } else {
      setQueueState([]);
      setQueueIndex(-1);
    }
  };

  const toggleAutoMix = useCallback(() => {
    setIsAutoMixEnabled((prev) => {
      const next = !prev;
      audioEngine.setAutoMixEnabled(next);
      return next;
    });
  }, []);

  const setAutoMixDuration = useCallback((sec: number) => {
    setAutoMixDurationState(sec);
    audioEngine.setAutoMixDuration(sec);
  }, []);

  const toggleBassSwap = useCallback(() => {
    setEnableBassSwap((prev) => {
      const next = !prev;
      audioEngine.setEnableBassSwap(next);
      return next;
    });
  }, []);

  const toggleAlbumGapless = useCallback(() => {
    setPreserveAlbumGapless((prev) => {
      const next = !prev;
      audioEngine.setPreserveAlbumGapless(next);
      return next;
    });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        queue,
        queueIndex,
        lyricsOpen,
        queueOpen,
        isFullscreen,
        isLoadingAudio,
        playbackError,
        playSong,
        togglePlay,
        pause,
        resume,
        nextTrack,
        prevTrack,
        seek,
        setSeeking,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        setFullscreen,
        toggleFullscreen,
        setLyricsOpen,
        toggleLyrics,
        setQueueOpen,
        toggleQueue,
        addToQueue,
        playNext,
        removeFromQueue,
        reorderQueue,
        clearQueue,
        setQueue: setQueueState,
        isAutoMixEnabled,
        autoMixDuration,
        enableBassSwap,
        preserveAlbumGapless,
        isAutoMixing,
        toggleAutoMix,
        setAutoMixDuration,
        toggleBassSwap,
        toggleAlbumGapless,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
