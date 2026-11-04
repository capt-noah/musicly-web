import { Song } from '@/types';
import { getCoverImageUrl } from './utils';

type AudioCallback = (state: {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
}) => void;

export interface NextTrackPayload {
  song: Song;
  audioUrl: string;
  nextIndex?: number;
}

class AudioEngine {
  private deckA: HTMLAudioElement | null = null;
  private deckB: HTMLAudioElement | null = null;
  private activeDeckName: 'deckA' | 'deckB' = 'deckA';

  private subscribers: Set<AudioCallback> = new Set();
  private currentSong: Song | null = null;
  private isSeeking: boolean = false;
  private currentVolume: number = 0.85;
  private isMuted: boolean = false;

  // Callbacks
  private onTrackEndCallback: (() => void) | null = null;
  private onNextCallback: (() => void) | null = null;
  private onPrevCallback: (() => void) | null = null;
  private nextTrackProvider: (() => NextTrackPayload | null) | null = null;
  private onAutoMixHandoffCallback: ((song: Song, nextIndex?: number) => void) | null = null;

  // AutoMix Engine State & Config
  private isAutoMixing: boolean = false;
  private autoMixTimer: ReturnType<typeof setInterval> | null = null;
  private autoMixStartDate: number = 0;
  private autoMixHandedOff: boolean = false;

  private isAutoMixEnabledState: boolean = true;
  private autoMixDurationState: number = 5.0;
  private enableBassSwapState: boolean = true;
  private preserveAlbumGaplessState: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      // Load saved preferences with safe defaults (Default: ON)
      try {
        const savedEnabled = localStorage.getItem('tone_automix_enabled');
        this.isAutoMixEnabledState = savedEnabled !== null ? savedEnabled !== 'false' : true;

        const savedDuration = localStorage.getItem('tone_automix_duration');
        this.autoMixDurationState = savedDuration ? Math.max(2.0, Math.min(12.0, parseFloat(savedDuration))) : 5.0;

        const savedBassSwap = localStorage.getItem('tone_automix_bass_swap');
        this.enableBassSwapState = savedBassSwap !== null ? savedBassSwap !== 'false' : true;

        const savedGapless = localStorage.getItem('tone_automix_gapless_album');
        this.preserveAlbumGaplessState = savedGapless !== null ? savedGapless !== 'false' : true;
      } catch (err) {
        console.warn('[AudioEngine] Could not read preferences from localStorage:', err);
      }

      this.deckA = new Audio();
      this.deckA.preload = 'auto';
      this.deckA.volume = this.currentVolume;

      this.deckB = new Audio();
      this.deckB.preload = 'auto';
      this.deckB.volume = 0;

