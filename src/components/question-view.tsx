import { useEffect, useReducer, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import {
  initPlayback,
  playbackReducer,
  timeToAnswerMs,
  type SnippetBounds,
} from "@/game/snippetPlayback.ts";
import {
  connectMediaElement,
  hasAudioStarted,
  markAudioStarted,
  resumeAudio,
} from "@/lib/audio-viz.ts";
import Visualizer from "@/components/visualizer.tsx";
import type { AnswerInput, QuizQuestion } from "@/lib/api.ts";

const BOUNDS: SnippetBounds = { startSec: 0, endSec: Number.POSITIVE_INFINITY };
const NO_PLAY_PENALTY_MS = 60000; // answering without playing => no speed bonus

interface QuestionViewProps {
  question: QuizQuestion;
  index: number;
  total: number;
  onAnswer: (answer: AnswerInput) => void;
}

export default function QuestionView({
  question,
  index,
  total,
  onAnswer,
}: QuestionViewProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [state, dispatch] = useReducer(
    (s: ReturnType<typeof initPlayback>, a: Parameters<typeof playbackReducer>[1]) =>
      playbackReducer(s, a, BOUNDS),
    BOUNDS,
    initPlayback,
  );
  const [locked, setLocked] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    connectMediaElement(audio);
    const onPlay = () => {
      resumeAudio();
      markAudioStarted();
      dispatch({ type: "PLAY", atMs: Date.now() });
    };
    const onPause = () => dispatch({ type: "PAUSE" });
    const onEnded = () =>
      dispatch({ type: "TICK", currentSec: Number.POSITIVE_INFINITY });
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    // The first question needs a tap (browsers block autoplay). Once the player
    // has started audio once, later questions auto-play (the answer click that
    // advances the round counts as the activating gesture).
    if (hasAudioStarted()) {
      resumeAudio();
      audio.play().catch(() => {});
    }
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      if (state.status === "ended") audio.currentTime = 0;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  const choose = (chosenIndex: number) => {
    if (locked) return;
    setLocked(true);
    setSelectedIndex(chosenIndex);
    audioRef.current?.pause();
    const now = Date.now();
    const answeredState = playbackReducer(state, { type: "ANSWER", atMs: now }, BOUNDS);
    const ms = timeToAnswerMs(answeredState) ?? NO_PLAY_PENALTY_MS;
    // Brief beat so the player sees their pick register before advancing.
    window.setTimeout(() => {
      onAnswer({ chosenIndex, msToAnswer: ms, replays: answeredState.replays });
    }, 350);
  };

  const playing = state.status === "playing";

  return (
    <div className="flex flex-1 flex-col gap-5 bg-gray-100 p-4 sm:p-6">
      <audio
        ref={audioRef}
        src={question.snippetUrl}
        crossOrigin="anonymous"
        preload="auto"
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm font-bold text-gray-500">
          <span>
            Question {index + 1} / {total}
          </span>
          {state.replays > 0 && <span>↻ {state.replays}</span>}
        </div>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i < index
                  ? "bg-gradient-to-r from-red-500 to-purple-600"
                  : i === index
                    ? "bg-yellow-400"
                    : "bg-gray-300",
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 py-2">
        <div className="relative flex h-24 w-24 items-center justify-center">
          {state.status === "idle" && (
            <span className="absolute inset-0 animate-ping rounded-full bg-yellow-400/50" />
          )}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause snippet" : "Play snippet"}
            className="play-pause-button relative flex h-24 w-24 items-center justify-center"
          >
            {playing ? (
              <Pause className="h-10 w-10 fill-current text-gray-700" />
            ) : (
              <Play className="ml-1 h-10 w-10 fill-current text-gray-700" />
            )}
          </button>
        </div>
        <Visualizer active={playing} className="h-12 w-full max-w-xs" />
        <p className="text-sm font-semibold text-gray-600">
          {playing
            ? "Listening..."
            : state.status === "idle"
              ? "Tap ▶ to hear the ad-lib"
              : "Tap ▶ to replay"}
        </p>
      </div>

      <p className="text-center text-lg font-black text-gray-900">
        Which song is this?
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((option, i) => {
          const isSelected = selectedIndex === i;
          return (
            <button
              key={option}
              type="button"
              disabled={locked}
              onClick={() => choose(i)}
              className={cn(
                "border-r-4 border-b-4 border-l-4 border-t-4 px-4 py-4 text-base font-bold transition-all",
                "hover:scale-[0.98] active:scale-95",
                isSelected
                  ? "border-r-gray-300 border-b-gray-300 border-l-gray-600 border-t-gray-600 bg-yellow-300 text-gray-900"
                  : "border-r-gray-500 border-b-gray-500 border-l-white border-t-white bg-gray-300 text-gray-900",
                locked && !isSelected && "opacity-50",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
