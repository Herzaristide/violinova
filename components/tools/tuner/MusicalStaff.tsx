'use client';

import React from 'react';

interface MusicalStaffProps {
  notes: Array<{
    note: string;
    freq: number;
    clarity: number;
    isTick?: boolean;
  }>;
  accuracyColor: (freq: number | null) => string;
  getNoteLeft: (idx: number, total: number) => string;
}

// Simplified staff configuration focused on violin range (G3-E7)
// Spacing adjusted to match note size (8px = w-2 h-2)
const STAFF_LINES = [
  { note: 'E7', position: 8 },
  { note: 'D7', position: 12 },
  { note: 'C7', position: 16 },
  { note: 'B6', position: 20 },
  { note: 'A6', position: 24 },
  { note: 'G6', position: 28 },
  { note: 'F6', position: 32 },
  { note: 'E6', position: 36 },
  { note: 'D6', position: 40 },
  { note: 'C6', position: 44 },
  { note: 'B5', position: 48 },
  { note: 'A5', position: 52 },
  { note: 'G5', position: 56 }, // Traditional treble top line
  { note: 'F5', position: 60 },
  { note: 'E5', position: 64 }, // Traditional treble top line
  { note: 'D5', position: 68 },
  { note: 'C5', position: 72 },
  { note: 'B4', position: 76 },
  { note: 'A4', position: 80 }, // A440 reference
  { note: 'G4', position: 84 },
  { note: 'F4', position: 88 },
  { note: 'E4', position: 92 },
  { note: 'D4', position: 96 } // Traditional treble bottom line
];

const NOTE_POSITIONS: { [key: string]: number } = {
  // High range - 4% spacing between each semitone to match 8px note size
  E7: 8,
  D7: 12,
  C7: 16,
  B6: 20,
  A6: 24,
  G6: 28,
  F6: 32,
  E6: 36,
  D6: 40,
  C6: 44,
  B5: 48,
  A5: 52,
  G5: 56,
  F5: 60,
  E5: 64,
  D5: 68,
  C5: 72,
  B4: 76,
  A4: 80,
  G4: 84,
  F4: 88,
  E4: 92,
  D4: 96,
  C4: 100,
  B3: 104,
  A3: 108,
  G3: 112,
  F3: 116,
  E3: 120
};

const getNotePosition = (note: string): number => {
  const baseNote = note.replace(/[♯♭#b]/g, '');
  const position = NOTE_POSITIONS[baseNote];

  // If the note includes a sharp or flat, adjust position slightly
  if (note.includes('♯') || note.includes('#')) {
    return position ? position - 1 : 60; // Slightly higher for sharps
  }
  if (note.includes('♭') || note.includes('b')) {
    return position ? position + 1 : 60; // Slightly lower for flats
  }

  return position || 60;
};

const getAccidental = (note: string): string | null => {
  if (note.includes('♯') || note.includes('#')) return '♯';
  if (note.includes('♭') || note.includes('b')) return '♭';
  return null;
};

export default function MusicalStaff({
  notes,
  accuracyColor,
  getNoteLeft
}: MusicalStaffProps) {
  return (
    <div className="relative w-full h-full backdrop-blur-sm bg-white/5 rounded-xl overflow-hidden border border-white/10 shadow-inner">
      {/* Header */}
      <div className="absolute top-2 left-3 right-3 flex justify-between items-center text-xs text-white/70 select-none z-10">
        <span>Violin Range: G3 - E7</span>
        <span className="text-white/50">Notes: {notes.length}</span>
      </div>

      {/* Staff container */}
      <div className="relative w-full h-full pt-8 pb-4">
        {/* Staff lines */}
        {STAFF_LINES.map((line, idx) => (
          <div
            key={idx}
            className="absolute left-0 w-full"
            style={{ top: `${line.position}%` }}
          >
            {/* Main staff line */}
            <div
              className={`w-full border-t ${
                ['E5', 'C5', 'A4', 'F4', 'D4'].includes(line.note)
                  ? 'border-white/40'
                  : 'border-white/20'
              }`}
            />
            {/* Note label */}
            <span className="absolute right-2 -top-2 text-xs text-white/60 select-none font-mono">
              {line.note}
            </span>
          </div>
        ))}

        {/* Notes */}
        {notes.map((item, idx) => {
          if (item.clarity <= 0.7) return null;

          const position = getNotePosition(item.note);
          const accidental = getAccidental(item.note);
          const colorClass = accuracyColor(item.freq);

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
                <span className="absolute -left-5 top-1/2 transform -translate-y-1/2 text-sm font-bold text-white/80">
                  {accidental}
                </span>
              )}

              {/* Note dot */}
              <div
                className={`w-2 h-2 rounded-full ${colorClass} shadow-lg border border-white/30`}
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
                width: '2px',
                background:
                  'linear-gradient(to bottom, rgba(96, 165, 250, 0.8), rgba(59, 130, 246, 0.6))',
                boxShadow: '0 0 4px rgba(96, 165, 250, 0.5)'
              }}
              title="Metronome Beat"
            />
          );
        })}

        {/* Frequency reference line (A4 = 440Hz) */}
        <div
          className="absolute left-0 w-full border-t-2 border-yellow-400/30 z-5"
          style={{ top: '80%' }}
        >
          <span className="absolute left-2 -top-2 text-xs text-yellow-400/80 select-none">
            A4 (440Hz)
          </span>
        </div>
      </div>
    </div>
  );
}
