'use client';

import { usePitchDetection } from '../../utils/usePitchDetection';
import { useEffect, useState, useRef } from 'react';

function frequencyToNote(freq: any) {
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
}

function noteAccuracy(freq: number | null) {
  if (!freq) return '--';
  const A4 = 442;
  const semitones = 12 * Math.log2(freq / A4);
  const nearest = Math.round(semitones);
  const nearestFreq = A4 * Math.pow(2, nearest / 12);
  const cents = 1200 * Math.log2(freq / nearestFreq);
  return `${cents > 0 ? '+' : ''}${cents.toFixed(1)}`;
}

type NoteType = {
  note: string;
  freq: number;
  clarity: number;
  isTick?: boolean;
};

const notes = [
  'B6',
  'A♯6',
  'A6',
  'G♯6',
  'G6',
  'F♯6',
  'F6',
  'E6',
  'D♯6',
  'D6',
  'C♯6',
  'C6',
  'B5',
  'A♯5',
  'A5',
  'G♯5',
  'G5',
  'F♯5',
  'F5',
  'E5',
  'D♯5',
  'D5',
  'C♯5',
  'C5',
  'B4',
  'A♯4',
  'A4',
  'G♯4',
  'G4',
  'F♯4',
  'F4',
  'E4',
  'D♯4',
  'D4',
  'C♯4',
  'C4',
  'B3',
  'A♯3',
  'A3',
  'G♯3',
  'G3'
];

// Helper: get note index (C=0, C#=1, ..., B=11)
function noteToIndex(note: string) {
  return notes.indexOf(note);
}

// Helper to get color based on accuracy (cents)
function accuracyColor(freq: number | null) {
  if (!freq) return 'bg-gray-400';
  const A4 = 442;
  const semitones = 12 * Math.log2(freq / A4);
  const nearest = Math.round(semitones);
  const nearestFreq = A4 * Math.pow(2, nearest / 12);
  const cents = 1200 * Math.log2(freq / nearestFreq);
  const absCents = Math.abs(cents);

  if (absCents < 5) return 'bg-green-500'; // Very accurate
  if (absCents < 15) return 'bg-yellow-400'; // Close
  if (absCents < 30) return 'bg-orange-400'; // A bit off
  return 'bg-red-500'; // Far off
}

