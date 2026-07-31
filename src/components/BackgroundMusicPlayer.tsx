import React, { useState, useEffect, useRef } from 'react';
import { useRaffle } from '../context/RaffleContext';
import { MusicTrack } from '../types/raffle';

export const BackgroundMusicPlayer: React.FC = () => {
  const { musicTracks, activeTrackId } = useRaffle();

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [volume] = useState<number>(0.3); // Normal background volume 30%
  const [isPausedForSpin, setIsPausedForSpin] = useState<boolean>(false);

  // Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const stepIndexRef = useRef<number>(0);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const selectedTrack = musicTracks.find((t) => t.id === activeTrackId) || musicTracks[0] || {
    id: 'lounge-cs',
    name: 'Variedades CS Lounge 🌸',
    genre: 'Relajante',
    synthBpm: 90,
    synthScale: [261.63, 329.63, 392.00, 493.88, 523.25, 659.25],
  };

  const selectedTrackRef = useRef<MusicTrack>(selectedTrack);
  useEffect(() => {
    selectedTrackRef.current = selectedTrack;
  }, [selectedTrack]);

  // Initialize Audio Element for uploaded tracks
  useEffect(() => {
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio();
      audioElementRef.current.loop = true;
    }
  }, []);

  // Web Audio Context for synth tracks
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      
      const masterGain = audioCtxRef.current.createGain();
      masterGain.gain.value = volume;
      masterGain.connect(audioCtxRef.current.destination);
      gainNodeRef.current = masterGain;
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Play synth loop
  const startSynthLoop = (track: MusicTrack) => {
    stopSynthLoop();
    const ctx = getAudioContext();
    if (!ctx || !gainNodeRef.current) return;

    stepIndexRef.current = 0;
    const bpm = track.synthBpm || 90;
    const scale = track.synthScale || [261.63, 329.63, 392.00, 493.88, 523.25];
    const intervalMs = (60 / bpm) * 500;

    const bassNotes = [130.81, 164.81, 174.61, 196.00];

    timerRef.current = window.setInterval(() => {
      if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;

      const now = ctx.currentTime;
      const step = stepIndexRef.current;

      const noteFreq = scale[step % scale.length];
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteFreq, now);

      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.08, now + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + (intervalMs / 1000) * 1.5);

      osc.connect(noteGain);
      noteGain.connect(gainNodeRef.current!);

      osc.start(now);
      osc.stop(now + (intervalMs / 1000) * 1.5);

      if (step % 4 === 0) {
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        const bassFreq = bassNotes[(step / 4) % bassNotes.length];

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassGain.gain.setValueAtTime(0, now);
        bassGain.gain.linearRampToValueAtTime(0.12, now + 0.08);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, now + (intervalMs / 1000) * 3);

        bassOsc.connect(bassGain);
        bassGain.connect(gainNodeRef.current!);

        bassOsc.start(now);
        bassOsc.stop(now + (intervalMs / 1000) * 3);
      }

      stepIndexRef.current = (step + 1) % 32;
    }, intervalMs);
  };

  const stopSynthLoop = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const playCurrentTrack = (track: MusicTrack) => {
    stopSynthLoop();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }

    if (track.audioUrl) {
      if (audioElementRef.current) {
        audioElementRef.current.src = track.audioUrl;
        audioElementRef.current.volume = volume;
        audioElementRef.current.play().catch(() => {});
      }
    } else {
      getAudioContext();
      startSynthLoop(track);
    }
  };

  const stopCurrentTrack = () => {
    stopSynthLoop();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
  };

  // Play Celebration Fanfare + Voice Announcement for Winner
  const playCelebrationAndVoice = (winnerName: string, ticketNumber?: string) => {
    // 1. Play Celebration Synth Fanfare
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const fanfareCtx = new AudioCtx();
      const now = fanfareCtx.currentTime;

      // Happy fanfare chord progression
      const chords = [
        [523.25, 659.25, 783.99], // C Major
        [587.33, 739.99, 880.00], // D Major
        [659.25, 830.61, 987.77], // E Major
        [1046.50, 1318.51, 1567.98], // High C Major Triumph
      ];

      chords.forEach((notes, idx) => {
        const startTime = now + idx * 0.22;
        notes.forEach((freq) => {
          const osc = fanfareCtx.createOscillator();
          const gain = fanfareCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
          osc.connect(gain);
          gain.connect(fanfareCtx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.65);
        });
      });
    } catch (e) {
      console.error(e);
    }

    // 2. Play Voice Announcement via Web Speech API
    let voiceFinished = false;
    const resumeBg = () => {
      if (!voiceFinished) {
        voiceFinished = true;
        setTimeout(() => {
          playCurrentTrack(selectedTrackRef.current);
        }, 1000);
      }
    };

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const text = ticketNumber
          ? `¡Felicidades a ${winnerName}! ¡Ganador con el boleto número ${ticketNumber} en Variedades CS!`
          : `¡Felicidades a ${winnerName}! ¡Ganador de la ruleta en Variedades CS!`;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1.0;
        utterance.pitch = 1.15;
        utterance.volume = 1.0;

        utterance.onend = resumeBg;
        utterance.onerror = resumeBg;

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        resumeBg();
      }
    } else {
      resumeBg();
    }

    // Fallback safety timeout to resume background music if speech fails or stalls
    setTimeout(() => {
      resumeBg();
    }, 6000);
  };

  // Event Listeners for Spin Events
  useEffect(() => {
    const handleSpinStart = () => {
      setIsPausedForSpin(true);
      stopCurrentTrack();
    };

    const handleSpinEnd = (e: Event) => {
      const customEvent = e as CustomEvent<{ winnerName?: string; winnerNumber?: string }>;
      const winnerName = customEvent.detail?.winnerName || 'el participante';
      const winnerNumber = customEvent.detail?.winnerNumber;

      setIsPausedForSpin(false);
      playCelebrationAndVoice(winnerName, winnerNumber);
    };

    window.addEventListener('bg-music:spin-start', handleSpinStart);
    window.addEventListener('bg-music:spin-end', handleSpinEnd);

    return () => {
      window.removeEventListener('bg-music:spin-start', handleSpinStart);
      window.removeEventListener('bg-music:spin-end', handleSpinEnd);
    };
  }, []);

  // Autoplay background music automatically on mount & first user interaction
  useEffect(() => {
    if (!isPausedForSpin) {
      playCurrentTrack(selectedTrack);
    }

    const handleFirstUserInteraction = () => {
      if (!isPausedForSpin) {
        playCurrentTrack(selectedTrackRef.current);
      }
    };

    window.addEventListener('click', handleFirstUserInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstUserInteraction, { once: true });
    window.addEventListener('keydown', handleFirstUserInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };
  }, [activeTrackId]);

  useEffect(() => {
    return () => {
      stopCurrentTrack();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // No visible floating UI button ("quita el boton y musisca en vivo")
  return null;
};
