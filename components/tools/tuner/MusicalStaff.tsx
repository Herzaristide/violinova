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
const STAFF_LINES = [
  { note: 'E7', position: 15 },
  { note: 'C7', position: 20 },
  { note: 'A6', position: 25 },
  { note: 'F6', position: 30 },
  { note: 'D6', position: 35 },
  { note: 'B5', position: 40 },
  { note: 'G5', position: 45 },
  { note: 'E5', position: 50 }, // Traditional treble top line
  { note: 'C5', position: 55 },
  { note: 'A4', position: 60 }, // A440 reference
  { note: 'F4', position: 65 },
  { note: 'D4', position: 70 }, // Traditional treble bottom line
  { note: 'B3', position: 75 },
  { note: 'G3', position: 80 }, // Violin low G
  { note: 'E3', position: 85 }
];

const NOTE_POSITIONS: { [key: string]: number } = {
  // High range
  E7: 15,
  D7: 17.5,
  C7: 20,
  B6: 22.5,
  A6: 25,
  G6: 27.5,
  F6: 30,
  E6: 32.5,
  D6: 35,
  C6: 37.5,
  B5: 40,
  A5: 42.5,
  G5: 45,
  F5: 47.5,
  E5: 50,
  D5: 52.5,
  C5: 55,
  B4: 57.5,
  A4: 60,
  G4: 62.5,
  F4: 65,
  E4: 67.5,
  D4: 70,
  C4: 72.5,
  B3: 75,
  A3: 77.5,
  G3: 80,
  F3: 82.5,
  E3: 85
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
          style={{ top: '60%' }}
        >
          <span className="absolute left-2 -top-2 text-xs text-yellow-400/80 select-none">
            A4 (440Hz)
          </span>
        </div>
      </div>
    </div>
  );
}
