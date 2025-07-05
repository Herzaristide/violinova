'use client';

import React, { useMemo, useCallback } from 'react';

interface MusicalStaffProps {
  notes: Array<{
    note: string;
    freq: number;
    clarity: number;
    isTick?: boolean;
  }>;
  accuracyColor: (freq: number | null) => string;
  getNoteLeft: (idx: number, total: number) => string;
  noteRange?: 'violin' | 'piano' | 'guitar' | 'bass' | 'custom';
  customLowNote?: string;
  customHighNote?: string;
  onRangeChange?: (lowNote: string, highNote: string) => void;
}

// Note range configurations
const NOTE_RANGES = {
  violin: { low: 'G3', high: 'E7', name: 'Violin Range' },
  piano: { low: 'A0', high: 'C8', name: 'Piano Range' },
  guitar: { low: 'E2', high: 'E6', name: 'Guitar Range' },
  bass: { low: 'E1', high: 'G4', name: 'Bass Range' },
  custom: { low: 'C3', high: 'C6', name: 'Custom Range' }
};

// All possible notes in chromatic order from C0 to B8
const ALL_NOTES = [
  'C0',
  'C♯0',
  'D0',
  'D♯0',
  'E0',
  'F0',
  'F♯0',
  'G0',
  'G♯0',
  'A0',
  'A♯0',
  'B0',
  'C1',
  'C♯1',
  'D1',
  'D♯1',
  'E1',
  'F1',
  'F♯1',
  'G1',
  'G♯1',
  'A1',
  'A♯1',
  'B1',
  'C2',
  'C♯2',
  'D2',
  'D♯2',
  'E2',
  'F2',
  'F♯2',
  'G2',
  'G♯2',
  'A2',
  'A♯2',
  'B2',
  'C3',
  'C♯3',
  'D3',
  'D♯3',
  'E3',
  'F3',
  'F♯3',
  'G3',
  'G♯3',
  'A3',
  'A♯3',
  'B3',
  'C4',
  'C♯4',
  'D4',
  'D♯4',
  'E4',
  'F4',
  'F♯4',
  'G4',
  'G♯4',
  'A4',
  'A♯4',
  'B4',
  'C5',
  'C♯5',
  'D5',
  'D♯5',
  'E5',
  'F5',
  'F♯5',
  'G5',
  'G♯5',
  'A5',
  'A♯5',
  'B5',
  'C6',
  'C♯6',
  'D6',
  'D♯6',
  'E6',
  'F6',
  'F♯6',
  'G6',
  'G♯6',
  'A6',
  'A♯6',
  'B6',
  'C7',
  'C♯7',
  'D7',
  'D♯7',
  'E7',
  'F7',
  'F♯7',
  'G7',
  'G♯7',
  'A7',
  'A♯7',
  'B7',
  'C8',
  'C♯8',
  'D8',
  'D♯8',
  'E8',
  'F8',
  'F♯8',
  'G8',
  'G♯8',
  'A8',
  'A♯8',
  'B8'
];

// Natural notes only (no sharps) for range selection
const NATURAL_NOTES = ALL_NOTES.filter((note) => !note.includes('♯'));

// Optimized note order lookup for performance
const NOTE_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NOTE_ORDER_MAP = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };

// Pre-calculated flat to sharp conversion map
const FLAT_TO_SHARP_MAP: { [key: string]: string } = {
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#'
};

