import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { generateRound, type SongRef } from "./roundGenerator.ts";
import { corsHeaders, jsonResponse } from "./cors.ts";

const QUESTION_COUNT = 10;
const OPTION_COUNT = 4;

interface SongRow {
  id: string;
  title: string;
  snippet_key: string;
}

// Public play: this function intentionally does not require a JWT. It is
// server-authoritative — the correct answers live only in the rounds row.
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const anonId = typeof body?.anonId === "string" ? body.anonId : null;

    const { data: songs, error } = await admin
      .from("songs")
      .select("id, title, snippet_key")
      .eq("active", true);
    if (error) throw error;
    if (!songs || songs.length < OPTION_COUNT) {
      return jsonResponse({ error: "Not enough songs to build a round" }, 400);
    }

    const rows = songs as SongRow[];
    const pool: SongRef[] = rows.map((s) => ({ id: s.id, title: s.title }));
    const byId = new Map(rows.map((s) => [s.id, s]));
    const questionCount = Math.min(QUESTION_COUNT, rows.length);

    const generated = generateRound(pool, {
      questionCount,
      optionCount: OPTION_COUNT,
      rng: Math.random,
    });

    // Server-held question key (never sent to the client).
    const stored = generated.map((q) => {
      const correct = byId.get(q.songId)!;
      return {
        songId: q.songId,
        correctIndex: q.correctIndex,
        correctTitle: correct.title,
        optionTitles: q.optionSongIds.map((id) => byId.get(id)!.title),
        snippetKey: correct.snippet_key,
      };
    });

    const { data: round, error: insErr } = await admin
      .from("rounds")
      .insert({ anon_id: anonId, questions: stored, status: "active" })
      .select("id")
      .single();
    if (insErr) throw insErr;

    // Client payload: snippet URL + option labels only. No ids, no answer key.
    const publicBase = `${supabaseUrl}/storage/v1/object/public/snippets`;
    const questions = stored.map((q) => ({
      snippetUrl: `${publicBase}/${q.snippetKey}`,
      options: q.optionTitles,
    }));

    return jsonResponse({ roundId: round.id, questions });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return jsonResponse({ error: message }, 500);
  }
});
