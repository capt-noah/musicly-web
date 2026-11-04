'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  Radio,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Search,
  Check,
} from 'lucide-react';
import { api } from '@/lib/api';

interface LogEntry {
  id: string;
  timestamp: string;
  component: 'Mic' | 'Audio' | 'Network' | 'Shazam' | 'Error';
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

interface MatchResult {
  id: string;
  title: string;
  artist: string;
  albumTitle?: string;
  artworkURL?: string;
  previewAudioURL?: string;
  appleMusicURL?: string;
  duration?: number;
  shazamKey?: string;
  isAlreadyInLibrary?: boolean;
}

/**
 * Encodes Float32Array PCM samples into a standard 16-bit Mono PCM WAV Blob.
 * Universally accepted by audio decoders, shazamio-core, and Shazam.
 */
function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  /* RIFF chunk descriptor */
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');

  /* 'fmt ' sub-chunk */
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // audioFormat (1 = PCM)
  view.setUint16(22, 1, true); // numChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // sampleRate
  view.setUint32(28, sampleRate * 2, true); // byteRate (sampleRate * 1 * 16/8)
  view.setUint16(32, 2, true); // blockAlign (1 * 16/8)
  view.setUint16(34, 16, true); // bitsPerSample (16 bits)

  /* 'data' sub-chunk */
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  /* Write 16-bit PCM samples with linear clamping */
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

interface ToneMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrack?: (title: string, artist: string) => void;
}

