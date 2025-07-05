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
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [accentEnabled, setAccentEnabled] = useState(true);
  const [metronomeVolume, setMetronomeVolume] = useState(0.2);
  const [metronomeSound, setMetronomeSound] = useState('click'); // 'click', 'beep', 'wood'
  const metronomeInterval = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const beatCountRef = useRef<number>(0);

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

  // Enhanced metronome tick sound with different options
  const playMetronomeTick = useCallback(
    (isAccent = false) => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Different sounds based on selection
      switch (metronomeSound) {
        case 'beep':
          osc.type = 'sine';
          osc.frequency.value = isAccent ? 1200 : 800;
          break;
        case 'wood':
          osc.type = 'triangle';
          osc.frequency.value = isAccent ? 2000 : 1500;
          break;
        default: // 'click'
          osc.type = 'square';
          osc.frequency.value = isAccent ? 1200 : 1000;
          break;
      }

      gain.gain.value = isAccent ? metronomeVolume * 1.5 : metronomeVolume;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (isAccent ? 0.1 : 0.07));
    },
    [metronomeSound, metronomeVolume]
  );

  const getNoteLeft = useCallback((idx: number, total: number) => {
    const relativeIdx = idx - Math.max(0, total - 250); // Updated for smaller buffer
    // Make latest notes appear at 80%, older notes scroll left to 0%
    const percent = (relativeIdx / 250) * 80; // Updated denominator
    return `calc(${percent}% - 4px)`;
  }, []);

  // Store the latest notes with minimal delay optimization
  const addNoteRef = useRef<number>(0);
  const lastFreqRef = useRef<number>(0);

  useEffect(() => {
    if (!freq) return;

    const now = Date.now();
    const timeSinceLastUpdate = now - addNoteRef.current;
    const freqChange = Math.abs(freq - lastFreqRef.current);

    // Immediate update for significant frequency changes (low latency for pitch changes)
    // Or regular throttling at 60fps for stable frequencies
    const shouldUpdate = freqChange > 10 || timeSinceLastUpdate >= 16;

    if (!shouldUpdate) return;

    addNoteRef.current = now;
    lastFreqRef.current = freq;

    const note = frequencyToNote(freq);
    setLatestNotes((prev) => {
      const newNotes = [...prev, { note, freq, clarity }];
      // Reduce buffer size slightly for lower memory usage and faster processing
      return newNotes.length > 250 ? newNotes.slice(-250) : newNotes;
    });
  }, [freq, clarity, frequencyToNote]);

  // Enhanced metronome effect with time signatures
  useEffect(() => {
    if (metronomeInterval.current) {
      clearInterval(metronomeInterval.current);
      metronomeInterval.current = null;
    }

    if (!metronomeEnabled) return;

    const interval = 60000 / bpm;
    const beatsPerMeasure = parseInt(timeSignature.split('/')[0]);
    beatCountRef.current = 0;

    metronomeInterval.current = setInterval(() => {
      const isAccent =
        accentEnabled && beatCountRef.current % beatsPerMeasure === 0;
      playMetronomeTick(isAccent);

      beatCountRef.current = (beatCountRef.current + 1) % beatsPerMeasure;

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
  }, [bpm, metronomeEnabled, timeSignature, accentEnabled, playMetronomeTick]);

  // Current note display (immediate, no throttling for real-time feedback)
  const currentNote = useMemo(
    () => frequencyToNote(freq),
    [freq, frequencyToNote]
  );
  const currentAccuracy = useMemo(
    () => noteAccuracy(freq),
    [freq, noteAccuracy]
  );
  const currentColor = useMemo(
    () => accuracyColor(freq),
    [freq, accuracyColor]
  );

  return (
    <div className="p-4 w-full h-full text-[#eae1d6] flex flex-col overflow-hidden">
      {/* Main Tuner Display */}
      <div className="w-full flex flex-col justify-center items-center flex-shrink-0">
        {/* Frequency Display */}
        <div className="backdrop-blur-md bg-white/10 rounded-2xl px-6 py-3 border border-white/20 shadow-lg">
          <p className="text-xl font-light text-center text-white/90">
            {freq ? `${freq.toFixed(2)} Hz` : '--'}
          </p>
        </div>

        {/* Note Display */}
        <div className="relative mt-4">
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl">
            <p className="text-7xl font-mono text-center text-white drop-shadow-lg">
              {currentNote}
            </p>
          </div>
        </div>

        {/* Accuracy Indicator */}
        <div className="flex gap-4 justify-center items-center mt-4">
          <div className="relative">
            <div
              className={`w-6 h-6 rounded-full ${currentColor} shadow-lg ring-2 ring-white/30`}
            >
              <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
            </div>
          </div>
          <div className="backdrop-blur-md bg-white/10 rounded-xl px-4 py-2 border border-white/20">
            <p className="text-lg font-medium text-white/90">
              {currentAccuracy} cents
            </p>
          </div>
        </div>

        {/* Enhanced Metronome Controls */}
        <div className="backdrop-blur-md bg-white/5 rounded-2xl p-4 border border-white/10 shadow-lg mt-4 w-full max-w-2xl">
          <div className="flex flex-col items-center gap-4">
            {/* Main controls row */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={20}
                  max={300}
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-20 h-10 text-white bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20 focus:border-white/40 focus:outline-none transition-all duration-200"
                  title="Metronome BPM"
                />
                <span className="text-sm font-medium text-white/80">BPM</span>
              </div>

              <button
                onClick={() => setMetronomeEnabled(!metronomeEnabled)}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 ${
                  metronomeEnabled
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/10 backdrop-blur-md border border-white/20 text-white/90 hover:bg-white/15'
                }`}
              >
                {metronomeEnabled ? 'Stop' : 'Start'}
              </button>
            </div>

            {/* Advanced controls row */}
            <div className="flex items-center gap-4 text-sm flex-wrap justify-center">
              {/* Time Signature */}
              <div className="flex items-center gap-2">
                <label className="text-white/80 font-medium">Time:</label>
                <select
                  value={timeSignature}
                  onChange={(e) => setTimeSignature(e.target.value)}
                  className="bg-white/10 backdrop-blur-md text-white rounded-lg px-3 py-2 border border-white/20 focus:border-white/40 focus:outline-none transition-all duration-200"
                >
                  <option value="2/4" className="bg-gray-800">
                    2/4
                  </option>
                  <option value="3/4" className="bg-gray-800">
                    3/4
                  </option>
                  <option value="4/4" className="bg-gray-800">
                    4/4
                  </option>
                  <option value="6/8" className="bg-gray-800">
                    6/8
                  </option>
                  <option value="7/8" className="bg-gray-800">
                    7/8
                  </option>
                  <option value="9/8" className="bg-gray-800">
                    9/8
                  </option>
                  <option value="12/8" className="bg-gray-800">
                    12/8
                  </option>
                </select>
              </div>

              {/* Accent */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accentEnabled}
                  onChange={(e) => setAccentEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-white/80 font-medium">Accent</span>
              </label>

              {/* Sound Type */}
              <div className="flex items-center gap-2">
                <label className="text-white/80 font-medium">Sound:</label>
                <select
                  value={metronomeSound}
                  onChange={(e) => setMetronomeSound(e.target.value)}
                  className="bg-white/10 backdrop-blur-md text-white rounded-lg px-3 py-2 border border-white/20 focus:border-white/40 focus:outline-none transition-all duration-200"
                >
                  <option value="click" className="bg-gray-800">
                    Click
                  </option>
                  <option value="beep" className="bg-gray-800">
                    Beep
                  </option>
                  <option value="wood" className="bg-gray-800">
                    Wood
                  </option>
                </select>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <label className="text-white/80 font-medium">Vol:</label>
                <input
                  type="range"
                  min="0.1"
                  max="0.5"
                  step="0.1"
                  value={metronomeVolume}
                  onChange={(e) => setMetronomeVolume(Number(e.target.value))}
                  className="w-16 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                  title={`Volume: ${Math.round(metronomeVolume * 100)}%`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Musical Staff */}
      <div className="flex-1 w-full backdrop-blur-md bg-white/5 rounded-2xl p-4 border border-white/10 shadow-lg mt-4 min-h-0 overflow-hidden">
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
