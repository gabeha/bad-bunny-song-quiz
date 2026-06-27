import { supabase } from "@/lib/supabase.ts";

export interface QuizQuestion {
  snippetUrl: string;
  options: string[];
}

export interface StartRoundResponse {
  roundId: string;
  questions: QuizQuestion[];
}

export interface AnswerInput {
  chosenIndex: number | null;
  msToAnswer: number;
  replays: number;
}

export interface PerQuestionResult {
  correct: boolean;
  correctIndex: number;
  correctTitle: string;
  chosenIndex: number | null;
  options: string[];
  points: number;
}

export interface SubmitRoundResponse {
  total: number;
  items: { base: number; speedBonus: number; total: number }[];
  perQuestion: PerQuestionResult[];
}

export async function startRound(): Promise<StartRoundResponse> {
  const { data, error } = await supabase.functions.invoke<StartRoundResponse>(
    "start-round",
    { body: {} },
  );
  if (error) throw error;
  if (!data) throw new Error("No round returned");
  return data;
}

export async function submitRound(
  roundId: string,
  answers: AnswerInput[],
): Promise<SubmitRoundResponse> {
  const { data, error } = await supabase.functions.invoke<SubmitRoundResponse>(
    "submit-round",
    { body: { roundId, answers } },
  );
  if (error) throw error;
  if (!data) throw new Error("No result returned");
  return data;
}

export async function submitScore(roundId: string): Promise<void> {
  const { error } = await supabase.functions.invoke("submit-score", {
    body: { roundId },
    headers: await authHeader(),
  });
  if (error) throw error;
}

async function authHeader(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Please sign in.");
  return { Authorization: `Bearer ${session.access_token}` };
}

export async function claimUnlocks(roundId: string): Promise<number> {
  const { data, error } = await supabase.functions.invoke<{ unlocked: number }>(
    "claim-unlocks",
    { body: { roundId }, headers: await authHeader() },
  );
  if (error) throw error;
  return data?.unlocked ?? 0;
}

export interface CollectionItem {
  title: string;
  artist: string;
  album: string | null;
  spotifyUrl: string | null;
  unlockedAt: string;
  fullUrl: string | null;
}

export async function fetchCollection(): Promise<CollectionItem[]> {
  const { data, error } = await supabase.functions.invoke<{
    items: CollectionItem[];
  }>("get-collection", { body: {}, headers: await authHeader() });
  if (error) throw error;
  return data?.items ?? [];
}

export type LeaderboardScope = "alltime" | "weekly";

export interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_score: number;
  created_at: string;
}

export async function fetchLeaderboard(
  scope: LeaderboardScope,
  limit = 100,
): Promise<LeaderboardEntry[]> {
  const view =
    scope === "weekly" ? "leaderboard_weekly" : "leaderboard_alltime";
  const { data, error } = await supabase
    .from(view)
    .select("*")
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as LeaderboardEntry[];
}
