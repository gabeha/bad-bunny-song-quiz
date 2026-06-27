import { useEffect, useReducer, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import {
  initPlayback,
  playbackReducer,
  timeToAnswerMs,
  type SnippetBounds,
} from "@/game/snippetPlayback.ts";
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => dispatch({ type: "PLAY", atMs: Date.now() });
    const onPause = () => dispatch({ type: "PAUSE" });
    const onEnded = () =>
      dispatch({ type: "TICK", currentSec: Number.POSITIVE_INFINITY });
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    // Try to autoplay; browsers may block until a user gesture, which is fine.
    audio.play().catch(() => {});
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
    audioRef.current?.pause();
    const now = Date.now();
    const answeredState = playbackReducer(state, { type: "ANSWER", atMs: now }, BOUNDS);
    const ms = timeToAnswerMs(answeredState) ?? NO_PLAY_PENALTY_MS;
    onAnswer({ chosenIndex, msToAnswer: ms, replays: answeredState.replays });
  };

  const playing = state.status === "playing";

  return (
    <div className="flex flex-1 flex-col gap-5 bg-gray-100 p-4 sm:p-6">
      <audio ref={audioRef} src={question.snippetUrl} preload="auto" />

      <div className="flex items-center justify-between text-sm font-bold text-gray-500">
        <span>
          Question {index + 1} / {total}
        </span>
        {state.replays > 0 && <span>↻ {state.replays} replays</span>}
      </div>

      <div className="flex flex-col items-center gap-3 py-2">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause snippet" : "Play snippet"}
          className="play-pause-button flex h-24 w-24 items-center justify-center"
        >
          {playing ? (
            <Pause className="h-10 w-10 fill-current text-gray-700" />
          ) : (
            <Play className="h-10 w-10 fill-current text-gray-700" />
          )}
        </button>
        <EqualizerBars active={playing} />
        <p className="text-sm font-semibold text-gray-500">
          {playing ? "Listening..." : "Tap to play the ad-lib"}
        </p>
      </div>

      <p className="text-center text-lg font-black text-gray-900">
        Which song is this?
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((option, i) => (
          <button
            key={option}
            type="button"
            disabled={locked}
            onClick={() => choose(i)}
            className={cn(
              "border-r-4 border-b-4 border-l-4 border-t-4 border-r-gray-500 border-b-gray-500 border-l-white border-t-white bg-gray-300 px-4 py-4 text-base font-bold text-gray-900 transition-transform",
              "hover:scale-[0.98] active:scale-95 disabled:opacity-60",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function EqualizerBars({ active }: { active: boolean }) {
  return (
    <div className="flex h-8 items-end gap-1">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <span
          key={i}
          className={cn(
            "w-1.5 rounded-sm bg-gradient-to-t from-yellow-400 to-red-500",
            active ? "animate-pulse" : "",
          )}
          style={{
            height: active ? `${30 + ((i * 37) % 70)}%` : "15%",
            animationDelay: `${i * 90}ms`,
          }}
        />
      ))}
    </div>
  );
}