// Optimized staff generation with reduced iterations
const generateStaffConfig = (lowNote: string, highNote: string) => {
  const lowIndex = NATURAL_NOTES.findIndex(
    (note) => note.replace('♯', '#') === lowNote.replace('♯', '#')
  );
  const highIndex = NATURAL_NOTES.findIndex(
    (note) => note.replace('♯', '#') === highNote.replace('♯', '#')
  );

  if (lowIndex === -1 || highIndex === -1 || lowIndex >= highIndex) {
    return generateStaffConfig('G3', 'E7');
  }

  const rangeNotes = NATURAL_NOTES.slice(lowIndex, highIndex + 1);
  const staffLines = [];
  const notePositions: { [key: string]: number } = {};

  // Optimized position calculation
  const totalNotes = rangeNotes.length;
  const spacing = totalNotes > 1 ? 80 / (totalNotes - 1) : 0; // Pre-calculated: (90-10)/(totalNotes-1)

  rangeNotes.forEach((note, index) => {
    const position = 90 - index * spacing;
    const baseNote = note.replace('♯', '#');

    staffLines.push({ note: baseNote, position });
    notePositions[baseNote] = position;
  });

  // Optimized sharp note positioning - only process notes in range
  const startOctave = parseInt(rangeNotes[0].slice(1));
  const endOctave = parseInt(rangeNotes[rangeNotes.length - 1].slice(1));

  for (let octave = startOctave; octave <= endOctave; octave++) {
    // Process only relevant sharps for current octave
    ['C♯', 'D♯', 'F♯', 'G♯', 'A♯'].forEach((sharp) => {
      const note = sharp + octave;
      const baseNote = sharp.replace('♯', '#') + octave;
      const naturalBelow = sharp.charAt(0) + octave;
      const naturalAbove = getNextNaturalNote(naturalBelow);

      const positionBelow = notePositions[naturalBelow];
      const positionAbove = notePositions[naturalAbove];

      if (positionBelow !== undefined && positionAbove !== undefined) {
        const sharpPosition = (positionBelow + positionAbove) * 0.5; // Optimized division
        notePositions[baseNote] = sharpPosition;
        notePositions[note] = sharpPosition;
      }
    });
  }

  return { staffLines, notePositions };
};

// Optimized helper function using lookup map
const getNextNaturalNote = (note: string): string => {
  const noteChar = note.charAt(0);
  const octave = parseInt(note.slice(1));
  const index = NOTE_ORDER_MAP[noteChar as keyof typeof NOTE_ORDER_MAP];

  return index === 6 ? `C${octave + 1}` : `${NOTE_ORDER[index + 1]}${octave}`;
};

const getAccidental = (note: string): string | null => {
  if (note.includes('♯') || note.includes('#')) return '♯';
  if (note.includes('♭') || note.includes('b')) return '♭';
  return null;
};