export default function Tuner() {
  const { freq, clarity } = usePitchDetection();
  const [latestNotes, setLatestNotes] = useState<NoteType[]>([]);

  // Metronome state
  const [bpm, setBpm] = useState(60);
  const [ticks, setTicks] = useState<number[]>([]);
  const [metronomeEnabled, setMetronomeEnabled] = useState(true);
  const metronomeInterval = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Metronome tick sound
  function playMetronomeTick() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 1200; // High pitch tick
    gain.gain.value = 0.2;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.07);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  // Store the 300 latest notes with their frequency
  useEffect(() => {
    if (!freq) return;
    const note = frequencyToNote(freq);
    setLatestNotes((prev) => {
      const arr = [...prev, { note, freq, clarity }];
      if (arr.length > 300) arr.shift();
      return arr;
    });
  }, [freq, clarity]);

  // On every metronome tick, mark the latest note as a tick (without removing the note)
  useEffect(() => {
    if (!metronomeEnabled) return;
    if (!ticks.length || !latestNotes.length) return;
    setLatestNotes((prev) => {
      // Mark the last note as a tick (add isTick: true)
      const arr = [...prev];
      arr[arr.length - 1] = { ...arr[arr.length - 1], isTick: true };
      return arr;
    });
    // eslint-disable-next-line
  }, [ticks[ticks.length - 1], metronomeEnabled]);

  // Metronome effect
  useEffect(() => {
    if (metronomeInterval.current) clearInterval(metronomeInterval.current);
    setTicks([]); // reset ticks on bpm change
    if (!metronomeEnabled) return;
    metronomeInterval.current = setInterval(() => {
      setTicks((prev) => {
        const now = Date.now();
        playMetronomeTick(); // Play sound on each tick
        // Keep only ticks from the last 4 seconds (enough for slowest BPM)
        return [...prev, now].filter((t) => now - t < 4000);
      });
    }, 60000 / bpm);
    return () => {
      if (metronomeInterval.current) clearInterval(metronomeInterval.current);
    };
    // eslint-disable-next-line
  }, [bpm, metronomeEnabled]);

  // Map note to Y position (0% = bottom, 100% = top)
  function noteToY(note: string) {
    const idx = noteToIndex(note);
    if (idx === -1) return 50;
    // 36 notes: C3 (bottom) to B5 (top)
    return 100 - (idx / (notes.length - 1)) * 100;
  }

  // Add this helper function inside your component:
  function getNoteLeft(idx: number, total: number, scrollDuration = 10000) {
    // If you store timestamps, use them instead for more accurate scrolling
    // Here, we estimate time based on buffer position
    const now = Date.now();
    const firstIdx = Math.max(0, total - 300);
    const relativeIdx = idx - firstIdx;
    // Notes enter at 100% and leave at 0% over scrollDuration ms
    const percent = 100 - (relativeIdx / 300) * 100;
    return `calc(${percent}% - 4px)`;
  }

  return (
    <div className="p-4 w-full h-full text-[#eae1d6]">
      <div className="w-full h-1/3 flex flex-col justify-center items-center">
        <p className="text-1xl">{freq ? freq.toFixed(2) + ' Hz' : '--'}</p>
        <p className="text-8xl font-mono mt-2">{frequencyToNote(freq)}</p>
        <div className="flex gap-2 justify-center items-center">
          <div className={`w-4 h-4 rounded-full ${accuracyColor(freq)}`} />
          <p className="text-lg mt-2">{noteAccuracy(freq)}</p>
        </div>
        {/* Metronome controls */}
        <div className="flex items-center gap-2 mt-4">
          <label htmlFor="bpm" className="text-xs text-gray-400">
            Metronome BPM:
          </label>
          <input
            id="bpm"
            type="number"
            min={20}
            max={300}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-16 text-black rounded px-1 py-0.5"
          />
          <button
            onClick={() => setMetronomeEnabled((v) => !v)}
            className={`ml-4 px-3 py-1 rounded text-xs font-bold border ${
              metronomeEnabled
                ? 'bg-blue-500 border-blue-700 text-white'
                : 'bg-gray-300 border-gray-400 text-gray-700'
            }`}
          >
            {metronomeEnabled ? 'Disable Metronome' : 'Enable Metronome'}
          </button>
        </div>
      </div>
      <div className="text-xs w-full h-full text-[#eae1d6] rounded p-2 text-left">
        <div className="relative w-full h-2/3 rounded border overflow-hidden">
          {/* Draw horizontal lines for each note position */}
          {notes.map((note, idx) => (
            <div
              key={idx}
              className="absolute left-0 w-full border-t border-dashed border-gray-300/25"
              style={{
                bottom: `${100 - (idx / (notes.length - 1)) * 100}%`,
                zIndex: 0
              }}
            >
              <span className="absolute left-2 -top-3 text-gray-400 text-xs select-none">
                {note}
              </span>
            </div>
          ))}
          {/* Draw the notes as small colored dots, and a vertical line if isTick */}
          {latestNotes.map((item, idx) => (
            <>
              {item.clarity > 0.9 && (
                <div
                  key={`note-${idx}`}
                  className={`absolute left-0 w-1 h-3 rounded-sm ${accuracyColor(
                    item.freq
                  )}`}
                  style={{
                    bottom: `${noteToY(item.note)}%`,
                    left: getNoteLeft(idx, latestNotes.length), // <-- use the new function
                    zIndex: 1
                  }}
                  title={`${item.note} (${item.freq.toFixed(1)} Hz)`}
                />
              )}
              {item.isTick && (
                <div
                  key={`tick-${idx}`}
                  className="absolute left-0 top-0 h-full border-l-2 border-blue-400 opacity-70"
                  style={{
                    left: getNoteLeft(idx, latestNotes.length), // <-- use the new function
                    zIndex: 10
                  }}
                  title="Metronome Tick"
                />
              )}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
