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

// Musical staff configuration with perfectly equal spacing
const STAFF_LINES = [
  { note: 'F5', position: 25 }, // Top line
  { note: 'D5', position: 35 }, // 4th line
  { note: 'B4', position: 45 }, // 3rd line (middle)
  { note: 'G4', position: 55 }, // 2nd line
  { note: 'E4', position: 65 } // Bottom line
];

const LEDGER_LINES = [
  { note: 'C6', position: 5 }, // High ledger line
  { note: 'A5', position: 15 }, // Above staff ledger
  { note: 'C4', position: 75 }, // Below staff ledger
  { note: 'A3', position: 85 }, // Below staff ledger
  { note: 'F3', position: 95 } // Low ledger line
];

const NOTE_POSITIONS: { [key: string]: number } = {
  C7: 0,
  B6: 2.5,
  A6: 5, // A6 ledger line
  G6: 7.5,
  F6: 10,
  E6: 12.5,
  D6: 15, // D6 ledger line
  C6: 5, // High C ledger line
  B5: 10, // Space above A5
  A5: 15, // A5 ledger line
  G5: 20, // Space above F5
  F5: 25, // Top staff line
  E5: 30, // Space between F5 and D5
  D5: 35, // 4th staff line
  C5: 40, // Space between D5 and B4
  B4: 45, // 3rd staff line (middle)
  A4: 50, // Space between B4 and G4
  G4: 55, // 2nd staff line
  F4: 60, // Space between G4 and E4
  E4: 65, // Bottom staff line
  D4: 70, // Space below E4
  C4: 75, // C4 ledger line
  B3: 80, // Space below C4
  A3: 85, // A3 ledger line
  G3: 90, // Space below A3
  F3: 95, // F3 ledger line
  E3: 100, // Space below F3
  D3: 105, // Below staff
  C3: 110, // Below staff
  B2: 115, // Below staff
  A2: 120, // Below staff
  G2: 125 // Below staff
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
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[140px] font-bold text-black select-none">
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
              className={`w-1 h-6 ${accuracyColor(item.freq)}`}
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
