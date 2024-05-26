import { Pause, Play, Repeat, Volume1, Volume2, VolumeX } from "lucide-react";
import moment from "moment";
import React from "react";
import { Slider } from "../ui/slider";
import { readJson } from "@/app/actions/getSongData";

type SongData = Awaited<ReturnType<typeof readJson>>[number];

interface AudioControlsProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  createAudioContext: () => AudioContext | null;
  songData: SongData;
}

const AudioControls = ({
  audioRef,
  createAudioContext,
  songData,
}: AudioControlsProps) => {
  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [muted, setMuted] = React.useState(false);
  const [loop, setLoop] = React.useState(false);

  const toggleAudio = () => {
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
    audioRef.current!.volume = value[0];
    setVolume(value[0]);
  };

  const toggleMute = () => {
    if (muted && volume > 0) {
      audioRef.current!.volume = volume;
      setMuted(false);
    } else if (!muted && volume > 0) {
      audioRef.current!.volume = 0;
      setMuted(true);
    } else if (muted && volume === 0) {
      audioRef.current!.volume = 0.5;
      setVolume(0.5);
      setMuted(false);
    }
  };

  const formatTime = (time: number) => {
    return moment.utc(time * 1000).format("mm:ss");
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

  React.useEffect(() => {
    const handleTimeUpdate = () => {
      if (audioRef.current!.currentTime >= songData.end) {
        if (loop) {
          audioRef.current!.currentTime = songData.start;
        } else {
          audioRef.current!.currentTime = songData.start;
          audioRef.current?.pause();
          setPlaying(false);
        }
      }
      setTime(audioRef.current!.currentTime);
    };

    const handleAudioEvents = () => {
      setPlaying(!audioRef.current?.paused);
    };

    audioRef.current?.addEventListener("pause", handleAudioEvents);
    audioRef.current?.addEventListener("play", handleAudioEvents);
    audioRef.current?.addEventListener("timeupdate", handleTimeUpdate);
    audioRef.current?.addEventListener("ended", handleAudioEvents);

    return () => {
      audioRef.current?.removeEventListener("pause", handleAudioEvents);
      audioRef.current?.removeEventListener("play", handleAudioEvents);
      audioRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
      audioRef.current?.removeEventListener("ended", handleAudioEvents);
    };
  }, [audioRef, songData.start, songData.end, loop]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleAudio();
    }
  };

  const handleTimeSliderCommit = (value: number[]) => {
    const newTime = value[0];
    if (newTime < songData.start || newTime > songData.end) {
      audioRef.current!.currentTime = songData.start;
    } else {
      audioRef.current!.currentTime = newTime;
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
    <div className="flex flex-col gap-4 justify-center items-center ">
      <div className="w-full space-y-1">
        <div className="text-green-500 font-semibold text-sm bg-black rounded-b-xl px-2 py-1 flex justify-between">
          <div className="flex items-center gap-2">
            {playing ? (
              <Pause className="fill-current text-green-500 h-4 w-4" />
            ) : (
              <Play className="fill-current text-green-5000 h-4 w-4" />
            )}
            <span>Song: {songData.title}</span>
          </div>
          <span>{formatTime(audioRef.current?.currentTime ?? 0)}</span>
        </div>
        <Slider
          defaultValue={[songData.start]}
          value={[time]}
          onValueChange={(value) => {
            const newTime = value[0];
            if (newTime < songData.start || newTime > songData.end) {
              audioRef.current!.currentTime = songData.start;
            } else {
              audioRef.current!.currentTime = newTime;
            }
          }}
          onValueCommit={handleTimeSliderCommit}
          min={songData.start}
          max={songData.end}
          step={0.01}
        />
      </div>
      <div className="flex items-center w-96 gap-4">
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
            <Pause className="fill-current text-gray-700" />
          ) : (
            <Play className="fill-current text-gray-700" />
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
              <VolumeX className="w-10 h-10" />
            ) : !muted && volume! < 0.6 ? (
              <Volume1 className="w-10 h-10" />
            ) : (
              <Volume2 className="w-10 h-10" />
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
          <Repeat className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default AudioControls;