export function ToneMatchModal({ isOpen, onClose, onSelectTrack }: ToneMatchModalProps) {
  const [phase, setPhase] = useState<'idle' | 'recording' | 'analyzing' | 'matched' | 'failed'>('idle');
  const [matchedTrack, setMatchedTrack] = useState<MatchResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveBars, setLiveBars] = useState<number[]>(Array(24).fill(0.1));
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showDebugLogs, setShowDebugLogs] = useState(true);
  const [copiedLogs, setCopiedLogs] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const muteGainRef = useRef<GainNode | null>(null);
  const pcmChunksRef = useRef<Float32Array[]>([]);
  const isRecordingRef = useRef<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const addLog = useCallback((component: LogEntry['component'], type: LogEntry['type'], message: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: timeStr,
      component,
      type,
      message,
    };
    setLogs((prev) => [...prev, entry]);

    const prefix = `[ToneMatch:${component}]`;
    if (type === 'error') console.error(prefix, message);
    else if (type === 'warn') console.warn(prefix, message);
    else console.log(prefix, message);
  }, []);

  // Cleanup on close or unmount
  const stopAllAudio = useCallback(() => {
    isRecordingRef.current = false;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (e) {}
      processorRef.current = null;
    }

    if (muteGainRef.current) {
      try {
        muteGainRef.current.disconnect();
      } catch (e) {}
      muteGainRef.current = null;
    }

    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch (e) {}
      analyserRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }

    setIsPlayingPreview(false);
    setLiveBars(Array(24).fill(0.1));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopAllAudio();
      setPhase('idle');
      setMatchedTrack(null);
      setErrorMessage(null);
    }
  }, [isOpen, stopAllAudio]);

  // Waveform visualization loop
  const startVisualizer = useCallback(() => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateBars = () => {
      analyser.getByteFrequencyData(dataArray);
      const bars: number[] = [];
      const step = Math.max(1, Math.floor(dataArray.length / 24));

      for (let i = 0; i < 24; i++) {
        const val = dataArray[i * step] || 0;
        // Normalize 0.08 to 1.0 without excessive gain
        const fraction = Math.min(Math.max(val / 255, 0.08), 1.0);
        bars.push(fraction);
      }
      setLiveBars(bars);
      animFrameRef.current = requestAnimationFrame(updateBars);
    };

    updateBars();
  }, []);

  // Main Recognition Flow
  const startListening = async () => {
    stopAllAudio();
    setPhase('recording');
    setMatchedTrack(null);
    setErrorMessage(null);
    setRecordingSeconds(0);
    pcmChunksRef.current = [];

    addLog('Mic', 'info', 'Requesting microphone access with raw acoustic constraints (autoGainControl: false)...');

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false, // Prevents loud audio boost / distortion
        },
      });
      mediaStreamRef.current = stream;
      const audioTrack = stream.getAudioTracks()[0];
      const settings = audioTrack.getSettings ? audioTrack.getSettings() : {};
      addLog('Mic', 'success', `Microphone active: ${audioTrack.label || 'Default Mic'} (sampleRate: ${settings.sampleRate || 48000}Hz, channels: ${settings.channelCount || 1})`);
    } catch (micErr: any) {
      addLog('Error', 'error', `Microphone permission denied or hardware unavailable: ${micErr?.message || micErr}`);
      setErrorMessage('Microphone access denied. Please allow microphone permissions in your browser to identify music.');
      setPhase('failed');
      return;
    }

    // Set up Web Audio Analyser & PCM Processor
    let audioCtx: AudioContext;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      addLog('Audio', 'info', `Web Audio Context active (sampleRate: ${audioCtx.sampleRate}Hz)`);
    } catch (ctxErr: any) {
      addLog('Error', 'error', `Could not initialize Web Audio Context: ${ctxErr?.message}`);
      setErrorMessage('Audio context initialization failed.');
      setPhase('failed');
      return;
    }

    const source = audioCtx.createMediaStreamSource(stream);

    // 1. Analyser for live frequency visualization
    try {
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;
      startVisualizer();
    } catch (e) {}

    // 2. ScriptProcessor for lossless 16-bit PCM capture
    try {
      const bufferSize = 4096;
      const processor = audioCtx.createScriptProcessor(bufferSize, 1, 1);
      processorRef.current = processor;

      isRecordingRef.current = true;
      let lastChunkLogTime = Date.now();

      processor.onaudioprocess = (e) => {
        if (!isRecordingRef.current) return;
        const channelData = e.inputBuffer.getChannelData(0);
        pcmChunksRef.current.push(new Float32Array(channelData));

        const now = Date.now();
        if (now - lastChunkLogTime >= 1000) {
          lastChunkLogTime = now;
          const totalSamples = pcmChunksRef.current.reduce((acc, c) => acc + c.length, 0);
          addLog('Audio', 'info', `Captured ${(totalSamples / audioCtx.sampleRate).toFixed(1)}s PCM audio (${(totalSamples * 2 / 1024).toFixed(1)} KB)`);
        }
      };

      source.connect(processor);

      // Route processor to silent gain to keep Web Audio graph pumping
      const muteGain = audioCtx.createGain();
      muteGain.gain.value = 0;
      muteGainRef.current = muteGain;
      processor.connect(muteGain);
      muteGain.connect(audioCtx.destination);

      addLog('Audio', 'info', `Lossless PCM capture active (sampleRate: ${audioCtx.sampleRate}Hz, buffer: ${bufferSize})`);
      addLog('Mic', 'info', 'Recording started. Listening to ambient audio for 4.0 seconds...');
    } catch (recErr: any) {
      addLog('Error', 'error', `PCM audio capture setup failed: ${recErr?.message}`);
      setErrorMessage('Audio recording setup failed.');
      setPhase('failed');
      return;
    }

    // 4.0-second countdown timer
    let elapsed = 0;
    timerIntervalRef.current = setInterval(async () => {
      elapsed += 0.5;
      setRecordingSeconds(Math.min(elapsed, 4.0));
      if (elapsed >= 4.0) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (isRecordingRef.current) {
          isRecordingRef.current = false;
          addLog('Mic', 'info', '4.0s elapsed. Stopping capture & encoding lossless WAV...');
          setPhase('analyzing');

          // Disconnect processor
          if (processorRef.current) {
            try {
              processorRef.current.disconnect();
            } catch (e) {}
          }
          if (muteGainRef.current) {
            try {
              muteGainRef.current.disconnect();
            } catch (e) {}
          }

          // Concatenate all float32 samples
          const chunks = pcmChunksRef.current;
          const totalSamples = chunks.reduce((acc, c) => acc + c.length, 0);
          if (totalSamples === 0) {
            addLog('Error', 'error', 'No audio samples captured from microphone');
            setErrorMessage('No audio captured. Please check your microphone input.');
            setPhase('failed');
            return;
          }

          const mergedSamples = new Float32Array(totalSamples);
          let offset = 0;
          for (const chunk of chunks) {
            mergedSamples.set(chunk, offset);
            offset += chunk.length;
          }

          // Encode to standard 16-bit PCM WAV
          const wavBlob = encodeWAV(mergedSamples, audioCtx.sampleRate);
          addLog('Audio', 'success', `Lossless WAV encoded: ${(wavBlob.size / 1024).toFixed(1)} KB (sampleRate: ${audioCtx.sampleRate}Hz, 16-bit PCM mono)`);

          await submitAudioForRecognition(wavBlob);
        }
      }
    }, 500);
  };

  const submitAudioForRecognition = async (blob: Blob) => {
    setPhase('analyzing');
    addLog('Network', 'info', `POSTing audio sample (${(blob.size / 1024).toFixed(1)} KB) to /api/match...`);

    const reqStartTime = Date.now();
    try {
      const res = await api.matchAudio(blob);
      const latency = Date.now() - reqStartTime;

      if (res.success && res.match) {
        const match = res.match as MatchResult;
        addLog('Shazam', 'success', `Track matched in ${latency}ms: "${match.artist} - ${match.title}" (Album: ${match.albumTitle || 'Single'})`);
        setMatchedTrack(match);
        setPhase('matched');

        // Prepare preview audio if available
        if (match.previewAudioURL) {
          addLog('Audio', 'info', `30s Preview audio available: ${match.previewAudioURL}`);
          const previewAudio = new Audio(match.previewAudioURL);
          previewAudioRef.current = previewAudio;
          previewAudio.onended = () => setIsPlayingPreview(false);
          previewAudio.onerror = (e) => addLog('Audio', 'warn', `Preview playback error: ${e}`);
        }
      } else {
        addLog('Shazam', 'warn', `No match found (${latency}ms): ${res.error || res.message || 'No acoustic match'}`);
        setErrorMessage('No match found. Play the audio louder or move closer to the sound source.');
        setPhase('failed');
      }
    } catch (apiErr: any) {
      addLog('Error', 'error', `Recognition API failed: ${apiErr?.message || apiErr}`);
      setErrorMessage(`Recognition failed: ${apiErr?.message || 'Server error'}`);
      setPhase('failed');
    }
  };

  const togglePreviewPlay = () => {
    if (!previewAudioRef.current) return;
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play().then(() => {
        setIsPlayingPreview(true);
      }).catch((e) => {
        addLog('Audio', 'warn', `Could not play preview audio: ${e?.message}`);
      });
    }
  };

  const copyDebugLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.component}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#111412] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#3b4b3e] flex items-center justify-center text-[#b9cbba] shadow-sm">
              <Radio className={`w-4 h-4 ${phase === 'recording' ? 'animate-pulse text-green-400' : ''}`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#fff8f2] flex items-center gap-1.5">
                Tone Match
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#b9cbba]">
                  SHAZAM ENGINE
                </span>
              </h3>
              <p className="text-[11px] text-[#a6ada6]">Identify any music playing around you</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopAllAudio();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#a6ada6] hover:text-[#fff8f2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Phase: IDLE */}
          {phase === 'idle' && (
            <div className="py-8 text-center space-y-6">
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#b9cbba]/10 animate-ping opacity-40" />
                <button
                  onClick={startListening}
                  className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#3b4b3e] to-[#b9cbba] hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow-[0_0_30px_rgba(185,203,186,0.3)] cursor-pointer group"
                >
                  <Radio className="w-10 h-10 text-[#0d0f0d] group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-lg font-bold text-[#fff8f2]">Tap to Listen</h4>
                <p className="text-xs text-[#a6ada6] max-w-xs mx-auto">
                  Play any song on your phone, speaker, or browser. Tone will capture and identify it in seconds.
                </p>
              </div>
            </div>
          )}

          {/* Phase: RECORDING */}
          {phase === 'recording' && (
            <div className="py-6 text-center space-y-6">
              {/* Waveform Bars */}
              <div className="flex items-center justify-center gap-1 h-20 px-4">
                {liveBars.map((height, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-[#b9cbba] transition-all duration-75"
                    style={{
                      height: `${Math.max(8, height * 72)}px`,
                      opacity: 0.3 + height * 0.7,
                    }}
                  />
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-bold text-[#fff8f2]">Listening to ambient sound...</h4>
                <div className="w-48 h-1.5 rounded-full bg-white/10 mx-auto overflow-hidden">
                  <div
                    className="h-full bg-[#b9cbba] transition-all duration-300"
                    style={{ width: `${(recordingSeconds / 4.0) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] font-mono text-[#a6ada6]">
                  {recordingSeconds.toFixed(1)}s / 4.0s (Raw Acoustic Mode)
                </p>
              </div>
            </div>
          )}

          {/* Phase: ANALYZING */}
          {phase === 'analyzing' && (
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#3b4b3e]/30 border border-[#b9cbba]/30 flex items-center justify-center text-[#b9cbba] animate-spin">
                <Radio className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-[#fff8f2]">Analyzing Acoustic Signature...</h4>
                <p className="text-xs text-[#a6ada6]">Matching spectrogram against the Shazam music catalog</p>
              </div>
            </div>
          )}

          {/* Phase: MATCHED */}
          {phase === 'matched' && matchedTrack && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#1c211d] border border-white/10">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 shadow-lg">
                  {matchedTrack.artworkURL ? (
                    <Image
                      src={matchedTrack.artworkURL}
                      alt={matchedTrack.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#a6ada6]">
                      <Radio className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> MATCH IDENTIFIED
                  </span>
                  <h4 className="text-base font-bold text-[#fff8f2] truncate">
                    {matchedTrack.title}
                  </h4>
                  <p className="text-xs text-[#a6ada6] truncate font-medium">
                    {matchedTrack.artist}
                  </p>
                  {matchedTrack.albumTitle && (
                    <p className="text-[11px] text-[#a6ada6]/70 truncate">
                      Album: {matchedTrack.albumTitle}
                    </p>
                  )}
                </div>
              </div>

              {/* 30s Audio Preview Player */}
              {matchedTrack.previewAudioURL && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={togglePreviewPlay}
                      className="w-9 h-9 rounded-full bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] flex items-center justify-center transition-all cursor-pointer shadow-md"
                    >
                      {isPlayingPreview ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                    <div>
                      <p className="text-xs font-bold text-[#fff8f2]">30s Audio Preview</p>
                      <p className="text-[10px] font-mono text-[#a6ada6]">
                        {isPlayingPreview ? 'PLAYING PREVIEW' : 'CLICK TO PREVIEW'}
                      </p>
                    </div>
                  </div>
                  <Volume2 className="w-4 h-4 text-[#b9cbba]" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  onClick={() => {
                    if (onSelectTrack) onSelectTrack(matchedTrack.title, matchedTrack.artist);
                    stopAllAudio();
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search in Tone</span>
                </button>

                <button
                  onClick={startListening}
                  className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-[#1c211d] hover:bg-white/10 border border-white/10 text-xs font-bold text-[#fff8f2] transition-colors cursor-pointer"
                  title="Listen Again"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Listen Again</span>
                </button>
              </div>
            </div>
          )}

          {/* Phase: FAILED */}
          {phase === 'failed' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-[#fff8f2]">Could Not Identify Track</h4>
                <p className="text-xs text-[#a6ada6] max-w-sm mx-auto">
                  {errorMessage || 'No match found. Please make sure the music is clearly audible and try again.'}
                </p>
              </div>

              <button
                onClick={startListening}
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-full bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {/* Expandable Live Debug Console */}
          <div className="pt-2 border-t border-white/[0.08]">
            <div className="flex items-center justify-between pb-2">
              <button
                onClick={() => setShowDebugLogs(!showDebugLogs)}
                className="flex items-center gap-1.5 text-[11px] font-mono text-[#a6ada6] hover:text-[#fff8f2] transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-[#b9cbba]" />
                <span>LIVE DEBUG LOGS ({logs.length})</span>
                <span className="text-[9px] text-[#b9cbba]">{showDebugLogs ? '▼ HIDE' : '▲ SHOW'}</span>
              </button>

              {logs.length > 0 && (
                <button
                  onClick={copyDebugLogs}
                  className="flex items-center gap-1 text-[10px] font-mono text-[#a6ada6] hover:text-[#fff8f2] px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {copiedLogs ? (
                    <>
                      <Check className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>COPY LOGS</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {showDebugLogs && (
              <div className="h-36 overflow-y-auto rounded-xl bg-black/60 border border-white/[0.06] p-2.5 font-mono text-[10px] space-y-1 select-text">
                {logs.length === 0 ? (
                  <p className="text-[#a6ada6]/60 italic">No logs yet. Click Listen to see real-time pipeline execution.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-1.5 leading-tight">
                      <span className="text-white/40 flex-shrink-0">[{log.timestamp}]</span>
                      <span
                        className={`flex-shrink-0 font-bold px-1 rounded text-[9px] ${
                          log.component === 'Mic'
                            ? 'bg-blue-500/20 text-blue-300'
                            : log.component === 'Audio'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : log.component === 'Network'
                            ? 'bg-purple-500/20 text-purple-300'
                            : log.component === 'Shazam'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {log.component}
                      </span>
                      <span
                        className={`break-all ${
                          log.type === 'error'
                            ? 'text-red-400 font-semibold'
                            : log.type === 'warn'
                            ? 'text-amber-300'
                            : log.type === 'success'
                            ? 'text-green-300'
                            : 'text-white/80'
                        }`}
                      >
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
