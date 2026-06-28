import { useEffect, useRef, useState } from "react";
import { Disc3, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import WindowWrapper from "@/components/window-wrapper.tsx";
import { useAuth } from "@/lib/auth.tsx";
import { fetchCollection, type CollectionItem } from "@/lib/api.ts";
import { supabase } from "@/lib/supabase.ts";
import { connectMediaElement, resumeAudio } from "@/lib/audio-viz.ts";
import Visualizer from "@/components/visualizer.tsx";
import { cn, formatTime } from "@/lib/utils.ts";

export default function Collection() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentIdx, setCurrentIdx] = useState<number | null>(null);
  const [paused, setPaused] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    supabase
      .from("songs_public")
      .select("*", { count: "exact", head: true })
      .then(({ count }) => active && setTotal(count ?? null));
    fetchCollection()
      .then((data) => active && setItems(data))
      .catch(
        (e) => active && setError(e instanceof Error ? e.message : "Failed to load."),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const playableIndexes = items
    .map((it, i) => (it.fullUrl ? i : -1))
    .filter((i) => i >= 0);

  const playIndex = (idx: number) => {
    const audio = audioRef.current;
    const item = items[idx];
    if (!audio || !item?.fullUrl) return;
    connectMediaElement(audio);
    resumeAudio();
    if (currentIdx !== idx) {
      audio.src = item.fullUrl;
      audio.currentTime = 0;
    }
    void audio.play();
    setCurrentIdx(idx);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentIdx === null) {
      if (playableIndexes.length) playIndex(playableIndexes[0]);
      return;
    }
    if (audio.paused) void audio.play();
    else audio.pause();
  };

  const step = (dir: 1 | -1) => {
    if (currentIdx === null || playableIndexes.length === 0) return;
    const pos = playableIndexes.indexOf(currentIdx);
    const next =
      playableIndexes[
        (pos + dir + playableIndexes.length) % playableIndexes.length
      ];
    playIndex(next);
  };

  const onSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audio.currentTime = frac * duration;
  };

  const pct = total && total > 0 ? Math.round((items.length / total) * 100) : 0;
  const current = currentIdx !== null ? items[currentIdx] : null;
  const progress = duration ? (time / duration) * 100 : 0;

  return (
    <div className="flex flex-1 flex-col">
      <WindowWrapper title="🎵 Your Collection" className="flex-1" contentClassName="flex-1">
        <div className="flex flex-1 flex-col gap-4 bg-gray-100 p-4 sm:p-6">
          {!authLoading && !user && (
            <p className="py-10 text-center text-sm font-semibold text-gray-600">
              Sign in to see the full songs you&apos;ve unlocked by guessing
              correctly.
            </p>
          )}

          {user && error && (
            <p className="py-10 text-center text-sm font-bold text-red-600">
              {error}
            </p>
          )}

          {/* Player */}
          {user && !error && (
            <div className="flex flex-col gap-3 border-2 border-gray-700 bg-black p-3 sm:p-4">
              <Visualizer
                active={!paused && current !== null}
                barCount={48}
                className="h-20 w-full sm:h-28"
              />
              <div
                onClick={onSeek}
                className="h-2 w-full cursor-pointer overflow-hidden rounded-full bg-white/15"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-purple-600"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-white/60">
                <span>{formatTime(time)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-bold text-green-400">
                    {current ? current.title : "Select a song to play"}
                  </span>
                  <span className="truncate text-xs text-white/50">
                    {current ? current.artist : "Your unlocked tracks"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous"
                  disabled={!current}
                  className="text-white/80 disabled:opacity-30"
                >
                  <SkipBack className="h-5 w-5 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={paused ? "Play" : "Pause"}
                  className="play-pause-button flex h-12 w-12 items-center justify-center"
                >
                  {paused ? (
                    <Play className="ml-0.5 h-6 w-6 fill-current text-gray-700" />
                  ) : (
                    <Pause className="h-6 w-6 fill-current text-gray-700" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next"
                  disabled={!current}
                  className="text-white/80 disabled:opacity-30"
                >
                  <SkipForward className="h-5 w-5 fill-current" />
                </button>
              </div>
            </div>
          )}

          {/* Progress toward the full catalog */}
          {user && !error && (loading || total !== null) && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-gray-500">
                <span>Songs unlocked</span>
                <span>
                  {items.length}
                  {total !== null ? ` / ${total}` : ""}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full border border-gray-300 bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-purple-600 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          {user && loading && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse border-2 border-gray-200 bg-white">
                  <div className="aspect-square bg-gray-300/70" />
                  <div className="flex flex-col gap-1 p-2">
                    <div className="h-3 w-3/4 rounded bg-gray-300/70" />
                    <div className="h-2 w-1/2 rounded bg-gray-300/70" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {user && !loading && !error && items.length === 0 && (
            <p className="py-10 text-center text-sm font-semibold text-gray-600">
              No unlocks yet. Guess songs correctly in the quiz to add the full
              tracks here!
            </p>
          )}

          {user && items.length > 0 && (
            <div className="flex max-h-[48vh] flex-col gap-1.5 overflow-y-auto pr-1">
              {items.map((item, i) => {
                const isCurrent = currentIdx === i;
                const isPlaying = isCurrent && !paused;
                return (
                  <div
                    key={`${item.title}-${i}`}
                    className={cn(
                      "flex items-center gap-3 border-2 px-3 py-2 transition-colors",
                      isCurrent
                        ? "border-purple-400 bg-purple-50"
                        : "border-gray-300 bg-white",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => (isCurrent ? togglePlay() : playIndex(i))}
                      disabled={!item.fullUrl}
                      aria-label={isPlaying ? "Pause" : `Play ${item.title}`}
                      className={cn(
                        "flex min-w-0 flex-1 items-center gap-3 text-left",
                        !item.fullUrl && "opacity-60",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white",
                          isCurrent
                            ? "bg-gradient-to-br from-red-500 to-purple-600"
                            : "bg-gray-800",
                        )}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4 fill-current" />
                        ) : isCurrent ? (
                          <Disc3 className="h-4 w-4 animate-[spin_3s_linear_infinite]" />
                        ) : (
                          <Play className="ml-0.5 h-4 w-4 fill-current" />
                        )}
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-bold text-gray-900">
                          {item.title}
                        </span>
                        <span className="truncate text-[11px] text-gray-500">
                          {item.artist}
                        </span>
                      </span>
                    </button>
                    {item.spotifyUrl && (
                      <a
                        href={item.spotifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 text-[11px] font-semibold text-green-700 underline"
                      >
                        Spotify ↗
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <audio
            ref={audioRef}
            crossOrigin="anonymous"
            onPlay={() => setPaused(false)}
            onPause={() => setPaused(true)}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onEnded={() => step(1)}
            hidden
          />
        </div>
      </WindowWrapper>
    </div>
  );
}
