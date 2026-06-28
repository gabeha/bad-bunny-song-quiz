// Pure scoring logic. No DOM/Node/Deno APIs so it runs in the browser,
// in vitest, and inside a Supabase (Deno) edge function unchanged.

export interface QuestionResult {
  /** Whether the player picked the correct option. */
  correct: boolean;
  /** Milliseconds from the first play of the snippet to locking in an answer. */
  msToAnswer: number;
  /** How many times the player replayed the snippet (informational). */
  replays: number;
}

export interface ScoringConfig {
  /** Points awarded for a correct answer, before the speed bonus. */
  basePoints: number;
  /** Maximum speed bonus, awarded for an instant correct answer. */
  maxSpeedBonus: number;
  /** Window over which the speed bonus decays linearly to zero (ms). */
  speedWindowMs: number;
}

export const DEFAULT_SCORING: ScoringConfig = {
  basePoints: 100,
  maxSpeedBonus: 100,
  speedWindowMs: 15000,
};

export interface ScoreBreakdownItem {
  base: number;
  speedBonus: number;
  total: number;
}

export interface ScoreResult {
  total: number;
  items: ScoreBreakdownItem[];
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

export function scoreQuestion(
  result: QuestionResult,
  config: ScoringConfig = DEFAULT_SCORING,
): ScoreBreakdownItem {
  if (!result.correct) {
    return { base: 0, speedBonus: 0, total: 0 };
  }
  const base = config.basePoints;
  const elapsed = clamp(result.msToAnswer, 0, config.speedWindowMs);
  const speedBonus = Math.round(
    config.maxSpeedBonus * (1 - elapsed / config.speedWindowMs),
  );
  return { base, speedBonus, total: base + speedBonus };
}

export function scoreRound(
  results: QuestionResult[],
  config: ScoringConfig = DEFAULT_SCORING,
): ScoreResult {
  const items = results.map((r) => scoreQuestion(r, config));
  const total = items.reduce((sum, item) => sum + item.total, 0);
  return { total, items };
}
