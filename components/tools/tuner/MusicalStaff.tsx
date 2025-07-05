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

// Musical staff line positions for treble clef (standard spacing)
const STAFF_LINES = [
  { note: 'F5', position: 30 }, // Top line
  { note: 'D5', position: 40 }, // 4th line
  { note: 'B4', position: 50 }, // 3rd line (middle)
  { note: 'G4', position: 60 }, // 2nd line
  { note: 'E4', position: 70 } // Bottom line
];

// Additional ledger lines (commonly used)
const LEDGER_LINES = [
  // High ledger lines (above staff)
  { note: 'C6', position: 10 }, // High C ledger line
  { note: 'A5', position: 20 }, // Above staff
  // Low ledger lines (below staff)
  { note: 'C4', position: 80 }, // Below staff
  { note: 'A3', position: 90 }, // Below staff
  { note: 'F3', position: 100 } // Below staff
];

// Remove space reference lines as they clutter the staff
// Musical staff should only show actual staff lines and necessary ledger lines

// Note positions on treble clef staff (percentage from top) - corrected spacing
const NOTE_POSITIONS: { [key: string]: number } = {
  // Above staff (ledger lines and spaces)
  C7: 0,
  B6: 5,
  A6: 10,
  G6: 15,
  F6: 20,
  E6: 25,
  D6: 30,
  C6: 10, // High C ledger line
  B5: 15, // Space above F5
  A5: 20, // A5 ledger line
  G5: 25, // Space above F5
  F5: 30, // Top staff line
  E5: 35, // Space between F5 and D5
  D5: 40, // 4th staff line
  C5: 45, // Space between D5 and B4
  B4: 50, // 3rd staff line (middle)
  A4: 55, // Space between B4 and G4
  G4: 60, // 2nd staff line
  F4: 65, // Space between G4 and E4
  E4: 70, // Bottom staff line
  D4: 75, // Space below E4
  C4: 80, // C4 ledger line
  B3: 85, // Space below C4
  A3: 90, // A3 ledger line
  G3: 95, // Space below A3
  F3: 100, // F3 ledger line
  E3: 105, // Space below F3
  D3: 110, // Below staff
  C3: 115, // Below staff
  B2: 120, // Below staff
  A2: 125, // Below staff
  G2: 130 // Below staff
};

function getNotePosition(note: string): number {
  // Remove sharp/flat symbols for position calculation
  const baseNote = note.replace(/[♯♭#b]/g, '');
  return NOTE_POSITIONS[baseNote] || 50; // Default to middle of staff
}

function isSharpOrFlat(note: string): string | null {
  if (note.includes('♯') || note.includes('#')) return '♯';
  if (note.includes('♭') || note.includes('b')) return '♭';
  return null;
}

export default function MusicalStaff({
  notes,
  accuracyColor,
  getNoteLeft
}: MusicalStaffProps) {
  return (
    <div className="relative w-full h-64 bg-white rounded-lg overflow-hidden border-2 border-gray-300">
      {/* Main staff lines */}
      {STAFF_LINES.map((line, idx) => (
        <div
          key={idx}
          className="absolute left-0 w-full border-t-2 border-black"
          style={{
            top: `${line.position}%`,
            zIndex: 1
          }}
        >
          <span className="absolute right-2 -top-3 text-xs text-gray-600 select-none">
            {line.note}
          </span>
        </div>
      ))}

      {/* Ledger lines (essential ones only) */}
      {LEDGER_LINES.map((line, idx) => (
        <div
          key={`ledger-${idx}`}
          className="absolute border-t-2 border-gray-500"
          style={{
            left: '60px',
            right: '20px',
            top: `${line.position}%`,
            zIndex: 1
          }}
        >
          <span className="absolute right-2 -top-3 text-xs text-gray-500 select-none">
            {line.note}
          </span>
        </div>
      ))}

      {/* Treble clef symbol */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-5xl font-bold text-black select-none">
        𝄞
      </div>

      {/* Note heads */}
      {notes.map((item, idx) => {
        if (item.clarity <= 0.9) return null;

        const position = getNotePosition(item.note);
        const accidental = isSharpOrFlat(item.note);

        return (
          <div
            key={`note-${idx}`}
            className="absolute"
            style={{
              top: `${position}%`,
              left: getNoteLeft(idx, notes.length),
              transform: 'translateY(-50%)',
              zIndex: 3
            }}
          >
            {/* Accidental (sharp/flat) */}
            {accidental && (
              <span className="absolute -left-6 top-1/2 transform -translate-y-1/2 text-xl font-bold text-black">
                {accidental}
              </span>
            )}

            {/* Note head */}
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

      {/* Metronome tick lines */}
      {notes.map((item, idx) => {
        if (!item.isTick) return null;

        return (
          <div
            key={`tick-${idx}`}
            className="absolute top-0 h-full border-l-2 border-blue-400 opacity-70"
            style={{
              left: getNoteLeft(idx, notes.length),
              zIndex: 4
            }}
            title="Metronome Tick"
          />
        );
      })}
    </div>
  );
}
