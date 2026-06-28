// A single shared AudioContext + analyser for the whole app. Routing every
// <audio> through its own context would quickly hit the browser's context
// limit, so we reuse one and connect each media element to the analyser once.

let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
const connected = new WeakSet<HTMLMediaElement>();

export function getAnalyser(): AnalyserNode | null {
  if (analyser) return analyser;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  analyser = ctx.createAnalyser();
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = 0.82;
  analyser.connect(ctx.destination);
  return analyser;
}

/**
 * Route a media element through the shared analyser (once). The element must be
 * served with CORS (crossOrigin="anonymous") or the graph output is silenced.
 */
export function connectMediaElement(el: HTMLMediaElement): void {
  const node = getAnalyser();
  if (!node || !ctx || connected.has(el)) return;
  try {
    const source = ctx.createMediaElementSource(el);
    source.connect(node);
    connected.add(el);
  } catch {
    // Already connected elsewhere, or unsupported — ignore.
  }
}

export function resumeAudio(): void {
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

// Tracks whether the user has started audio at least once. After that, the
// browser allows programmatic playback, so later questions can auto-play.
let started = false;
export function markAudioStarted(): void {
  started = true;
}
export function hasAudioStarted(): boolean {
  return started;
}
