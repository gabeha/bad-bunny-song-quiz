import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import WindowWrapper from "@/components/window-wrapper.tsx";
import QuestionView from "@/components/question-view.tsx";
import ResultsView from "@/components/results-view.tsx";
import {
  startRound,
  submitRound,
  type AnswerInput,
  type StartRoundResponse,
  type SubmitRoundResponse,
} from "@/lib/api.ts";

type Phase = "loading" | "playing" | "submitting" | "results" | "error";

export default function Quiz() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [round, setRound] = useState<StartRoundResponse | null>(null);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<SubmitRoundResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const answersRef = useRef<AnswerInput[]>([]);

  const loadRound = useCallback(async () => {
    setPhase("loading");
    setRound(null);
    setResult(null);
    setIndex(0);
    answersRef.current = [];
    try {
      const data = await startRound();
      setRound(data);
      setPhase("playing");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to start the quiz.");
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    void loadRound();
  }, [loadRound]);

  const handleAnswer = useCallback(
    async (answer: AnswerInput) => {
      if (!round) return;
      answersRef.current = [...answersRef.current, answer];

      if (answersRef.current.length < round.questions.length) {
        setIndex((i) => i + 1);
        return;
      }

      setPhase("submitting");
      try {
        const res = await submitRound(round.roundId, answersRef.current);
        setResult(res);
        setPhase("results");
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : "Failed to submit.");
        setPhase("error");
      }
    },
    [round],
  );

  return (
    <div className="flex flex-1 flex-col">
      <WindowWrapper
        title="🐰 The Ultimate Yeh-Yeh-Yeh Quiz"
        className="flex-1"
        contentClassName="flex-1"
      >
        {phase === "loading" && (
          <Centered>
            <p className="text-lg font-bold text-gray-700">Loading round…</p>
          </Centered>
        )}

        {phase === "error" && (
          <Centered>
            <p className="text-lg font-bold text-red-600">{errorMsg}</p>
            <button
              type="button"
              onClick={() => void loadRound()}
              className="border-r-4 border-b-4 border-l-4 border-t-4 border-r-gray-500 border-b-gray-500 border-l-white border-t-white bg-gray-300 px-6 py-2 font-bold text-gray-900"
            >
              Try again
            </button>
          </Centered>
        )}

        {phase === "playing" && round && (
          <QuestionView
            key={index}
            question={round.questions[index]}
            index={index}
            total={round.questions.length}
            onAnswer={handleAnswer}
          />
        )}

        {phase === "submitting" && (
          <Centered>
            <p className="text-lg font-bold text-gray-700">Scoring…</p>
          </Centered>
        )}

        {phase === "results" && result && round && (
          <ResultsView
            roundId={round.roundId}
            result={result}
            onPlayAgain={() => void loadRound()}
          />
        )}
      </WindowWrapper>

      <div className="mt-3 text-center">
        <Link to="/" className="text-sm font-semibold text-white/80 underline">
          ← Back home
        </Link>
      </div>
    </div>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-gray-100 p-10">
      {children}
    </div>
  );
}
