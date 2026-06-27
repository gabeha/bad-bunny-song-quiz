import { describe, it, expect } from "vitest";
import { generateRound, shuffle, type SongRef } from "../roundGenerator.ts";

function makePool(n: number): SongRef[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `song-${i}`,
    title: `Song ${i}`,
  }));
}

/** Deterministic mulberry32 PRNG so tests are reproducible. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("generateRound", () => {
  const pool = makePool(20);

  it("produces exactly questionCount questions", () => {
    const round = generateRound(pool, {
      questionCount: 10,
      optionCount: 4,
      rng: seeded(1),
    });
    expect(round).toHaveLength(10);
  });

  it("gives each question optionCount distinct options including the correct one", () => {
    const round = generateRound(pool, {
      questionCount: 10,
      optionCount: 4,
      rng: seeded(2),
    });
    for (const q of round) {
      expect(q.optionSongIds).toHaveLength(4);
      expect(new Set(q.optionSongIds).size).toBe(4);
      expect(q.optionSongIds).toContain(q.songId);
      expect(q.optionSongIds[q.correctIndex]).toBe(q.songId);
    }
  });

  it("never repeats the same correct song within a round", () => {
    const round = generateRound(pool, {
      questionCount: 10,
      optionCount: 4,
      rng: seeded(3),
    });
    const ids = round.map((q) => q.songId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("is deterministic for a given seed", () => {
    const a = generateRound(pool, {
      questionCount: 10,
      optionCount: 4,
      rng: seeded(42),
    });
    const b = generateRound(pool, {
      questionCount: 10,
      optionCount: 4,
      rng: seeded(42),
    });
    expect(a).toEqual(b);
  });

  it("works when the pool is exactly large enough", () => {
    const small = makePool(4);
    const round = generateRound(small, {
      questionCount: 4,
      optionCount: 4,
      rng: seeded(7),
    });
    expect(round).toHaveLength(4);
    for (const q of round) expect(q.optionSongIds).toHaveLength(4);
  });

  it("throws when there are too few songs for the requested options", () => {
    expect(() =>
      generateRound(makePool(3), {
        questionCount: 3,
        optionCount: 4,
        rng: seeded(1),
      }),
    ).toThrow();
  });
});

describe("shuffle", () => {
  it("preserves the multiset of elements", () => {
    const input = makePool(10);
    const out = shuffle(input, seeded(9));
    expect(out).toHaveLength(input.length);
    expect(new Set(out.map((s) => s.id))).toEqual(
      new Set(input.map((s) => s.id)),
    );
  });

  it("does not mutate the input", () => {
    const input = makePool(5);
    const copy = input.slice();
    shuffle(input, seeded(5));
    expect(input).toEqual(copy);
  });
});