      this.attachListeners(this.deckA, 'deckA');
      this.attachListeners(this.deckB, 'deckB');
    }
  }

  private get activeDeck(): HTMLAudioElement | null {
    return this.activeDeckName === 'deckA' ? this.deckA : this.deckB;
  }

  private get standbyDeck(): HTMLAudioElement | null {
    return this.activeDeckName === 'deckA' ? this.deckB : this.deckA;
  }

  private attachListeners(audio: HTMLAudioElement, deckName: 'deckA' | 'deckB') {
    audio.addEventListener('timeupdate', () => {
      if (this.activeDeckName === deckName && !this.isSeeking) {
        this.emitState();
        this.checkForAutoMixTrigger();
      }
    });

    audio.addEventListener('loadstart', () => {
      if (this.activeDeckName === deckName && !this.isAutoMixing) {
        this.notifySubscribers({
          currentTime: 0,
          duration: 0,
          isPlaying: false,
          isLoading: true,
          error: null,
        });
      }
    });

    audio.addEventListener('play', () => {
      if (this.activeDeckName === deckName) {
        this.emitState();
      }
    });

    audio.addEventListener('playing', () => {
      if (this.activeDeckName === deckName) {
        this.notifySubscribers({
          currentTime: audio.currentTime || 0,
          duration: audio.duration || 0,
          isPlaying: true,
          isLoading: false,
          error: null,
        });
      }
    });

    audio.addEventListener('pause', () => {
      if (this.activeDeckName === deckName && !this.isAutoMixing) {
        this.emitState();
      }
    });

    audio.addEventListener('waiting', () => {
      if (this.activeDeckName === deckName && !this.isAutoMixing) {
        this.notifySubscribers({
          currentTime: audio.currentTime || 0,
          duration: audio.duration || 0,
          isPlaying: false,
          isLoading: true,
          error: null,
        });
      }
    });

    audio.addEventListener('stalled', () => {
      if (this.activeDeckName === deckName && !this.isAutoMixing) {
        this.notifySubscribers({
          currentTime: audio.currentTime || 0,
          duration: audio.duration || 0,
          isPlaying: false,
          isLoading: true,
          error: null,
        });
      }
    });

    audio.addEventListener('canplay', () => {
      if (this.activeDeckName === deckName) {
        this.notifySubscribers({
          currentTime: audio.currentTime || 0,
          duration: audio.duration || 0,
          isPlaying: !audio.paused,
          isLoading: false,
          error: null,
        });
      }
    });

    audio.addEventListener('ended', () => {
      if (this.activeDeckName === deckName) {
        if (!this.isAutoMixing && this.onTrackEndCallback) {
          this.onTrackEndCallback();
        }
      }
    });

    audio.addEventListener('error', () => {
      if (this.activeDeckName === deckName) {
        const err = audio.error;
        let msg = 'Playback error';
        if (err) {
          if (err.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) msg = 'Audio format not supported or URL unavailable';
          else if (err.code === MediaError.MEDIA_ERR_NETWORK) msg = 'Network error loading audio';
        }
        this.notifySubscribers({
          currentTime: 0,
          duration: 0,
          isPlaying: false,
          isLoading: false,
          error: msg,
        });
      }
    });
  }

  private emitState() {
    const audio = this.activeDeck;
    if (!audio) return;
    this.notifySubscribers({
      currentTime: audio.currentTime,
      duration: isNaN(audio.duration) ? 0 : audio.duration,
      isPlaying: !audio.paused,
      isLoading: false,
      error: null,
    });
  }

  private notifySubscribers(state: {
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    isLoading: boolean;
    error: string | null;
  }) {
    this.subscribers.forEach((cb) => cb(state));
  }

  public subscribe(cb: AudioCallback): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  public setTrackEndCallback(cb: () => void) {
    this.onTrackEndCallback = cb;
  }

  public setMediaSessionCallbacks(onNext: () => void, onPrev: () => void) {
    this.onNextCallback = onNext;
    this.onPrevCallback = onPrev;
    this.updateMediaSession();
  }

  public setNextTrackProvider(provider: (() => NextTrackPayload | null) | null) {
    this.nextTrackProvider = provider;
  }

  public setAutoMixHandoffCallback(cb: ((song: Song, nextIndex?: number) => void) | null) {
    this.onAutoMixHandoffCallback = cb;
  }

  // MARK: - AutoMix Settings Accessors
  public getAutoMixEnabled(): boolean {
    return this.isAutoMixEnabledState;
  }

  public setAutoMixEnabled(enabled: boolean) {
    this.isAutoMixEnabledState = enabled;
    try {
      localStorage.setItem('tone_automix_enabled', String(enabled));
    } catch {}
    if (!enabled && this.isAutoMixing) {
      this.cancelAutoMix();
    }
  }

  public getAutoMixDuration(): number {
    return this.autoMixDurationState;
  }

  public setAutoMixDuration(seconds: number) {
    const clamped = Math.max(2.0, Math.min(12.0, seconds));
    this.autoMixDurationState = clamped;
    try {
      localStorage.setItem('tone_automix_duration', String(clamped));
    } catch {}
  }

  public getEnableBassSwap(): boolean {
    return this.enableBassSwapState;
  }

  public setEnableBassSwap(enabled: boolean) {
    this.enableBassSwapState = enabled;
    try {
      localStorage.setItem('tone_automix_bass_swap', String(enabled));
    } catch {}
  }

  public getPreserveAlbumGapless(): boolean {
    return this.preserveAlbumGaplessState;
  }

  public setPreserveAlbumGapless(enabled: boolean) {
    this.preserveAlbumGaplessState = enabled;
    try {
      localStorage.setItem('tone_automix_gapless_album', String(enabled));
    } catch {}
  }

  // MARK: - Core Playback
  public async loadAndPlay(song: Song, audioUrl: string): Promise<boolean> {
    this.cancelAutoMix();
    const audio = this.activeDeck;
    if (!audio) return false;

    this.currentSong = song;

    // Immediately notify UI that audio is fetching/buffering
    this.notifySubscribers({
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      isLoading: true,
      error: null,
    });

    try {
      audio.src = audioUrl;
      audio.volume = this.isMuted ? 0 : this.currentVolume;
      audio.load();
      const playSuccess = await this.safePlay();
      this.updateMediaSession();
      return playSuccess;
    } catch (err) {
      console.warn('[AudioEngine] loadAndPlay error:', err);
      this.notifySubscribers({
        currentTime: 0,
        duration: 0,
        isPlaying: false,
        isLoading: false,
        error: 'Failed to load audio',
      });
      return false;
    }
  }

  public async safePlay(): Promise<boolean> {
    const audio = this.activeDeck;
    if (!audio) return false;
    try {
      await audio.play();
      this.updateMediaSessionPlaybackState('playing');
      return true;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        console.warn('[AudioEngine] Autoplay blocked by browser policy. Interaction required.');
      } else {
        console.warn('[AudioEngine] Play failed:', err);
      }
      this.updateMediaSessionPlaybackState('paused');
      return false;
    }
  }

  public pause() {
    this.cancelAutoMix();
    const audio = this.activeDeck;
    if (!audio) return;
    audio.pause();
    this.updateMediaSessionPlaybackState('paused');
  }

  public togglePlay(): Promise<boolean> {
    const audio = this.activeDeck;
    if (!audio) return Promise.resolve(false);
    if (audio.paused) {
      return this.safePlay();
    } else {
      this.pause();
      return Promise.resolve(false);
    }
  }

  public seek(seconds: number) {
    this.cancelAutoMix();
    const audio = this.activeDeck;
    if (!audio) return;
    this.isSeeking = false;
    const clamped = Math.max(0, Math.min(seconds, audio.duration || seconds));
    audio.currentTime = clamped;
    this.emitState();
  }

  public setIsSeeking(seeking: boolean) {
    this.isSeeking = seeking;
    if (seeking && this.isAutoMixing) {
      this.cancelAutoMix();
    }
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.currentVolume = clamped;
    if (!this.isAutoMixing) {
      const audio = this.activeDeck;
      if (audio) {
        audio.volume = this.isMuted ? 0 : clamped;
      }
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!this.isAutoMixing) {
      const audio = this.activeDeck;
      if (audio) {
        audio.volume = muted ? 0 : this.currentVolume;
      }
    }
  }

  public getCurrentTime(): number {
    return this.activeDeck?.currentTime || 0;
  }

  public getDuration(): number {
    return this.activeDeck?.duration || 0;
  }

  public getIsPlaying(): boolean {
    return !this.activeDeck?.paused;
  }

  public getIsAutoMixing(): boolean {
    return this.isAutoMixing;
  }

  // MARK: - AutoMix Transition Engine
  private checkForAutoMixTrigger() {
    const active = this.activeDeck;
    if (
      !this.isAutoMixEnabledState ||
      this.isAutoMixing ||
      this.isSeeking ||
      !active ||
      active.paused ||
      !active.duration ||
      active.duration <= 12.0 ||
      !this.currentSong
    ) {
      return;
    }

    const remainingTime = active.duration - active.currentTime;
    const mixDuration = this.autoMixDurationState;

    if (remainingTime <= mixDuration && remainingTime > 0.25) {
      if (!this.nextTrackProvider) return;
      const nextInfo = this.nextTrackProvider();
      if (!nextInfo) return;

      const nextSong = nextInfo.song;

      // Preserve gapless album transitions if configured
      if (
        this.preserveAlbumGaplessState &&
        this.currentSong.albumTitle &&
        nextSong.albumTitle &&
        this.currentSong.albumTitle.toLowerCase() === nextSong.albumTitle.toLowerCase()
      ) {
        return;
      }

      this.startAutoMix(nextSong, nextInfo.audioUrl, nextInfo.nextIndex, Math.min(mixDuration, remainingTime));
    }
  }

  private startAutoMix(
    nextSong: Song,
    nextAudioUrl: string,
    nextIndex: number | undefined,
    mixDuration: number
  ) {
    const active = this.activeDeck;
    const standby = this.standbyDeck;
    if (!active || !standby) return;

    this.isAutoMixing = true;
    this.autoMixHandedOff = false;
    this.autoMixStartDate = Date.now();

    standby.pause();
    standby.src = nextAudioUrl;
    standby.volume = 0;
    standby.load();

    standby
      .play()
      .then(() => {
        if (!this.isAutoMixing) {
          standby.pause();
          return;
        }

        if (this.autoMixTimer) {
          clearInterval(this.autoMixTimer);
        }

        // 60 FPS acoustic ramp loop
        this.autoMixTimer = setInterval(() => {
          if (!this.isAutoMixing) {
            if (this.autoMixTimer) clearInterval(this.autoMixTimer);
            return;
          }

          const elapsed = (Date.now() - this.autoMixStartDate) / 1000;
          const progress = Math.min(Math.max(elapsed / mixDuration, 0), 1);

          // Equal-Power Trigonometric Curves: cos(p * π/2) & sin(p * π/2)
          const angle = progress * (Math.PI / 2);
          let gainA = Math.cos(angle);
          let gainB = Math.sin(angle);

          // Dynamic Bass Management (Avoid low-end frequency mud)
          if (this.enableBassSwapState) {
            if (progress < 0.5) {
              gainB = gainB * (progress / 0.5) * 0.85;
            } else {
              const postHalf = (progress - 0.5) / 0.5;
              gainA = gainA * (1.0 - postHalf * 0.4);
            }
          }

          const masterVol = this.isMuted ? 0 : this.currentVolume;
          active.volume = Math.max(0, Math.min(1, gainA * masterVol));
          standby.volume = Math.max(0, Math.min(1, gainB * masterVol));

          // Midpoint Handoff (progress >= 0.5): Transfer metadata & UI display
          if (progress >= 0.5 && !this.autoMixHandedOff) {
            this.autoMixHandedOff = true;
            this.currentSong = nextSong;
            this.updateMediaSession();
            this.onAutoMixHandoffCallback?.(nextSong, nextIndex);
          }

          // Completion (progress >= 1.0)
          if (progress >= 1.0) {
            if (this.autoMixTimer) {
              clearInterval(this.autoMixTimer);
              this.autoMixTimer = null;
            }
            this.completeAutoMix(nextSong);
          }
        }, 16);
      })
      .catch((err) => {
        console.warn('[AudioEngine] AutoMix standby play failed:', err);
        this.cancelAutoMix();
      });
  }

  private completeAutoMix(nextSong: Song) {
    if (this.autoMixTimer) {
      clearInterval(this.autoMixTimer);
      this.autoMixTimer = null;
    }

    const oldActive = this.activeDeck;
    const newActive = this.standbyDeck;

    if (oldActive) {
      oldActive.pause();
      oldActive.currentTime = 0;
      oldActive.volume = this.isMuted ? 0 : this.currentVolume;
    }

    if (newActive) {
      newActive.volume = this.isMuted ? 0 : this.currentVolume;
    }

    // Switch active deck pointer
    this.activeDeckName = this.activeDeckName === 'deckA' ? 'deckB' : 'deckA';
    this.currentSong = nextSong;
    this.isAutoMixing = false;
    this.autoMixHandedOff = false;

    this.updateMediaSession();
    this.emitState();
  }

  private cancelAutoMix() {
    if (!this.isAutoMixing) return;

    if (this.autoMixTimer) {
      clearInterval(this.autoMixTimer);
      this.autoMixTimer = null;
    }

    const standby = this.standbyDeck;
    if (standby) {
      standby.pause();
      standby.currentTime = 0;
      standby.volume = 0;
    }

    const active = this.activeDeck;
    if (active) {
      active.volume = this.isMuted ? 0 : this.currentVolume;
    }

    this.isAutoMixing = false;
    this.autoMixHandedOff = false;
  }

  // MARK: - MediaSession
  private updateMediaSession() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !this.currentSong) {
      return;
    }

    const song = this.currentSong;
    const coverUrl = getCoverImageUrl(song.coverFileId, song.audioFileId || song.fileId);

    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.artistName,
      album: song.albumTitle || 'Tone Library',
      artwork: [
        { src: coverUrl, sizes: '96x96', type: 'image/jpeg' },
        { src: coverUrl, sizes: '128x128', type: 'image/jpeg' },
        { src: coverUrl, sizes: '192x192', type: 'image/jpeg' },
        { src: coverUrl, sizes: '256x256', type: 'image/jpeg' },
        { src: coverUrl, sizes: '512x512', type: 'image/jpeg' },
      ],
    });

    navigator.mediaSession.setActionHandler('play', () => this.safePlay());
    navigator.mediaSession.setActionHandler('pause', () => this.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      if (this.onPrevCallback) this.onPrevCallback();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      if (this.onNextCallback) this.onNextCallback();
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        this.seek(details.seekTime);
      }
    });
  }

  private updateMediaSessionPlaybackState(state: 'playing' | 'paused') {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  }
}

export const audioEngine = new AudioEngine();
