import { readJson } from "@/app/actions/getSongData";
import {
  Pause,
  Play,
  Repeat,
  Shuffle,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import React from "react";
import { Slider } from "../ui/slider";
import { formatTime, formatSecondsBetween, cn } from "@/lib/utils";
import { Button } from "../ui/button";

type SongData = Awaited<ReturnType<typeof readJson>>[number];

interface AudioControlsProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  createAudioContext: () => AudioContext | null;
  songData: SongData | null;
  shuffleSongs: () => void;
  variant?: "quiz" | "player";
}

const AudioControls = ({
  audioRef,
  createAudioContext,
  songData,
  shuffleSongs,
  variant = "player",
}: AudioControlsProps) => {
  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [muted, setMuted] = React.useState(false);
  const [loop, setLoop] = React.useState(false);

  const toggleAudio = () => {
    if (!songData) return;
    createAudioContext();
    if (audioRef.current?.paused) {
      audioRef.current.currentTime = Math.max(
        audioRef.current.currentTime,
        songData.start
      );
      audioRef.current?.play();
      setPlaying(true);
    } else {
      audioRef.current?.pause();
      setPlaying(false);
    }
  };

  const adjustVolume = (value: number[]) => {
    if (value[0] === 0) {
      setMuted(true);
    } else {
      setMuted(false);
    }
    if (audioRef.current) {
      audioRef.current.volume = value[0];
    }
    setVolume(value[0]);
  };

  const toggleMute = () => {
    if (muted && volume > 0) {
      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
      setMuted(false);
    } else if (!muted && volume > 0) {
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
      setMuted(true);
    } else if (muted && volume === 0) {
      if (audioRef.current) {
        audioRef.current.volume = 0.5;
      }
      setVolume(0.5);
      setMuted(false);
    }
  };

  React.useEffect(() => {
    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === "MediaPlayPause") {
        event.preventDefault();
        toggleAudio();
      }
    };

    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, []);

  // reset controls if audioref changes
  React.useEffect(() => {
    // console.log("resetting controls");
    setPlaying(false);
    setTime(0);
  }, [songData]);

  React.useEffect(() => {
    const handleTimeUpdate = () => {
      if (!songData) return;
      if (audioRef.current?.currentTime) {
        // Check if the current time is greater than or equal to the end time. Add the -1 to counter for currentTimes such as 10.978s
        if (audioRef.current.currentTime >= songData.end - 1) {
          if (loop) {
            console.log("looping");
            audioRef.current.currentTime = songData.start;
          } else {
            audioRef.current.currentTime = songData.start;
            audioRef.current?.pause();
            setPlaying(false);
          }
        }
        setTime(audioRef.current.currentTime);
      }
    };

    const handleAudioEvents = () => {
      setPlaying(!audioRef.current?.paused);
    };

    if (audioRef.current) {
      audioRef.current.addEventListener("pause", handleAudioEvents);
      audioRef.current.addEventListener("play", handleAudioEvents);
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      audioRef.current.addEventListener("ended", handleAudioEvents);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("pause", handleAudioEvents);
        audioRef.current.removeEventListener("play", handleAudioEvents);
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.removeEventListener("ended", handleAudioEvents);
      }
    };
  }, [audioRef, songData?.start, songData?.end, loop]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleAudio();
    }
  };

  const handleTimeSliderCommit = (value: number[]) => {
    const newTime = value[0];
    if (!songData) return;
    if (newTime < songData.start || newTime > songData.end) {
      if (audioRef.current) {
        audioRef.current.currentTime = songData.start;
      }
    } else {
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
      }
    }
    createAudioContext();
    if (audioRef.current?.paused) {
      audioRef.current?.play();
      setPlaying(true);
    }
  };

  const toggleLoop = () => {
    setLoop(!loop);
  };

  return (
    <div className="flex flex-col gap-4 justify-center items-center w-full">
      <div className="w-full space-y-1">
        <div className="text-green-500 font-semibold text-xs lg:text-sm bg-black rounded-b-xl px-2 py-1 flex justify-between w-full">
          <div className="flex items-center gap-2 w-full">
            {playing ? (
              <Pause className="fill-current text-green-500 h-4 w-4" />
            ) : (
              <Play className="fill-current text-green-5000 h-4 w-4" />
            )}
            {variant === "player" && (
              <span className="w-2/3 truncate">
                {songData ? songData.title : "No song selected"}
              </span>
            )}
          </div>
          <span className="w-full text-end">
            {formatTime(
              audioRef.current?.currentTime && songData
                ? audioRef.current?.currentTime - songData.start
                : 0
            )}{" "}
            /{" "}
            {songData
              ? formatSecondsBetween(songData.start, songData.end)
              : "00:00"}
          </span>
        </div>
        <Slider
          defaultValue={[songData?.start ?? 0]}
          value={[time]}
          onValueChange={(value) => {
            const newTime = value[0];
            if (songData) {
              if (newTime < songData.start || newTime > songData.end) {
                if (audioRef.current) {
                  audioRef.current.currentTime = songData.start;
                }
              } else {
                if (audioRef.current) {
                  audioRef.current.currentTime = newTime;
                }
              }
            }
          }}
          onValueCommit={handleTimeSliderCommit}
          min={songData?.start ?? 0}
          max={songData?.end ?? 10}
          step={0.01}
        />
      </div>
      <div className="w-full flex items-center gap-4 lg:w-[450px]">
        <button
          onClick={toggleAudio}
          onKeyDown={handleKeyDown}
          className="play-pause-button shrink-0 grow-0"
          tabIndex={0}
          role="button"
          aria-pressed={playing}
          aria-label={playing ? "Pause audio" : "Play audio"}
        >
          {playing ? (
            <Pause className="fill-current text-gray-700 w-4 h-4 xl:w-8 xl:h-8" />
          ) : (
            <Play className="fill-current text-gray-700 w-4 h-4 xl:w-8 xl:h-8" />
          )}
        </button>
        <div className="flex w-full items-center gap-2 text-gray-700">
          <button
            onClick={toggleMute}
            tabIndex={0}
            role="button"
            aria-pressed={loop}
            aria-label={loop ? "Disable loop" : "Enable loop"}
          >
            {muted ? (
              <VolumeX className="w-6 h-6 xl:w-8 xl:h-8" />
            ) : !muted && volume! < 0.6 ? (
              <Volume1 className="w-6 h-6 xl:w-8 xl:h-8" />
            ) : (
              <Volume2 className="w-6 h-6 xl:w-8 xl:h-8" />
            )}
          </button>
          <Slider
            defaultValue={[audioRef.current?.volume ?? 1]}
            value={muted ? [0] : [volume]}
            onValueChange={(value) => adjustVolume(value)}
            max={1}
            step={0.01}
          />
        </div>
        <button
          onClick={toggleLoop}
          className={`shrink-0 grow-0 ${
            loop ? "text-green-500" : "text-gray-700"
          }`}
          tabIndex={0}
          role="button"
          aria-pressed={loop}
          aria-label={loop ? "Disable loop" : "Enable loop"}
        >
          <Repeat className="w-6 h-6 xl:w-8 xl:h-8" />
        </button>
        <button
          onClick={shuffleSongs}
          className="shrink-0 grow-0 text-gray-700"
          tabIndex={0}
          role="button"
          aria-label="Shuffle songs"
        >
          <Shuffle className="w-6 h-6 xl:w-8 xl:h-8 mr-2" />
        </button>
      </div>
    </div>
  );
};

export default AudioControls;
