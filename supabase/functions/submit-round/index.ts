import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { scoreRound, type QuestionResult } from "./scoring.ts";
import { corsHeaders, jsonResponse } from "./cors.ts";

interface StoredQuestion {
  songId: string;
  correctIndex: number;
  correctTitle: string;
  optionTitles: string[];
  snippetKey: string;
}

interface SubmittedAnswer {
  chosenIndex: number | null;
  msToAnswer: number;
  replays: number;
}

// Server-authoritative scoring. The client sends its choices + timing; the
// correct answers are read from the round row, never trusted from the client.
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => null);
    const roundId = body?.roundId;
    const answers = body?.answers;
    if (!roundId || !Array.isArray(answers)) {
      return jsonResponse({ error: "Bad request" }, 400);
    }

    const { data: round, error } = await admin
      .from("rounds")
      .select("id, status, questions")
      .eq("id", roundId)
      .single();
    if (error || !round) return jsonResponse({ error: "Round not found" }, 404);
    if (round.status !== "active") {
      return jsonResponse({ error: "Round already submitted" }, 409);
    }

    const questions = round.questions as StoredQuestion[];

    const results: QuestionResult[] = questions.map((q, i) => {
      const a = (answers[i] ?? {}) as Partial<SubmittedAnswer>;
      const chosenIndex = typeof a.chosenIndex === "number" ? a.chosenIndex : -1;
      return {
        correct: chosenIndex === q.correctIndex,
        msToAnswer: Math.max(0, Number(a.msToAnswer) || 0),
        replays: Math.max(0, Number(a.replays) || 0),
      };
    });

    const score = scoreRound(results);

    const perQuestion = questions.map((q, i) => {
      const a = answers[i] ?? {};
      return {
        correct: results[i].correct,
        correctIndex: q.correctIndex,
        correctTitle: q.correctTitle,
        chosenIndex: typeof a.chosenIndex === "number" ? a.chosenIndex : null,
        options: q.optionTitles,
        points: score.items[i].total,
      };
    });

    await admin
      .from("rounds")
      .update({
        status: "submitted",
        total_score: score.total,
        breakdown: score.items,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", roundId);

    return jsonResponse({ total: score.total, items: score.items, perQuestion });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return jsonResponse({ error: message }, 500);
  }
});
