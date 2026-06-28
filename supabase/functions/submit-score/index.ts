import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "./cors.ts";

// Authenticated: promotes an already-scored round onto the leaderboard for the
// signed-in user. The score is read from the stored round, never trusted from
// the client. A round can be promoted at most once (unique constraint).
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const admin = createClient(url, serviceKey);

    // Validate the caller's JWT explicitly (independent of client-session plumbing).
    const token = (req.headers.get("Authorization") ?? "").replace(
      /^Bearer\s+/i,
      "",
    );
    if (!token) return jsonResponse({ error: "Not authenticated" }, 401);
    const {
      data: { user },
      error: userErr,
    } = await admin.auth.getUser(token);
    if (userErr || !user) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }

    const body = await req.json().catch(() => null);
    const roundId = body?.roundId;
    if (!roundId) return jsonResponse({ error: "Missing roundId" }, 400);

    const { data: round, error } = await admin
      .from("rounds")
      .select("id, status, total_score, breakdown")
      .eq("id", roundId)
      .single();
    if (error || !round) return jsonResponse({ error: "Round not found" }, 404);
    if (round.status !== "submitted" || round.total_score === null) {
      return jsonResponse({ error: "Round has not been scored yet" }, 409);
    }

    const { error: insErr } = await admin
      .from("scores")
      .insert({
        user_id: user.id,
        round_id: round.id,
        total_score: round.total_score,
        breakdown: round.breakdown,
      });
    if (insErr && insErr.code !== "23505") {
      // 23505 = unique violation => already posted; treat as idempotent success.
      throw insErr;
    }

    return jsonResponse({ posted: true, totalScore: round.total_score });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return jsonResponse({ error: message }, 500);
  }
});
