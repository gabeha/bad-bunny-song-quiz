// One-shot: re-key every snippet to a random, unguessable storage key (so the
// snippet URL no longer reveals the song id) and upload the full songs for the
// original tracks. Writes scripts/rekey-map.json for a DB update.
//
// Requires a TEMPORARY permissive storage policy on the snippets + songs buckets.

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";

function loadEnv() {
  const env = {};
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = loadEnv();
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const PUBLIC_SNIPPETS = `${env.VITE_SUPABASE_URL}/storage/v1/object/public/snippets`;

// (id, title, current snippet_key) for all songs.
const songs = [
  ["beb94f3d-c5b2-43d4-a50a-bfc76914c875", "Yonaguni"],
  ["1916e02d-f466-43dd-be3d-ed116ed853ce", "Si Estuviésemos Juntos"],
  ["1816218a-c48f-46f8-aac1-725833d4c89c", "BYE ME FUI"],
  ["8e4b490b-fba6-44b8-ba1f-9278acd11b85", "Vete"],
  ["f5cb430b-8702-49dc-bb95-fd831ed72170", "Infeliz"],
  ["18b4f920-b980-4793-bf14-0db7f4730ac7", "ANTES QUE SE ACABE"],
  ["1756a574-f2b4-476a-bb9f-11ec1f1ef81b", "Neverita"],
  ["d3b54855-add4-477d-a27e-a00bf805cfa6", "Efecto"],
  ["a13962ff-dc9f-4927-b742-94ce38d223f5", "Enséñame a Bailar"],
  ["eea94c82-fc72-4e31-8751-8ff0f7573eb3", "Después de la Playa"],
  ["64cec5ba-87a8-485e-821c-f03f88869717", "Me Porto Bonito"],
  ["8458b21c-5af5-496f-be94-9f48bd95a9fb", "Una Vez"],
  ["4b7eedd9-40d8-4e66-b2fc-8f581dd00f5d", "Party"],
  ["c1000f28-eda8-4bb7-a7d1-26c258b6ed6f", "Callaita"],
  ["9761cce2-2e93-4a70-b534-6eff654b11ed", "MIA"],
  ["f8981a42-8e84-4a64-b767-ad007a13a324", "Te Boté - Remix"],
  ["dbbf9473-94e5-4ed9-a60d-d302d189216e", "No Me Conoce - Remix"],
  ["d601e778-e03e-499e-973a-043c95f78fa7", "Moscow Mule"],
  // LA DIFÍCIL: added via admin, no local full file (already has a full song).
  ["b7a2a5c7-b41d-44aa-8fe2-694c19f9253b", "LA DIFÍCIL"],
];

const out = [];

for (const [id, title] of songs) {
  const oldSnippet = `${id}.mp3`;
  const newSnippet = `${crypto.randomUUID()}.mp3`;

  // Copy snippet to a new random key (download the public object, re-upload).
  const res = await fetch(`${PUBLIC_SNIPPETS}/${encodeURIComponent(oldSnippet)}`);
  if (!res.ok) {
    console.error(`! could not fetch snippet for ${title} (${res.status})`);
    process.exit(1);
  }
  const snippetBytes = new Uint8Array(await res.arrayBuffer());
  const s1 = await supabase.storage
    .from("snippets")
    .upload(newSnippet, snippetBytes, { contentType: "audio/mpeg" });
  if (s1.error) {
    console.error(`! snippet upload failed for ${title}:`, s1.error.message);
    process.exit(1);
  }

  // Upload the full song if we have the local source file.
  let newFull = null;
  const localFull = path.join("public", "audio", `${title}.mp3`);
  if (existsSync(localFull)) {
    newFull = `${crypto.randomUUID()}.mp3`;
    const bytes = readFileSync(localFull);
    const s2 = await supabase.storage
      .from("songs")
      .upload(newFull, bytes, { contentType: "audio/mpeg" });
    if (s2.error) {
      console.error(`! full upload failed for ${title}:`, s2.error.message);
      process.exit(1);
    }
  }

  // Remove the old (song-id-named) snippet object.
  await supabase.storage.from("snippets").remove([oldSnippet]);

  out.push({ id, snippet_key: newSnippet, full_key: newFull });
  console.log(`✓ ${title}  snippet -> ${newSnippet}${newFull ? `  full -> ${newFull}` : "  (full kept)"}`);
}

await writeFile("scripts/rekey-map.json", JSON.stringify(out, null, 2));
console.log(`\nDone. Wrote scripts/rekey-map.json (${out.length} songs).`);
