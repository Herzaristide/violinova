'use client';

import React from 'react';
import { usePitchDetection } from '../../utils/usePitchDetection';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import MusicalStaff from './tuner/MusicalStaff';

const Tuner = React.memo(() => {
  const { freq, clarity } = usePitchDetection();
  const [latestNotes, setLatestNotes] = useState<
    Array<{
      note: string;
      freq: number;
      clarity: number;
      isTick?: boolean;
    }>
  >([]);

  // Metronome state
  const [bpm, setBpm] = useState(60);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const metronomeInterval = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Memoized helper functions to prevent recreating on every render
  const frequencyToNote = useMemo(
    () => (freq: number | null) => {
      if (!freq) return '--';
      const A4 = 442;
      const semitones = 12 * Math.log2(freq / A4);
      const noteIndex = Math.round(semitones) + 57;
      const notes = [
        'C',
        'C♯',
        'D',
        'D♯',
        'E',
        'F',
        'F♯',
        'G',
        'G♯',
        'A',
        'A♯',
        'B'
      ];
      const note = notes[noteIndex % 12];
      const octave = Math.floor(noteIndex / 12);
      return `${note}${octave}`;
    },
    []
  );

  const noteAccuracy = useMemo(
    () => (freq: number | null) => {
      if (!freq) return '--';
      const A4 = 442;
      const semitones = 12 * Math.log2(freq / A4);
      const nearest = Math.round(semitones);
      const nearestFreq = A4 * Math.pow(2, nearest / 12);
      const cents = 1200 * Math.log2(freq / nearestFreq);
      return `${cents > 0 ? '+' : ''}${cents.toFixed(1)}`;
    },
    []
  );

  // Memoized color function to prevent recalculation
  const accuracyColor = useMemo(
    () => (freq: number | null) => {
      if (!freq) return 'bg-gray-400';
      const A4 = 442;
      const semitones = 12 * Math.log2(freq / A4);
      const nearest = Math.round(semitones);
      const nearestFreq = A4 * Math.pow(2, nearest / 12);
      const cents = 1200 * Math.log2(freq / nearestFreq);
      const absCents = Math.abs(cents);

      if (absCents < 5) return 'bg-green-500';
      if (absCents < 15) return 'bg-yellow-400';
      if (absCents < 30) return 'bg-orange-400';
      return 'bg-red-500';
    },
    []
  );

  // Memoized functions
  const playMetronomeTick = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 1200;
    gain.gain.value = 0.2;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  }, []);

  const getNoteLeft = useCallback((idx: number, total: number) => {
    const relativeIdx = idx - Math.max(0, total - 300);
    const percent = (relativeIdx / 300) * 100;
    return `calc(${percent}% - 4px)`;
  }, []);

  // Store the latest notes with throttling to prevent excessive updates
  const addNoteRef = useRef<number>(0);
  useEffect(() => {
    if (!freq) return;

    // Throttle note additions to max 30fps
    const now = Date.now();
    if (now - addNoteRef.current < 33) return;
    addNoteRef.current = now;

    const note = frequencyToNote(freq);
    setLatestNotes((prev) => {
      const newNotes = [...prev, { note, freq, clarity }];
      return newNotes.length > 300 ? newNotes.slice(-300) : newNotes;
    });
  }, [freq, clarity, frequencyToNote]);

  // Optimized metronome effect
  useEffect(() => {
    if (metronomeInterval.current) {
      clearInterval(metronomeInterval.current);
      metronomeInterval.current = null;
    }

    if (!metronomeEnabled) return;

    const interval = 60000 / bpm;
    metronomeInterval.current = setInterval(() => {
      playMetronomeTick();
      setLatestNotes((prev) => {
        if (prev.length === 0) return prev;
        const newNotes = [...prev];
        const lastIndex = newNotes.length - 1;
        if (lastIndex >= 0) {
          newNotes[lastIndex] = { ...newNotes[lastIndex], isTick: true };
        }
        return newNotes;
      });
    }, interval);

    return () => {
      if (metronomeInterval.current) {
        clearInterval(metronomeInterval.current);
        metronomeInterval.current = null;
      }
    };
  }, [bpm, metronomeEnabled, playMetronomeTick]);

  return (
    <div className="p-4 w-full h-full text-[#eae1d6]">
      <div className="w-full h-1/3 flex flex-col justify-center items-center">
        <p className="text-xl">{freq ? `${freq.toFixed(2)} Hz` : '--'}</p>
        <p className="text-8xl font-mono mt-2">{frequencyToNote(freq)}</p>
        <div className="flex gap-2 justify-center items-center">
          <div className={`w-4 h-4 rounded-full ${accuracyColor(freq)}`} />
          <p className="text-lg mt-2">{noteAccuracy(freq)}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mt-4">
          <input
            type="number"
            min={20}
            max={300}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-16 text-black rounded px-1 py-0.5"
            title="Metronome BPM"
          />
          <button
            onClick={() => setMetronomeEnabled(!metronomeEnabled)}
            className={`px-3 py-1 rounded text-xs font-bold border ${
              metronomeEnabled
                ? 'bg-blue-500 border-blue-700 text-white'
                : 'bg-gray-300 border-gray-400 text-gray-700'
            }`}
          >
            {metronomeEnabled ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>

      <div className="w-full h-2/3 rounded p-2">
        <MusicalStaff
          notes={latestNotes}
          accuracyColor={accuracyColor}
          getNoteLeft={getNoteLeft}
        />
      </div>
    </div>
  );
});

Tuner.displayName = 'Tuner';

export default Tuner;
