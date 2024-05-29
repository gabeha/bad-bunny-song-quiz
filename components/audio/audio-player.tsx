"use client";
import { useRef, useState, useEffect } from "react";
import AudioControls from "./audio-controls";
import AudioVisualiser from "./audio-visualiser";
import { readJson } from "@/app/actions/getSongData";
import SongOverview from "./song-overview";
import { useQuizStore } from "@/stores/quizStore";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";

type SongData = Awaited<ReturnType<typeof readJson>>;

interface AudioPlayerProps {
  songData: SongData;
}

const AudioPlayer = ({ songData }: AudioPlayerProps) => {
  const { songsGuessed } = useQuizStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [sourceNode, setSourceNode] =
    useState<MediaElementAudioSourceNode | null>(null);

  const [selectedSong, setSelectedSong] = useState(songsGuessed[0] || null);

  const handleSetSelectedSong = (song: SongData[number]) => {
    setSelectedSong(song);
    const audio = audioRef.current;
    if (audio) {
      createAudioContext();
      audio.src = `/audio/${song.title}.mp3`;
      audio.currentTime = song.start;

      // Ensure the audio is loaded before playing
      audio.onloadeddata = () => {
        audio.play();
      };
    }
  };

  const shuffleSongs = () => {
    const shuffledSongs = songsGuessed.sort(() => Math.random() - 0.5);
    setSelectedSong(shuffledSongs[0]);
    const audio = audioRef.current;
    if (audio) {
      createAudioContext();
      audio.src = `/audio/${shuffledSongs[0].title}.mp3`;
      audio.currentTime = shuffledSongs[0].start;

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
    <div className="bg-gray-300 p-4 rounded-b-[3rem] rounded-t-xl shadow-xl max-w-2xl xl:max-w-4xl h-fit flex flex-col justify-between">
      <div className="mb-2 flex w-full justify-between items-center">
        <h1 className="text-2xl font-semibold">
          The Ultimate Yeh-Yeh-Yeh Quiz
        </h1>
        <Link
          href={"/quiz"}
          className={cn(
            buttonVariants({}),
            "rounded-none bg-gray-300 border-r-2 border-r-gray-400 border-b-2 border-b-gray-400 border-l-2 border-l-white border-t-2 border-t-white text-gray-800 hover:bg-gray-300 hover:text-gray-800 hover:scale-95"
          )}
        >
          Play Quiz
        </Link>
      </div>
      <div className="grid grid-cols-3 h-full overflow-hidden border-r-2 border-r-gray-600 border-t-2 border-t-gray-300">
        <div className="col-span-2">
          <AudioVisualiser
            audioRef={audioRef}
            audioContext={audioContext}
            createAudioContext={createAudioContext}
            sourceNode={sourceNode}
            songData={selectedSong}
          />
        </div>
        <div className="col-span-1 min-h-full flex flex-col overflow-auto">
          <SongOverview
            songData={songData.filter((song) =>
              songsGuessed.map((song) => song.title).includes(song.title)
            )}
            selectedSong={selectedSong}
            handleSetSelectedSong={handleSetSelectedSong}
          />
        </div>
      </div>
      {selectedSong && (
        <audio ref={audioRef} src={`/audio/${selectedSong.title}.mp3`} />
      )}
      <AudioControls
        audioRef={audioRef}
        createAudioContext={createAudioContext}
        songData={selectedSong}
        shuffleSongs={shuffleSongs}
        variant="player"
      />
    </div>
  );
};

export default AudioPlayer;
