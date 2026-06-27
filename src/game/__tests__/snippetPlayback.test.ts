import { describe, it, expect } from "vitest";
import {
  initPlayback,
  playbackReducer,
  timeToAnswerMs,
  type PlaybackState,
  type SnippetBounds,
} from "../snippetPlayback.ts";

const bounds: SnippetBounds = { startSec: 10, endSec: 18 };

function reduce(
  state: PlaybackState,
  actions: Parameters<typeof playbackReducer>[1][],
): PlaybackState {
  return actions.reduce((s, a) => playbackReducer(s, a, bounds), state);
}

describe("snippet playback state machine", () => {
  it("starts idle at the snippet start with no answer clock", () => {
    const s = initPlayback(bounds);
    expect(s.status).toBe("idle");
    expect(s.currentSec).toBe(10);
    expect(s.firstPlayAtMs).toBeNull();
    expect(timeToAnswerMs(s)).toBeNull();
  });

  it("starts the answer clock on first play only", () => {
    let s = playbackReducer(initPlayback(bounds), { type: "PLAY", atMs: 1000 }, bounds);
    expect(s.firstPlayAtMs).toBe(1000);
    // a pause then resume must not move the first-play timestamp
    s = reduce(s, [{ type: "PAUSE" }, { type: "PLAY", atMs: 5000 }]);
    expect(s.firstPlayAtMs).toBe(1000);
  });

  it("ends playback when ticking past the end bound and clamps position", () => {
    let s = playbackReducer(initPlayback(bounds), { type: "PLAY", atMs: 0 }, bounds);
    s = playbackReducer(s, { type: "TICK", currentSec: 18.4 }, bounds);
    expect(s.status).toBe("ended");
    expect(s.currentSec).toBe(18);
  });

  it("keeps position within the lower bound while playing", () => {
    let s = playbackReducer(initPlayback(bounds), { type: "PLAY", atMs: 0 }, bounds);
    s = playbackReducer(s, { type: "TICK", currentSec: 5 }, bounds);
    expect(s.currentSec).toBe(10);
    expect(s.status).toBe("playing");
  });

  it("counts a replay only after the snippet has ended, resetting to start", () => {
    let s = playbackReducer(initPlayback(bounds), { type: "PLAY", atMs: 0 }, bounds);
    s = playbackReducer(s, { type: "TICK", currentSec: 19 }, bounds); // ended
    expect(s.replays).toBe(0);
    s = playbackReducer(s, { type: "PLAY", atMs: 9000 }, bounds); // replay
    expect(s.replays).toBe(1);
    expect(s.currentSec).toBe(10);
    expect(s.status).toBe("playing");
  });

  it("does not count pause/resume as a replay", () => {
    const s = reduce(initPlayback(bounds), [
      { type: "PLAY", atMs: 0 },
      { type: "PAUSE" },
      { type: "PLAY", atMs: 100 },
    ]);
    expect(s.replays).toBe(0);
  });

  it("captures time-to-answer once and ignores later answers", () => {
    let s = playbackReducer(initPlayback(bounds), { type: "PLAY", atMs: 2000 }, bounds);
    s = playbackReducer(s, { type: "ANSWER", atMs: 5000 }, bounds);
    expect(timeToAnswerMs(s)).toBe(3000);
    s = playbackReducer(s, { type: "ANSWER", atMs: 9999 }, bounds);
    expect(timeToAnswerMs(s)).toBe(3000);
  });

  it("treats PLAY while already playing as a no-op", () => {
    const playing = playbackReducer(initPlayback(bounds), { type: "PLAY", atMs: 1 }, bounds);
    const again = playbackReducer(playing, { type: "PLAY", atMs: 999 }, bounds);
    expect(again).toEqual(playing);
  });
});
