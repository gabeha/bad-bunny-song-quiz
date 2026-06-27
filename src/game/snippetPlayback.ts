// Pure state machine for snippet playback. The audio element is the side-effecting
// shell; this reducer owns the logic: bounding playback to [startSec, endSec],
// counting replays, and capturing time-to-first-answer. Fully unit-testable.

export interface SnippetBounds {
  startSec: number;
  endSec: number;
}

export type PlaybackStatus = "idle" | "playing" | "paused" | "ended";

export interface PlaybackState {
  status: PlaybackStatus;
  currentSec: number;
  /** Number of times the snippet was replayed after it finished. */
  replays: number;
  /** Wall-clock ms timestamp of the very first play (start of the answer clock). */
  firstPlayAtMs: number | null;
  /** Wall-clock ms timestamp when an answer was locked in. */
  answeredAtMs: number | null;
}

export type PlaybackAction =
  | { type: "PLAY"; atMs: number }
  | { type: "PAUSE" }
  | { type: "TICK"; currentSec: number }
  | { type: "ANSWER"; atMs: number };

export function initPlayback(bounds: SnippetBounds): PlaybackState {
  return {
    status: "idle",
    currentSec: bounds.startSec,
    replays: 0,
    firstPlayAtMs: null,
    answeredAtMs: null,
  };
}

export function playbackReducer(
  state: PlaybackState,
  action: PlaybackAction,
  bounds: SnippetBounds,
): PlaybackState {
  switch (action.type) {
    case "PLAY": {
      if (state.status === "playing") return state;
      const isReplay = state.status === "ended";
      return {
        ...state,
        status: "playing",
        currentSec: isReplay ? bounds.startSec : state.currentSec,
        replays: isReplay ? state.replays + 1 : state.replays,
        firstPlayAtMs: state.firstPlayAtMs ?? action.atMs,
      };
    }
    case "PAUSE": {
      if (state.status !== "playing") return state;
      return { ...state, status: "paused" };
    }
    case "TICK": {
      if (action.currentSec >= bounds.endSec) {
        return { ...state, status: "ended", currentSec: bounds.endSec };
      }
      const clamped = Math.max(bounds.startSec, action.currentSec);
      return { ...state, currentSec: clamped };
    }
    case "ANSWER": {
      if (state.answeredAtMs !== null) return state;
      return { ...state, answeredAtMs: action.atMs };
    }
    default:
      return state;
  }
}

/** Milliseconds from first play to answer, or null if not yet answered/played. */
export function timeToAnswerMs(state: PlaybackState): number | null {
  if (state.answeredAtMs === null || state.firstPlayAtMs === null) return null;
  return Math.max(0, state.answeredAtMs - state.firstPlayAtMs);
}
