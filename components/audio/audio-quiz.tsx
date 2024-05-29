"use client";
import { readJson } from "@/app/actions/getSongData";
import { use, useEffect, useRef, useState } from "react";
import { GuessSong } from "../guess-song";
import AudioControls from "./audio-controls";
import AudioVisualiser from "./audio-visualiser";
import { useQuizStore } from "@/stores/quizStore";
import { Button, buttonVariants } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { set } from "react-hook-form";
import { QuizProgressBar } from "../quiz-progress-bar";

type SongData = Awaited<ReturnType<typeof readJson>>;

interface AudioQuizProps {
  songData: SongData;
}

const AudioQuiz = ({ songData }: AudioQuizProps) => {
  const { songsGuessedWithCroppedEnd, resetSongsGuessed } = useQuizStore();

  const [songsToGuess, setSongsToGuess] = useState<SongData>([]);
  const [selectedSong, setSelectedSong] = useState<SongData[number] | null>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const newSongsToGuess = songData.filter(
      (song) =>
        !songsGuessedWithCroppedEnd.some(
          (guessedSong) => guessedSong.title === song.title
        )
    );
    setSongsToGuess(newSongsToGuess);
    setSelectedSong(newSongsToGuess[0]);
    setIsLoading(false);
  }, [songData, songsGuessedWithCroppedEnd]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [sourceNode, setSourceNode] =
    useState<MediaElementAudioSourceNode | null>(null);

  const moveToNextSong = () => {
    if (!selectedSong) return;
    console.log("Moving to next song");
    const nextSongIndex = songsToGuess.indexOf(selectedSong) + 1;
    if (nextSongIndex > songsToGuess.length) {
      ("console.log('No more songs to guess!')");
      setSelectedSong(null);
      return;
    }
    const nextSong = songsToGuess[nextSongIndex];
    if (nextSong) {
      setSelectedSong(nextSong);
    }
  };

  const shuffleSongs = () => {
    if (!selectedSong) return;
    const shuffledSongIndex = Math.floor(Math.random() * songsToGuess.length);
    console.log(shuffledSongIndex);
    if (shuffledSongIndex === 0 && songsToGuess.length <= 1) {
      return;
    }
    if (shuffledSongIndex === songsToGuess.indexOf(selectedSong)) {
      shuffleSongs();
      return;
    }
    const shuffledSong = songsToGuess[shuffledSongIndex];
    setSelectedSong(shuffledSong);
  };

  const resetSongs = () => {
    resetSongsGuessed();
    setSongsToGuess(songData);
    setSelectedSong(songData[0]);
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
    <>
      {selectedSong ? (
        <div className="bg-gray-300 p-4 rounded-b-[3rem] h-full rounded-t-xl shadow-xl max-w-4xl flex flex-col justify-between">
          <div className="mb-2 flex w-full justify-between items-center">
            <h1 className="text-2xl font-semibold">
              The Ultimate Yeh-Yeh-Yeh Quiz
            </h1>
            <Button
              onClick={resetSongs}
              className="rounded-none bg-gray-300 border-r-2 border-r-gray-400 border-b-2 border-b-gray-400 border-l-2 border-l-white border-t-2 border-t-white text-gray-800 hover:bg-gray-300 hover:text-gray-800 hover:scale-95"
            >
              Reset Quiz
            </Button>
          </div>
          <div className="mb-2 flex flex-col w-full items-end gap-1">
            <span>
              {songsGuessedWithCroppedEnd.length} / {songData.length} songs
              guessed
            </span>
            <QuizProgressBar
              current={songsGuessedWithCroppedEnd.length}
              total={songData.length}
            />
          </div>
          <>
            <AudioVisualiser
              audioRef={audioRef}
              audioContext={audioContext}
              createAudioContext={createAudioContext}
              sourceNode={sourceNode}
              songData={selectedSong}
            />

            <audio ref={audioRef} src={`/audio/${selectedSong.title}.mp3`} />
            <AudioControls
              audioRef={audioRef}
              createAudioContext={createAudioContext}
              songData={selectedSong}
              shuffleSongs={shuffleSongs}
              variant="quiz"
            />
            <GuessSong
              allSongs={songsToGuess}
              selectedSong={selectedSong}
              nextSong={moveToNextSong}
            />
          </>
        </div>
      ) : songsToGuess.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-3xl font-semibold">
            You&apos;ve guessed all the songs! 🎉
          </p>
          <div className="flex gap-2">
            <Link
              href="/player"
              className={cn(
                buttonVariants({}),
                "rounded-none bg-gray-300 border-r-2 border-r-gray-400 border-b-2 border-b-gray-400 border-l-2 border-l-white border-t-2 border-t-white text-gray-800 hover:bg-gray-300 hover:text-gray-800 hover:scale-95"
              )}
            >
              Listen to all songs
            </Link>
            <Button
              onClick={resetSongs}
              className="rounded-none bg-gray-300 border-r-2 border-r-gray-400 border-b-2 border-b-gray-400 border-l-2 border-l-white border-t-2 border-t-white text-gray-800 hover:bg-gray-300 hover:text-gray-800 hover:scale-95"
            >
              Play again
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-3xl font-semibold">Loading...</p>
        </div>
      )}
    </>
  );
};
export default AudioQuiz;
