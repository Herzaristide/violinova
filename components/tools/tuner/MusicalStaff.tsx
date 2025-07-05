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

// Musical staff configuration for full range A0-C8 with equal spacing
const STAFF_LINES = [
  { note: 'C8', position: 5 }, // Highest line
  { note: 'A7', position: 10 },
  { note: 'F7', position: 15 },
  { note: 'D7', position: 20 },
  { note: 'B6', position: 25 },
  { note: 'G6', position: 30 },
  { note: 'E6', position: 35 },
  { note: 'C6', position: 40 },
  { note: 'A5', position: 45 },
  { note: 'F5', position: 50 }, // Traditional top line
  { note: 'D5', position: 55 }, // 4th line
  { note: 'B4', position: 60 }, // 3rd line (middle)
  { note: 'G4', position: 65 }, // 2nd line
  { note: 'E4', position: 70 }, // Traditional bottom line
  { note: 'C4', position: 75 },
  { note: 'A3', position: 80 },
  { note: 'F3', position: 85 },
  { note: 'D3', position: 90 },
  { note: 'B2', position: 95 },
  { note: 'G2', position: 100 },
  { note: 'E2', position: 105 },
  { note: 'C2', position: 110 },
  { note: 'A1', position: 115 },
  { note: 'F1', position: 120 },
  { note: 'D1', position: 125 },
  { note: 'B0', position: 130 },
  { note: 'A0', position: 135 } // Lowest line
];

const NOTE_POSITIONS: { [key: string]: number } = {
  // Octave 8
  C8: 5,
  B7: 7.5,
  A7: 10,
  G7: 12.5,
  F7: 15,
  E7: 17.5,
  D7: 20,
  C7: 22.5,
  // Octave 6-7
  B6: 25,
  A6: 27.5,
  G6: 30,
  F6: 32.5,
  E6: 35,
  D6: 37.5,
  C6: 40,
  B5: 42.5,
  A5: 45,
  G5: 47.5,
  // Traditional treble staff (F5-E4)
  F5: 50,
  E5: 52.5,
  D5: 55,
  C5: 57.5,
  B4: 60,
  A4: 62.5,
  G4: 65,
  F4: 67.5,
  E4: 70,
  // Extended lower range
  D4: 72.5,
  C4: 75,
  B3: 77.5,
  A3: 80,
  G3: 82.5,
  F3: 85,
  E3: 87.5,
  D3: 90,
  C3: 92.5,
  B2: 95,
  A2: 97.5,
  G2: 100,
  F2: 102.5,
  E2: 105,
  D2: 107.5,
  C2: 110,
  B1: 112.5,
  A1: 115,
  G1: 117.5,
  F1: 120,
  E1: 122.5,
  D1: 125,
  C1: 127.5,
  B0: 130,
  A0: 135
};

const getNotePosition = (note: string): number => {
  const baseNote = note.replace(/[♯♭#b]/g, '');
  const position = NOTE_POSITIONS[baseNote];

  // If the note includes a sharp or flat, adjust position slightly
  if (note.includes('♯') || note.includes('#')) {
    return position ? position - 1.25 : 50; // Slightly higher for sharps
  }
  if (note.includes('♭') || note.includes('b')) {
    return position ? position + 1.25 : 50; // Slightly lower for flats
  }

  return position || 50;
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
    <div className="relative w-full h-96 bg-white rounded-lg overflow-hidden border-2 border-gray-300">
      {/* Range indicator */}
      <div className="absolute top-2 left-2 text-xs text-gray-600 select-none">
        Range: A0 - C8 (Full Piano Range)
      </div>

      {/* Extended staff lines for A0-C8 range */}
      {STAFF_LINES.map((line, idx) => (
        <div
          key={idx}
          className="absolute left-0 w-full border-t border-gray-400"
          style={{ top: `${line.position}%` }}
        >
          <span className="absolute right-2 -top-3 text-xs text-gray-600 select-none">
            {line.note}
          </span>
        </div>
      ))}

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
              className={`w-0.5 h-4 ${accuracyColor(item.freq)}`}
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