export default function MusicalStaff({
  notes,
  accuracyColor,
  getNoteLeft,
  noteRange = 'violin',
  customLowNote = 'C3',
  customHighNote = 'C6',
  onRangeChange
}: MusicalStaffProps) {
  // Memoized range configuration
  const range = useMemo(
    () =>
      noteRange === 'custom'
        ? { low: customLowNote, high: customHighNote, name: 'Custom Range' }
        : NOTE_RANGES[noteRange],
    [noteRange, customLowNote, customHighNote]
  );

  // Memoized staff configuration - only recalculate when range changes
  const { staffLines, notePositions } = useMemo(
    () => generateStaffConfig(range.low, range.high),
    [range.low, range.high]
  );

  // Optimized note position function with memoization
  const getNotePosition = useCallback(
    (note: string): number => {
      const baseNote = note.replace(/[♯♭#b]/g, '');
      const position = notePositions[baseNote];

      if (note.includes('♯') || note.includes('#')) {
        return notePositions[note.replace('♯', '#')] || position || 50;
      }

      if (note.includes('♭') || note.includes('b')) {
        const equivalentSharp = convertFlatToSharp(note);
        return notePositions[equivalentSharp] || position || 50;
      }

      return position || 50;
    },
    [notePositions]
  );

  // Optimized flat to sharp conversion using pre-calculated map
  const convertFlatToSharp = useCallback((flatNote: string): string => {
    const noteBase = flatNote.replace(/[♭b]/g, '').replace(/\d+/g, '');
    const octave = flatNote.match(/\d+/)?.[0] || '';

    return FLAT_TO_SHARP_MAP[noteBase + 'b'] + octave || flatNote;
  }, []);

  // Memoized A4 position
  const a4Position = useMemo(() => notePositions['A4'], [notePositions]);

  // Memoized accidental function
  const getAccidental = useCallback((note: string): string | null => {
    if (note.includes('♯') || note.includes('#')) return '♯';
    if (note.includes('♭') || note.includes('b')) return '♭';
    return null;
  }, []);

  return (
    <div className="relative w-full h-full backdrop-blur-sm bg-white/5 rounded-xl overflow-hidden border border-white/10 shadow-inner">
      {/* Header with custom range controls */}
      <div className="absolute top-2 left-3 right-3 flex justify-between items-center text-xs text-white/70 select-none z-10">
        <div className="flex items-center gap-2">
          <span>{range.name}:</span>
          {noteRange === 'custom' && onRangeChange ? (
            <div className="flex items-center gap-1">
              <select
                value={customLowNote}
                onChange={(e) => onRangeChange(e.target.value, customHighNote)}
                className="bg-white/10 backdrop-blur-md text-white rounded px-1 py-0.5 border border-white/20 text-xs"
              >
                {NATURAL_NOTES.map((note) => (
                  <option key={note} value={note} className="bg-gray-800">
                    {note}
                  </option>
                ))}
              </select>
              <span>to</span>
              <select
                value={customHighNote}
                onChange={(e) => onRangeChange(customLowNote, e.target.value)}
                className="bg-white/10 backdrop-blur-md text-white rounded px-1 py-0.5 border border-white/20 text-xs"
              >
                {NATURAL_NOTES.map((note) => (
                  <option key={note} value={note} className="bg-gray-800">
                    {note}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span>
              {range.low} - {range.high}
            </span>
          )}
        </div>
        <span className="text-white/50">
          Notes: {notes.length} | Lines: {staffLines.length}
        </span>
      </div>

      {/* Staff container */}
      <div className="relative w-full h-full pt-8 pb-4">
        {/* Staff lines */}
        {staffLines.map((line, idx) => (
          <div
            key={idx}
            className="absolute left-0 w-full"
            style={{ top: `${line.position}%` }}
          >
            {/* Main staff line */}
            <div
              className={`w-full border-t ${
                // Highlight traditional treble staff lines if they exist
                ['G5', 'E5', 'C5', 'A4', 'F4'].includes(line.note)
                  ? 'border-white/40'
                  : line.note.includes('#')
                  ? 'border-white/10' // Lighter lines for sharps/flats
                  : 'border-white/20'
              }`}
            />
            {/* Note label */}
            <span className="absolute right-2 -top-2 text-xs text-white/60 select-none font-mono">
              {line.note}
            </span>
          </div>
        ))}

        {/* Notes - keeping filtering logic unchanged */}
        {notes.map((item, idx) => {
          if (item.clarity <= 0.7) return null;

          const position = getNotePosition(item.note);
          const accidental = getAccidental(item.note);
          const colorClass = accuracyColor(item.freq);

          // Only show notes within the current range
          if (position < 10 || position > 90) {
            return null;
          }

          return (
            <div
              key={idx}
              className="absolute"
              style={{
                top: `${position}%`,
                left: getNoteLeft(idx, notes.length),
                transform: 'translateY(-50%)',
                zIndex: 20
              }}
            >
              {/* Accidental */}
              {accidental && (
                <span className="absolute -left-4 top-1/2 transform -translate-y-1/2 text-xs font-bold text-white/80">
                  {accidental}
                </span>
              )}

              {/* Note dot */}
              <div
                className={`w-1.5 h-1.5 rounded-full ${colorClass} shadow-lg border border-white/30`}
                title={`${item.note} (${item.freq.toFixed(1)} Hz, ${(
                  item.clarity * 100
                ).toFixed(0)}% clarity)`}
              >
                {/* Glow effect for high clarity notes */}
                {item.clarity > 0.9 && (
                  <div
                    className={`absolute inset-0 rounded-full ${colorClass} opacity-50 animate-pulse`}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Metronome tick lines */}
        {notes.map((item, idx) => {
          if (!item.isTick) return null;

          return (
            <div
              key={`metronome-${idx}`}
              className="absolute top-0 h-full opacity-60"
              style={{
                left: getNoteLeft(idx, notes.length),
                zIndex: 10,
                width: '1px',
                background:
                  'linear-gradient(to bottom, rgba(96, 165, 250, 0.8), rgba(59, 130, 246, 0.6))',
                boxShadow: '0 0 2px rgba(96, 165, 250, 0.5)'
              }}
              title="Metronome Beat"
            />
          );
        })}

        {/* Frequency reference line (A4 = 440Hz) - only show if A4 is in range */}
        {a4Position && (
          <div
            className="absolute left-0 w-full border-t-2 border-yellow-400/30 z-5"
            style={{ top: `${a4Position}%` }}
          >
            <span className="absolute left-2 -top-2 text-xs text-yellow-400/80 select-none">
              A4 (440Hz)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
