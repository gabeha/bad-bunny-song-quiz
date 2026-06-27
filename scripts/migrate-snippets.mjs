// One-time migration: cut the curated ad-lib snippet from each full MP3 and
// upload the tiny clip to the public `snippets` Supabase Storage bucket, keyed
// by an opaque UUID (so the answer can't be read from the URL). Writes
// scripts/seed.json describing the rows to insert into public.songs.
//
// Usage: node scripts/migrate-snippets.mjs
//
// Requires: ffmpeg on PATH, VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in .env.local,
// and a TEMPORARY storage insert policy allowing anon uploads to the `snippets` bucket.

import { createClient } from "@supabase/supabase-js";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import crypto from "node:crypto";

const execFileAsync = promisify(execFile);

function loadEnv() {
  const env = {};
  const raw = readFileSync(".env.local", "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = loadEnv();
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

const songs = JSON.parse(readFileSync("public/songs.json", "utf8"));
const work = await mkdtemp(path.join(tmpdir(), "bbq-"));
const rows = [];

for (const song of songs) {
  const id = crypto.randomUUID();
  const input = path.join("public", "audio", `${song.title}.mp3`);
  const clipLen = Number((song.end - song.start).toFixed(3));
  const out = path.join(work, `${id}.mp3`);

  // Re-encode the [start, end] window into a clean, tiny standalone clip.
  await execFileAsync("ffmpeg", [
    "-y",
    "-ss", String(song.start),
    "-i", input,
    "-t", String(clipLen),
    "-ac", "2",
    "-b:a", "128k",
    "-f", "mp3",
    out,
  ]);

  const data = await readFile(out);
  const key = `${id}.mp3`;
  const { error } = await supabase.storage
    .from("snippets")
    .upload(key, data, { contentType: "audio/mpeg", upsert: true });
  if (error) {
    console.error(`Upload failed for ${song.title}:`, error.message);
    process.exit(1);
  }

  rows.push({
    id,
    title: song.title,
    artist: song.artist,
    album: song.album ?? null,
    spotify_url: null,
    youtube_url: song.url ?? null,
    snippet_start: 0,
    snippet_end: clipLen,
    duration: song.duration ?? null,
    snippet_key: key,
  });
  console.log(`✓ ${song.title}  (clip ${clipLen}s -> ${key})`);
}

await writeFile("scripts/seed.json", JSON.stringify(rows, null, 2));
await rm(work, { recursive: true, force: true });
console.log(`\nDone. ${rows.length} snippets uploaded. Wrote scripts/seed.json`);
