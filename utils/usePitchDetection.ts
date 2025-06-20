import { PitchDetector } from 'pitchy';
import { useEffect, useRef, useState } from 'react';

export function usePitchDetection() {
  const [freq, setFreq] = useState<number | null>(null);
  const [clarity, setClarity] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    let isMounted = true;
    let source: MediaStreamAudioSourceNode | null = null;

    async function setup() {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 2048;
      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      const buffer = new Float32Array(analyserRef.current.fftSize);

      // Create a PitchDetector instance
      const detector = PitchDetector.forFloat32Array(
        analyserRef.current.fftSize
      );

      function update() {
        if (!isMounted) return;
        analyserRef.current!.getFloatTimeDomainData(buffer);
        const [pitch, clarity] = detector.findPitch(
          buffer,
          audioContext.sampleRate
        );
        setFreq(pitch);
        setClarity(clarity);

        rafRef.current = window.setTimeout(update, 50);
      }
      update();
    }

    setup();

    return () => {
      isMounted = false;
      if (rafRef.current) clearTimeout(rafRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      source = null;
    };
  }, []);

  return { freq, clarity, analyserRef };
}
