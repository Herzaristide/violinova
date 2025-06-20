'use client';
import { useState, useEffect } from 'react';
// import { Sampler } from 'tone';
import ReactMarkdown from 'react-markdown';
import SheetMusic from '@/components/ui/sheetMusic/SheetMusic';
import { FaPause, FaPlay, FaStop } from 'react-icons/fa6';
import { Resizable } from 're-resizable';
import RessourceInfo from '@/components/ui/ressources/RessourceInfo';

export default function RessourceRender({ ressource }: { ressource: any }) {
  enum AnnotationsType {
    NA = 'NO',
    ABC = 'ABC',
    DOREMI = 'DOREMI',
    VIOLIN = 'VIOLIN'
  }

  // const [sampler, setSampler] = useState<Sampler>();
  const [annotations, setAnnotations] = useState(null);
  const [bpm, setBpm] = useState(150);
  const [isPlaying, setIsPlaying] = useState(false);
  const [classic, setClassic] = useState(false);
  const [value, setValue] = useState<string>();
  const [selected, setSelected] = useState();

  // useEffect(() => {
  //   const newSampler = new Sampler({
  //     urls: {
  //       // A
  //       A0: 'A0.mp3',
  //       A1: 'A1.mp3',
  //       A2: 'A2.mp3',
  //       A3: 'A3.mp3',
  //       A4: 'A4.mp3',
  //       A5: 'A5.mp3',
  //       A6: 'A6.mp3',
  //       A7: 'A7.mp3',
  //       // A#
  //       'A#1': 'Ab1.mp3',
  //       'A#2': 'Ab2.mp3',
  //       'A#3': 'Ab3.mp3',
  //       'A#4': 'Ab4.mp3',
  //       'A#5': 'Ab5.mp3',
  //       'A#6': 'Ab6.mp3',
  //       'A#7': 'Ab7.mp3',
  //       // B
  //       B0: 'B0.mp3',
  //       B1: 'B1.mp3',
  //       B2: 'B2.mp3',
  //       B3: 'B3.mp3',
  //       B4: 'B4.mp3',
  //       B5: 'B5.mp3',
  //       B6: 'B6.mp3',
  //       B7: 'B7.mp3',
  //       // B#
  //       'B#1': 'Bb1.mp3',
  //       'B#2': 'Bb2.mp3',
  //       'B#3': 'Bb3.mp3',
  //       'B#4': 'Bb4.mp3',
  //       'B#5': 'Bb5.mp3',
  //       'B#6': 'Bb6.mp3',
  //       'B#7': 'Bb7.mp3',
  //       // C
  //       // C0: "C0.mp3",
  //       C1: 'C1.mp3',
  //       C2: 'C2.mp3',
  //       C3: 'C3.mp3',
  //       C4: 'C4.mp3',
  //       C5: 'C5.mp3',
  //       C6: 'C6.mp3',
  //       C7: 'C7.mp3',
  //       // C#
  //       // "C#1": "Cb1.mp3","C#2": "Cb2.mp3","C#3": "Cb3.mp3","C#4": "Cb4.mp3","C#5": "Cb5.mp3","C#6": "Cb6.mp3","C#7": "Cb7.mp3",
  //       // D
  //       // D0: "D0.mp3",
  //       D1: 'D1.mp3',
  //       D2: 'D2.mp3',
  //       D3: 'D3.mp3',
  //       D4: 'D4.mp3',
  //       D5: 'D5.mp3',
  //       D6: 'D6.mp3',
  //       D7: 'D7.mp3',
  //       // D#
  //       'D#1': 'Db1.mp3',
  //       'D#2': 'Db2.mp3',
  //       'D#3': 'Db3.mp3',
  //       'D#4': 'Db4.mp3',
  //       'D#5': 'Db5.mp3',
  //       'D#6': 'Db6.mp3',
  //       'D#7': 'Db7.mp3',
  //       // E
  //       // E0: "E0.mp3",
  //       E1: 'E1.mp3',
  //       E2: 'E2.mp3',
  //       E3: 'E3.mp3',
  //       E4: 'E4.mp3',
  //       E5: 'E5.mp3',
  //       E6: 'E6.mp3',
  //       E7: 'E7.mp3',
  //       // E#
  //       'E#1': 'Eb1.mp3',
  //       'E#2': 'Eb2.mp3',
  //       'E#3': 'Eb3.mp3',
  //       'E#4': 'Eb4.mp3',
  //       'E#5': 'Eb5.mp3',
  //       'E#6': 'Eb6.mp3',
  //       'E#7': 'Eb7.mp3',
  //       // F
  //       // F0: "F0.mp3",
  //       F1: 'F1.mp3',
  //       F2: 'F2.mp3',
  //       F3: 'F3.mp3',
  //       F4: 'F4.mp3',
  //       F5: 'F5.mp3',
  //       F6: 'F6.mp3',
  //       F7: 'F7.mp3',
  //       // F#
  //       // "F#1": "Fb1.mp3","F#2": "Fb2.mp3","F#3": "Fb3.mp3","F#4": "Fb4.mp3","F#5": "Fb5.mp3","F#6": "Fb6.mp3","F#7": "Fb7.mp3",
  //       // G
  //       // G0: "G0.mp3",
  //       G1: 'G1.mp3',
  //       G2: 'G2.mp3',
  //       G3: 'G3.mp3',
  //       G4: 'G4.mp3',
  //       G5: 'G5.mp3',
  //       G6: 'G6.mp3',
  //       G7: 'G7.mp3',
  //       // G#
  //       'G#1': 'Gb1.mp3',
  //       'G#2': 'Gb2.mp3',
  //       'G#3': 'Gb3.mp3',
  //       'G#4': 'Gb4.mp3',
  //       'G#5': 'Gb5.mp3',
  //       'G#6': 'Gb6.mp3',
  //       'G#7': 'Gb7.mp3'
  //     },
  //     baseUrl: '/sounds/'
  //   }).toDestination();
  //   setSampler(newSampler);

  //   return () => {
  //     // Dispose of the sampler when the component is unmounted
  //     newSampler.dispose();
  //   };
  // }, []);

  useEffect(() => {
    const updatedValue = `
  \`\`\`abc
  X: ${ressource.reference}
  M: ${ressource.meter}
  K: ${ressource.key}
  ${ressource.partitions.map(
    (partition: string, index: number) =>
      `${partition}\n${annotations ? annotations[index] : null}\n`
  )}
  \`\`\``;

    setValue(updatedValue);
  }, [
    annotations,
    ressource.reference,
    ressource.meter,
    ressource.key,
    ressource.partitions
  ]);

  const changeAnnotations = (e: any) => {
    setAnnotations(ressource[`annotations_${e.target.value}`]);
  };

  const handleBpmChange = (e: any) => {
    setBpm(e.target.value);
  };

  const getTempoMarking = (bpm: number) => {
    if (bpm <= 40) {
      return 'Grave';
    } else if (bpm <= 60) {
      return 'Largo';
    } else if (bpm <= 66) {
      return 'Larghetto';
    } else if (bpm <= 76) {
      return 'Adagio';
    } else if (bpm <= 108) {
      return 'Andante';
    } else if (bpm <= 120) {
      return 'Moderato';
    } else if (bpm <= 168) {
      return 'Allegro';
    } else if (bpm <= 200) {
      return 'Vivace';
    } else {
      return 'Presto';
    }
  };

  const handleEvent = (event: any) => {
    if (event) {
      try {
        // sampler?.triggerAttack(event.notes[0].name);
        // sampler?.triggerRelease(event.notes[0].duration);
      } catch (e) {
        console.log(e);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const handleClick = (event: any) => {
    console.log(event);
    setSelected(event.pitches[0].name);
  };

  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match && match[1] === 'abc' ? (
        <SheetMusic
          notation={`${children}`.replace(/\n$/, '')}
          isPlaying={isPlaying}
          onEvent={handleEvent}
          onClick={handleClick}
          bpm={bpm}
          className={`${!classic ? 'classic' : 'pro'} rounded-[40px]`}
        />
      ) : (
        <code className={className} {...props} />
      );
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden gap-2">
      <Resizable
        className="w-full flex flex-col border-b-2 border-white"
        bounds="parent"
        defaultSize={{
          width: 'auto',
          height: '70%'
        }}
        enable={{
          top: false,
          right: false,
          bottom: true,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }}
      >
        <div className="w-full h-full overflow-y-scroll scroll">
          <ReactMarkdown
            className="w-full rounded-[50px]"
            components={components}
          >
            {value}
          </ReactMarkdown>
        </div>

        <div className="my-4 flex w-full text-[#EAE1D6]">
          <div className="p-2 h-12 w-1/5 flex justify-center items-center rounded-full border-2 border-solid border-[#df744a]">
            <h1>BPM</h1>
          </div>
          <div className="h-12 flex flex-col w-1/5 justify-center items-center">
            <input
              className="bg-transparent text-center appearance-none"
              title="bpm"
              type="number"
              value={bpm}
              onChange={handleBpmChange}
            />
            <input
              title="bpmSlider"
              type="range"
              id="numberSlider"
              name="numberSlider"
              min="1"
              max="300"
              value={bpm}
              onChange={handleBpmChange}
              className="appearance-none w-full bg-transparent [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-black/25 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:aspect-square [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#df744a]"
            />
            <h1>{getTempoMarking(bpm)}</h1>
          </div>
          <div className="p-2 w-1/5 gap-2 h-12 flex items-center justify-center rounded-full border-2 border-solid border-[#df744a]">
            <button title="stop" onClick={() => setIsPlaying(false)}>
              <FaStop color="#eae1d6" className="h-8 aspect-square" />
            </button>
            <button title="pause" onClick={() => null}>
              <FaPause color="#eae1d6" className="h-8 aspect-square" />
            </button>
            <button title="start" onClick={() => setIsPlaying(true)}>
              <FaPlay color="#eae1d6" className="h-8 aspect-square" />
            </button>
          </div>
          <button
            onClick={() => setClassic(!classic)}
            className="h-12 w-1/5 rounded-full [background:linear-gradient(180deg,rgb(226,119,76)_0%,rgb(211,103,65)_100%)] flex justify-center items-center"
          >
            {!classic ? 'Classic' : 'Pro'}
          </button>
          <select
            title="annotationSelect"
            onChange={changeAnnotations}
            className="h-12 w-1/5 text-center rounded-full [background:linear-gradient(180deg,rgb(226,119,76)_0%,rgb(211,103,65)_100%)]"
          >
            {Object.keys(AnnotationsType).map((key) => (
              <option key={key} value={key}>
                {AnnotationsType[key as keyof typeof AnnotationsType]}
              </option>
            ))}
          </select>
        </div>
      </Resizable>
      <RessourceInfo ressource={ressource} selected={selected} />
    </div>
  );
}
