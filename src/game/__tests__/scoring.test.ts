import { describe, it, expect } from "vitest";
import {
  scoreQuestion,
  scoreRound,
  DEFAULT_SCORING,
  type QuestionResult,
} from "../scoring.ts";

describe("scoreQuestion", () => {
  it("awards nothing for a wrong answer regardless of speed", () => {
    const r: QuestionResult = { correct: false, msToAnswer: 0, replays: 0 };
    expect(scoreQuestion(r)).toEqual({ base: 0, speedBonus: 0, total: 0 });
  });

  it("awards base + full speed bonus for an instant correct answer", () => {
    const r: QuestionResult = { correct: true, msToAnswer: 0, replays: 0 };
    expect(scoreQuestion(r)).toEqual({
      base: 100,
      speedBonus: 100,
      total: 200,
    });
  });

  it("awards base + zero bonus at the edge of the speed window", () => {
    const r: QuestionResult = {
      correct: true,
      msToAnswer: DEFAULT_SCORING.speedWindowMs,
      replays: 0,
    };
    expect(scoreQuestion(r)).toEqual({ base: 100, speedBonus: 0, total: 100 });
  });

  it("clamps answers slower than the window to zero bonus (never negative)", () => {
    const r: QuestionResult = {
      correct: true,
      msToAnswer: DEFAULT_SCORING.speedWindowMs * 5,
      replays: 3,
    };
    expect(scoreQuestion(r)).toEqual({ base: 100, speedBonus: 0, total: 100 });
  });

  it("decays the bonus linearly (half window => half bonus)", () => {
    const r: QuestionResult = {
      correct: true,
      msToAnswer: DEFAULT_SCORING.speedWindowMs / 2,
      replays: 0,
    };
    expect(scoreQuestion(r).speedBonus).toBe(50);
  });
});

describe("scoreRound", () => {
  it("sums per-question totals and returns a breakdown per question", () => {
    const results: QuestionResult[] = [
      { correct: true, msToAnswer: 0, replays: 0 }, // 200
      { correct: false, msToAnswer: 0, replays: 0 }, // 0
      { correct: true, msToAnswer: 15000, replays: 1 }, // 100
    ];
    const out = scoreRound(results);
    expect(out.items).toHaveLength(3);
    expect(out.total).toBe(300);
  });

  it("scores a perfect instant round at the maximum", () => {
    const results: QuestionResult[] = Array.from({ length: 10 }, () => ({
      correct: true,
      msToAnswer: 0,
      replays: 0,
    }));
    expect(scoreRound(results).total).toBe(2000);
  });

  it("scores an all-wrong round at zero", () => {
    const results: QuestionResult[] = Array.from({ length: 10 }, () => ({
      correct: false,
      msToAnswer: 1234,
      replays: 0,
    }));
    expect(scoreRound(results).total).toBe(0);
  });
});
