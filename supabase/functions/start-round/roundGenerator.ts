// Pure, deterministic (given an injected RNG) round generation.
// Runs unchanged in the browser, vitest, and a Supabase (Deno) edge function.

export interface SongRef {
  id: string;
  title: string;
}

export interface GeneratedQuestion {
  /** The id of the song the snippet actually belongs to (the correct answer). */
  songId: string;
  /** Option song ids in display order; always includes songId exactly once. */
  optionSongIds: string[];
  /** Index into optionSongIds of the correct answer. */
  correctIndex: number;
}

export interface RoundOptions {
  questionCount: number;
  optionCount: number;
  /** Returns a float in [0, 1). Inject Math.random or a seeded RNG. */
  rng: () => number;
}

/** Fisher-Yates shuffle using the injected RNG. Returns a new array. */
export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function generateRound(
  pool: readonly SongRef[],
  options: RoundOptions,
): GeneratedQuestion[] {
  const { questionCount, optionCount, rng } = options;

  if (optionCount < 2) {
    throw new Error("optionCount must be at least 2");
  }
  if (pool.length < questionCount) {
    throw new Error(
      `Not enough songs (${pool.length}) for a ${questionCount}-question round`,
    );
  }
  if (pool.length < optionCount) {
    throw new Error(
      `Not enough songs (${pool.length}) to build ${optionCount} options`,
    );
  }

  const correctSongs = shuffle(pool, rng).slice(0, questionCount);

  return correctSongs.map((correct) => {
    const distractors = shuffle(
      pool.filter((s) => s.id !== correct.id),
      rng,
    ).slice(0, optionCount - 1);

    const options = shuffle([correct, ...distractors], rng);
    const correctIndex = options.findIndex((s) => s.id === correct.id);

    return {
      songId: correct.id,
      optionSongIds: options.map((s) => s.id),
      correctIndex,
    };
  });
}
