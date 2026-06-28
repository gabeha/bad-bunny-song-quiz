import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "./cors.ts";

interface StoredQuestion {
  songId: string;
  correctIndex: number;
}
interface BreakdownItem {
  total: number;
}

// Authenticated: unlocks every song the user answered correctly in a round.
// Correctness comes from the server-stored breakdown, never from the client.
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, serviceKey);

    const token = (req.headers.get("Authorization") ?? "").replace(
      /^Bearer\s+/i,
      "",
    );
    if (!token) return jsonResponse({ error: "Not authenticated" }, 401);
    const {
      data: { user },
      error: userErr,
    } = await admin.auth.getUser(token);
    if (userErr || !user) return jsonResponse({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => null);
    const roundId = body?.roundId;
    if (!roundId) return jsonResponse({ error: "Missing roundId" }, 400);

    const { data: round, error } = await admin
      .from("rounds")
      .select("status, questions, breakdown")
      .eq("id", roundId)
      .single();
    if (error || !round) return jsonResponse({ error: "Round not found" }, 404);
    if (round.status !== "submitted" || !round.breakdown) {
      return jsonResponse({ error: "Round not scored yet" }, 409);
    }

    const questions = round.questions as StoredQuestion[];
    const breakdown = round.breakdown as BreakdownItem[];

    const rows = questions
      .filter((_, i) => (breakdown[i]?.total ?? 0) > 0)
      .map((q) => ({ user_id: user.id, song_id: q.songId }));

    if (rows.length > 0) {
      const { error: insErr } = await admin
        .from("unlocks")
        .upsert(rows, { onConflict: "user_id,song_id", ignoreDuplicates: true });
      if (insErr) throw insErr;
    }

    return jsonResponse({ unlocked: rows.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return jsonResponse({ error: message }, 500);
  }
});
