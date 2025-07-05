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

// Musical staff configuration
const STAFF_LINES = [
  { note: 'F5', position: 30 },
  { note: 'D5', position: 40 },
  { note: 'B4', position: 50 },
  { note: 'G4', position: 60 },
  { note: 'E4', position: 70 }
];

const LEDGER_LINES = [
  { note: 'C6', position: 10 },
  { note: 'A5', position: 20 },
  { note: 'C4', position: 80 },
  { note: 'A3', position: 90 },
  { note: 'F3', position: 100 }
];

const NOTE_POSITIONS: { [key: string]: number } = {
  C7: 0,
  B6: 5,
  A6: 10,
  G6: 15,
  F6: 20,
  E6: 25,
  D6: 30,
  C6: 10,
  B5: 15,
  A5: 20,
  G5: 25,
  F5: 30,
  E5: 35,
  D5: 40,
  C5: 45,
  B4: 50,
  A4: 55,
  G4: 60,
  F4: 65,
  E4: 70,
  D4: 75,
  C4: 80,
  B3: 85,
  A3: 90,
  G3: 95,
  F3: 100,
  E3: 105,
  D3: 110,
  C3: 115,
  B2: 120,
  A2: 125,
  G2: 130
};

const getNotePosition = (note: string): number => {
  const baseNote = note.replace(/[♯♭#b]/g, '');
  return NOTE_POSITIONS[baseNote] || 50;
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
    <div className="relative w-full h-64 bg-white rounded-lg overflow-hidden border-2 border-gray-300">
      {/* Staff lines */}
      {STAFF_LINES.map((line, idx) => (
        <div
          key={idx}
          className="absolute left-0 w-full border-t-2 border-black"
          style={{ top: `${line.position}%` }}
        >
          <span className="absolute right-2 -top-3 text-xs text-gray-600 select-none">
            {line.note}
          </span>
        </div>
      ))}

      {/* Ledger lines */}
      {LEDGER_LINES.map((line, idx) => (
        <div
          key={idx}
          className="absolute border-t-2 border-gray-500"
          style={{ left: '60px', right: '20px', top: `${line.position}%` }}
        >
          <span className="absolute right-2 -top-3 text-xs text-gray-500 select-none">
            {line.note}
          </span>
        </div>
      ))}

      {/* Treble clef */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-5xl font-bold text-black select-none">
        𝄞
      </div>

      {/* Notes */}
      {notes.map((item, idx) => {
        if (item.clarity <= 0.9) return null;

        const position = getNotePosition(item.note);
        const accidental = getAccidental(item.note);

        return (
          <div
            key={idx}
            className="absolute"
            style={{
              top: `${position}%`,
              left: getNoteLeft(idx, notes.length),
              transform: 'translateY(-50%)',
              zIndex: 3
            }}
          >
            {accidental && (
              <span className="absolute -left-6 top-1/2 transform -translate-y-1/2 text-xl font-bold text-black">
                {accidental}
              </span>
            )}
            <div
              className={`w-5 h-4 rounded-full border-2 border-black ${accuracyColor(
                item.freq
              )}`}
              style={{
                transform: 'rotate(-15deg)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
              title={`${item.note} (${item.freq.toFixed(1)} Hz)`}
            />
          </div>
        );
      })}

      {/* Metronome bars - full height lines crossing all staff lines */}
      {notes.map((item, idx) => {
        if (!item.isTick) return null;

        return (
          <div
            key={`metronome-${idx}`}
            className="absolute top-0 h-full opacity-80"
            style={{
              left: getNoteLeft(idx, notes.length),
              zIndex: 5,
              width: '3px',
              background:
                'linear-gradient(to bottom, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.8))',
              borderLeft: '3px solid rgba(59, 130, 246, 0.9)'
            }}
            title="Metronome Tick"
          />
        );
      })}
    </div>
  );
}
