import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import WindowWrapper from "@/components/window-wrapper.tsx";
import { useAuth } from "@/lib/auth.tsx";
import { supabase } from "@/lib/supabase.ts";
import { cutSnippet } from "@/lib/audio-cut.ts";
import { formatTime } from "@/lib/utils.ts";

type Status = "idle" | "working" | "done" | "error";

const inputClass =
  "border-2 border-r-gray-300 border-b-gray-300 border-l-gray-500 border-t-gray-500 bg-white px-3 py-2 text-sm text-gray-900 outline-none w-full";
const btnClass =
  "border-r-4 border-b-4 border-l-4 border-t-4 border-r-gray-500 border-b-gray-500 border-l-white border-t-white bg-gray-300 px-4 py-2 text-sm font-bold text-gray-900 transition-transform hover:scale-[0.98] active:scale-95 disabled:opacity-60";

export default function Admin() {
  const { isAdmin, loading } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(8);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("Bad Bunny");
  const [album, setAlbum] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (loading) {
    return <Shell>Checking access…</Shell>;
  }
  if (!isAdmin) {
    return (
      <Shell>
        <p className="font-bold text-gray-700">
          You don&apos;t have access to this page.
        </p>
        <Link to="/" className="text-blue-600 underline">
          Go home
        </Link>
      </Shell>
    );
  }

  const previewSnippet = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = start;
    void audio.play();
    const stop = () => {
      if (audio.currentTime >= end) {
        audio.pause();
        audio.removeEventListener("timeupdate", stop);
      }
    };
    audio.addEventListener("timeupdate", stop);
  };

  const reset = () => {
    setFile(null);
    setFileUrl("");
    setDuration(0);
    setStart(0);
    setEnd(8);
    setTitle("");
    setAlbum("");
    setSpotifyUrl("");
    setYoutubeUrl("");
  };

  const submit = async () => {
    if (!file || !title.trim() || !artist.trim() || end <= start) {
      setStatus("error");
      setMessage("Pick a file, set title/artist, and a valid in/out range.");
      return;
    }
    setStatus("working");
    const id = crypto.randomUUID();
    // Storage keys are random and independent of the song id, so the snippet
    // URL never reveals which song it is.
    const snippetKey = `${crypto.randomUUID()}.mp3`;
    const fullKey = `${crypto.randomUUID()}.mp3`;

    try {
      setMessage("Cutting snippet…");
      const snippet = await cutSnippet(file, start, end);

      setMessage("Uploading snippet clip…");
      const up1 = await supabase.storage
        .from("snippets")
        .upload(snippetKey, snippet, { contentType: "audio/mpeg" });
      if (up1.error) throw up1.error;

      setMessage("Uploading full song…");
      const up2 = await supabase.storage
        .from("songs")
        .upload(fullKey, file, {
          contentType: file.type || "audio/mpeg",
        });
      if (up2.error) throw up2.error;

      setMessage("Saving song…");
      const ins = await supabase.from("songs").insert({
        id,
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim() || null,
        spotify_url: spotifyUrl.trim() || null,
        youtube_url: youtubeUrl.trim() || null,
        snippet_start: 0,
        snippet_end: Number((end - start).toFixed(3)),
        duration: Math.round(duration),
        snippet_key: snippetKey,
        full_key: fullKey,
      });
      if (ins.error) throw ins.error;

      setStatus("done");
      setMessage(`Added "${title.trim()}" to the quiz pool.`);
      reset();
    } catch (e) {
      // Best-effort cleanup of any uploaded objects on failure.
      await supabase.storage.from("snippets").remove([snippetKey]);
      await supabase.storage.from("songs").remove([fullKey]);
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Failed to add song.");
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <WindowWrapper title="🛠️ Admin — Add a Song" className="flex-1" contentClassName="flex-1">
        <div className="flex flex-1 flex-col gap-4 bg-gray-100 p-4 sm:p-6">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase text-gray-500">
              Source audio (full MP3)
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>

          {fileUrl && (
            <div className="flex flex-col gap-3 border-2 border-gray-300 bg-white p-3">
              <audio
                ref={audioRef}
                src={fileUrl}
                controls
                className="w-full"
                onLoadedMetadata={(e) => {
                  const d = e.currentTarget.duration;
                  setDuration(d);
                  setEnd(Math.min(8, Math.round(d)));
                }}
              />
              <p className="text-xs font-semibold text-gray-500">
                Full duration: {formatTime(duration)} — scrub the player to find
                the ad-lib, then set the in/out points below.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-xs font-bold uppercase text-gray-500">
                  In (sec)
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    max={duration}
                    value={start}
                    onChange={(e) => setStart(Number(e.target.value))}
                    className={inputClass}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-bold uppercase text-gray-500">
                  Out (sec)
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    max={duration}
                    value={end}
                    onChange={(e) => setEnd(Number(e.target.value))}
                    className={inputClass}
                  />
                </label>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={previewSnippet} className={btnClass}>
                  ▶ Preview snippet
                </button>
                <span className="text-xs font-semibold text-gray-500">
                  Clip length: {(end - start).toFixed(1)}s
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Title" value={title} onChange={setTitle} />
            <Field label="Artist" value={artist} onChange={setArtist} />
            <Field label="Album" value={album} onChange={setAlbum} />
            <Field
              label="Spotify URL"
              value={spotifyUrl}
              onChange={setSpotifyUrl}
            />
            <Field
              label="YouTube URL"
              value={youtubeUrl}
              onChange={setYoutubeUrl}
            />
          </div>

          <button
            type="button"
            onClick={() => void submit()}
            disabled={status === "working"}
            className={`${btnClass} py-3 text-base`}
          >
            {status === "working" ? "Working…" : "Add song to quiz"}
          </button>

          {message && (
            <p
              className={`text-center text-sm font-semibold ${
                status === "error"
                  ? "text-red-600"
                  : status === "done"
                    ? "text-green-700"
                    : "text-gray-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </WindowWrapper>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-bold uppercase text-gray-500">
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </label>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <WindowWrapper title="🛠️ Admin" className="flex-1" contentClassName="flex-1">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-gray-100 p-10 text-center">
          {children}
        </div>
      </WindowWrapper>
    </div>
  );
}
