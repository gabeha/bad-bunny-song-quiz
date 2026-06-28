import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Headphones, ListChecks, Zap } from "lucide-react";
import WindowWrapper from "@/components/window-wrapper.tsx";
import { supabase } from "@/lib/supabase.ts";
import { fetchLeaderboard, type LeaderboardEntry } from "@/lib/api.ts";

const STEPS = [
  { icon: Headphones, title: "Listen", desc: "Hear an iconic ad-lib" },
  { icon: ListChecks, title: "Guess", desc: "Pick from four songs" },
  { icon: Zap, title: "Score", desc: "Faster = more points" },
];

export default function Home() {
  const [songCount, setSongCount] = useState<number | null>(null);
  const [top, setTop] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    supabase
      .from("songs_public")
      .select("*", { count: "exact", head: true })
      .then(({ count }) => setSongCount(count ?? null));
    fetchLeaderboard("alltime", 1)
      .then((rows) => setTop(rows[0] ?? null))
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <WindowWrapper title="🐰 The Ultimate Yeh-Yeh-Yeh Quiz" className="w-full">
        <div className="flex flex-col items-center gap-7 bg-gray-100 px-5 py-8 text-center sm:px-10 sm:py-10">
          <div className="flex h-12 items-end gap-1.5" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <span
                key={i}
                className="eq-bar w-2 rounded-full bg-gradient-to-t from-red-500 via-yellow-400 to-purple-600"
                style={{
                  height: "100%",
                  animationDelay: `${(i % 5) * 0.12}s`,
                  animationDuration: `${0.8 + (i % 3) * 0.18}s`,
                }}
              />
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black leading-tight text-gray-900 sm:text-5xl">
              How well do you know
              <br />
              <span className="bg-gradient-to-r from-red-500 via-yellow-400 to-purple-600 bg-clip-text text-transparent">
                Bad Bunny&apos;s Yeh-Yeh-Yehs?
              </span>
            </h1>
            <p className="mx-auto max-w-md text-sm text-gray-600 sm:text-base">
              The ultimate ad-lib guessing game. 10 snippets, one shot each,
              speed counts. Think you&apos;ve got the ear?
            </p>
          </div>

          <Link
            to="/quiz"
            className="border-r-4 border-b-4 border-l-4 border-t-4 border-r-black/30 border-b-black/30 border-l-white/40 border-t-white/40 bg-gradient-to-r from-red-500 via-yellow-400 to-purple-600 px-10 py-3.5 text-xl font-black text-white shadow-lg drop-shadow transition-transform hover:scale-[0.97] active:scale-95"
          >
            ▶ Start Quiz
          </Link>

          <div className="grid w-full max-w-md grid-cols-3 gap-2.5">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="flex flex-col items-center gap-1.5 border-2 border-gray-300 bg-white px-2 py-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-black text-gray-900">
                  {i + 1}. {title}
                </span>
                <span className="text-[10px] leading-tight text-gray-500">
                  {desc}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs font-semibold text-gray-500">
            {songCount !== null && (
              <span>🎵 {songCount} ad-libs to master</span>
            )}
            {top && (
              <span>
                {" "}
                · 🏆 Top score{" "}
                <span className="font-black text-gray-700">
                  {top.total_score}
                </span>{" "}
                by {top.display_name ?? "a legend"}
              </span>
            )}
          </p>
        </div>
      </WindowWrapper>
    </div>
  );
}
