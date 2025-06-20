'use client';

import ml5 from 'ml5';
import { useEffect, useRef, useState } from 'react';

function useInterval(callback: () => void) {
  useEffect(() => {
    let id = setInterval(callback, 30);
    return () => clearInterval(id);
  }, [callback]);
}

export default function Analyzer() {
  const fundamental = 442;
  const pitchDetectorRef = useRef<any>();
  const audio = useRef<AudioContext>();
  const [tunerStarted, setTunerStarted] = useState(false);
  const [frequencyBuffer, setFrequencyBuffer] = useState<number[]>([]);

  function pitch() {
    if (!tunerStarted || !pitchDetectorRef.current) {
      return;
    }
    pitchDetectorRef.current.getPitch((err: any, frequency: any) => {
      setFrequencyBuffer((prev) => {
        const updated = [...prev, frequency];
        return updated.length > 100
          ? updated.slice(updated.length - 100)
          : updated;
      });
    });
  }

  function startTuner() {
    setTunerStarted((prev) => !prev);
    tunerStarted ? audio.current?.suspend() : audio.current?.resume();
  }

  useEffect(() => {
    audio.current = new AudioContext();
    const fetchData = async () => {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      pitchDetectorRef.current = ml5.pitchDetection(
        '/crepe/',
        audio.current,
        micStream,
        () => console.log('Model loaded !')
      );
    };
    fetchData();
    return () => {
      audio.current?.close();
    };
  }, []);

  useInterval(() => {
    pitch();
  });

  return (
    <div className="relative overflow-hidden w-full h-full flex flex-col">
      <button
        title="start"
        className="text-[#eae1d6] text-2xl"
        onClick={() => startTuner()}
      >
        Go
      </button>
      <div className=" text-xs text-[#eae1d6] flex">
        {frequencyBuffer.map((f, i) => {
          return (
            <div className="w-2" key={i}>
              {frequencyToNote(f, fundamental)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function frequencyToNote(f: number, fundamental: number) {
  const notes = [
    'A',
    'A#',
    'B',
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#'
  ];
  const p = 12.0 * Math.log2(f / fundamental);
  const r = Math.round(p);
  const n = notes[((r % 12) + 12) % 12];
  return n;
}
