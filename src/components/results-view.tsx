import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { submitScore, type SubmitRoundResponse } from "@/lib/api.ts";
import { useAuth } from "@/lib/auth.tsx";
import SignInModal from "@/components/sign-in-modal.tsx";

interface ResultsViewProps {
  roundId: string;
  result: SubmitRoundResponse;
  onPlayAgain: () => void;
}

type SubmitState = "idle" | "submitting" | "done" | "error";

export default function ResultsView({
  roundId,
  result,
  onPlayAgain,
}: ResultsViewProps) {
  const { user } = useAuth();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [signInOpen, setSignInOpen] = useState(false);
  const wantsSubmit = useRef(false);

  const correctCount = result.perQuestion.filter((q) => q.correct).length;
  const total = result.perQuestion.length;

  const doSubmit = async () => {
    setSubmitState("submitting");
    setErrorMsg("");
    try {
      await submitScore(roundId);
      setSubmitState("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to submit.");
      setSubmitState("error");
    }
  };

  const handleSubmitClick = () => {
    if (!user) {
      wantsSubmit.current = true;
      setSignInOpen(true);
      return;
    }
    void doSubmit();
  };

  // After signing in (triggered from the submit button), auto-post the score.
  useEffect(() => {
    if (user && wantsSubmit.current && submitState === "idle") {
      wantsSubmit.current = false;
      setSignInOpen(false);
      void doSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="flex flex-1 flex-col gap-5 bg-gray-100 p-4 sm:p-6">
      <div className="flex flex-col items-center gap-1 py-2 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
          Your Score
        </p>
        <p className="bg-gradient-to-r from-red-500 via-yellow-400 to-purple-600 bg-clip-text text-6xl font-black text-transparent">
          {result.total}
        </p>
        <p className="text-base font-semibold text-gray-600">
          {correctCount} / {total} correct
        </p>
      </div>

      <ol className="flex flex-col gap-2">
        {result.perQuestion.map((q, i) => {
          const yourPick =
            q.chosenIndex !== null ? q.options[q.chosenIndex] : "No answer";
          return (
            <li
              key={i}
              className="flex items-center justify-between gap-3 border-2 border-gray-300 bg-white px-3 py-2"
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white",
                  q.correct ? "bg-green-600" : "bg-red-500",
                )}
              >
                {q.correct ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  <X className="h-4 w-4" strokeWidth={3} />
                )}
              </span>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-bold text-gray-900">
                  {q.correctTitle}
                </span>
                {!q.correct && (
                  <span className="text-xs text-gray-500">
                    You picked: {yourPick}
                  </span>
                )}
              </div>
              <span className="shrink-0 text-sm font-bold text-gray-700">
                +{q.points}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onPlayAgain}
          className="border-r-4 border-b-4 border-l-4 border-t-4 border-r-gray-500 border-b-gray-500 border-l-white border-t-white bg-gray-300 px-6 py-3 text-lg font-bold text-gray-900 transition-transform hover:scale-[0.98] active:scale-95"
        >
          Play Again
        </button>

        {submitState === "done" ? (
          <Link
            to="/leaderboard"
            className="border-r-4 border-b-4 border-l-4 border-t-4 border-r-gray-500 border-b-gray-500 border-l-white border-t-white bg-green-200 px-6 py-3 text-center text-sm font-bold text-green-900"
          >
            ✓ Posted! View the leaderboard →
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleSubmitClick}
            disabled={submitState === "submitting"}
            className="border-r-4 border-b-4 border-l-4 border-t-4 border-r-gray-500 border-b-gray-500 border-l-white border-t-white bg-gray-300 px-6 py-3 text-sm font-bold text-gray-900 transition-transform hover:scale-[0.98] active:scale-95 disabled:opacity-60"
          >
            {submitState === "submitting"
              ? "Submitting…"
              : "Submit to leaderboard"}
          </button>
        )}

        {submitState === "error" && (
          <p className="text-center text-xs font-semibold text-red-600">
            {errorMsg}
          </p>
        )}
      </div>

      <SignInModal
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        title="Sign in to post your score"
      />
    </div>
  );
}
