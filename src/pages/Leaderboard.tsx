import { useEffect, useState } from "react";
import WindowWrapper from "@/components/window-wrapper.tsx";
import { RowsSkeleton } from "@/components/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import {
  fetchLeaderboard,
  type LeaderboardEntry,
  type LeaderboardScope,
} from "@/lib/api.ts";
import { useAuth } from "@/lib/auth.tsx";

const medals = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const { user } = useAuth();
  const [scope, setScope] = useState<LeaderboardScope>("alltime");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchLeaderboard(scope)
      .then((data) => {
        if (active) setEntries(data);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "Failed to load.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [scope]);

  return (
    <div className="flex flex-1 flex-col">
      <WindowWrapper title="🏆 Leaderboard" className="flex-1" contentClassName="flex-1">
        <div className="flex flex-1 flex-col gap-4 bg-gray-100 p-4 sm:p-6">
          <div className="flex gap-2">
            {(["alltime", "weekly"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScope(s)}
                className={cn(
                  "flex-1 border-r-4 border-b-4 border-l-4 border-t-4 px-4 py-2 text-sm font-bold transition-transform active:scale-95",
                  scope === s
                    ? "border-r-gray-300 border-b-gray-300 border-l-gray-600 border-t-gray-600 bg-gray-400 text-white"
                    : "border-r-gray-500 border-b-gray-500 border-l-white border-t-white bg-gray-300 text-gray-900",
                )}
              >
                {s === "alltime" ? "All-time" : "This week"}
              </button>
            ))}
          </div>

          {loading && <RowsSkeleton rows={8} />}
          {error && (
            <p className="py-8 text-center text-sm font-bold text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && entries.length === 0 && (
            <p className="py-8 text-center text-sm font-semibold text-gray-500">
              No scores yet. Be the first to make the board!
            </p>
          )}

          {!loading && !error && entries.length > 0 && (
            <ol className="flex flex-col gap-1.5">
              {entries.map((entry, i) => {
                const isMe = user?.id === entry.user_id;
                return (
                  <li
                    key={entry.user_id}
                    className={cn(
                      "flex items-center gap-3 border-2 px-3 py-2",
                      isMe
                        ? "border-purple-400 bg-purple-50"
                        : "border-gray-300 bg-white",
                    )}
                  >
                    <span className="w-8 shrink-0 text-center text-sm font-black text-gray-700">
                      {medals[i] ?? i + 1}
                    </span>
                    <span className="flex-1 truncate text-sm font-bold text-gray-900">
                      {entry.display_name ?? "Player"}
                      {isMe && (
                        <span className="ml-1 text-xs text-purple-600">
                          (you)
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-sm font-black text-gray-900">
                      {entry.total_score}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </WindowWrapper>
    </div>
  );
}
