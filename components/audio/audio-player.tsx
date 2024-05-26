"use client";
import { useRef, useState, useEffect } from "react";
import AudioControls from "./audio-controls";
import AudioVisualiser from "./audio-visualiser";
import { readJson } from "@/app/actions/getSongData";
import SongOverview from "./song-overview";

type SongData = Awaited<ReturnType<typeof readJson>>;

interface AudioPlayerProps {
  songData: SongData;
}

const AudioPlayer = ({ songData }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [sourceNode, setSourceNode] =
    useState<MediaElementAudioSourceNode | null>(null);

  const [selectedSong, setSelectedSong] = useState(songData[0]);

  const handleSetSelectedSong = (song: SongData[number]) => {
    setSelectedSong(song);
    const audio = audioRef.current;
    if (audio) {
      audio.src = `/audio/${song.title}.mp3`;
      audio.currentTime = song.start;

      // Ensure the audio is loaded before playing
      audio.onloadeddata = () => {
        audio.play();
      };
    }
  };

  const createAudioContext = () => {
    if (!audioContext && audioRef.current) {
      const context = new (window.AudioContext || window.AudioContext)();
      setAudioContext(context);
      return context;
    }
    return audioContext;
  };

  useEffect(() => {
    if (audioContext && audioRef.current && !sourceNode) {
      const source = audioContext.createMediaElementSource(audioRef.current);
      setSourceNode(source);
    }
  }, [audioContext, audioRef, sourceNode]);

  return (
    <div className=" bg-gray-300 p-4 rounded-b-[3rem] rounded-t-xl shadow-xl aspect-[4/3] max-w-5xl flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Audio Player</h1>
      </div>
      <div className="grid grid-cols-3 h-full overflow-hidden">
        <div className="col-span-2 min-h-full">
          <AudioVisualiser
            audioRef={audioRef}
            audioContext={audioContext}
            sourceNode={sourceNode}
          />
        </div>
        <div className="col-span-1 min-h-full flex flex-col overflow-auto">
          <SongOverview
            songData={songData}
            selectedSong={selectedSong}
            handleSetSelectedSong={handleSetSelectedSong}
          />
        </div>
      </div>
      <audio ref={audioRef} src={`/audio/${selectedSong.title}.mp3`} />
      <AudioControls
        audioRef={audioRef}
        createAudioContext={createAudioContext}
        songData={selectedSong}
      />
    </div>
  );
};

export default AudioPlayer;
