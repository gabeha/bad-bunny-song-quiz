import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import WindowWrapper from "@/components/window-wrapper.tsx";
import { useAuth } from "@/lib/auth.tsx";
import { fetchCollection, type CollectionItem } from "@/lib/api.ts";
import { cn } from "@/lib/utils.ts";

export default function Collection() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    fetchCollection()
      .then((data) => active && setItems(data))
      .catch((e) =>
        active && setError(e instanceof Error ? e.message : "Failed to load."),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const togglePlay = (idx: number, url: string | null) => {
    const audio = audioRef.current;
    if (!audio || !url) return;
    if (playingIdx === idx && !audio.paused) {
      audio.pause();
      setPlayingIdx(null);
      return;
    }
    audio.src = url;
    void audio.play();
    setPlayingIdx(idx);
  };

  return (
    <div className="flex flex-1 flex-col">
      <WindowWrapper title="🎵 Your Collection" className="flex-1" contentClassName="flex-1">
        <div className="flex flex-1 flex-col gap-4 bg-gray-100 p-4 sm:p-6">
          {!authLoading && !user && (
            <p className="py-8 text-center text-sm font-semibold text-gray-600">
              Sign in to see the full songs you&apos;ve unlocked by guessing
              correctly.
            </p>
          )}

          {user && loading && (
            <p className="py-8 text-center text-sm font-bold text-gray-500">
              Loading your collection…
            </p>
          )}
          {user && error && (
            <p className="py-8 text-center text-sm font-bold text-red-600">
              {error}
            </p>
          )}
          {user && !loading && !error && items.length === 0 && (
            <p className="py-8 text-center text-sm font-semibold text-gray-600">
              No unlocks yet. Guess songs correctly in the quiz to add the full
              tracks here!
            </p>
          )}

          {user && items.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {items.map((item, i) => {
                const isPlaying = playingIdx === i;
                return (
                  <li
                    key={`${item.title}-${i}`}
                    className="flex items-center gap-3 border-2 border-gray-300 bg-white px-3 py-2"
                  >
                    <button
                      type="button"
                      onClick={() => togglePlay(i, item.fullUrl)}
                      disabled={!item.fullUrl}
                      aria-label={isPlaying ? "Pause" : "Play"}
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        item.fullUrl
                          ? "bg-gray-800 text-white"
                          : "cursor-not-allowed bg-gray-300 text-gray-400",
                      )}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4 fill-current" />
                      ) : (
                        <Play className="h-4 w-4 fill-current" />
                      )}
                    </button>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-bold text-gray-900">
                        {item.title}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.artist}
                      </span>
                    </div>
                    {item.spotifyUrl && (
                      <a
                        href={item.spotifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 text-xs font-semibold text-green-700 underline"
                      >
                        Spotify
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <audio ref={audioRef} onEnded={() => setPlayingIdx(null)} hidden />
        </div>
      </WindowWrapper>
    </div>
  );
}
