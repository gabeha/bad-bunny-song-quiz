import { Mp3Encoder } from "@breezystack/lamejs";

function floatToInt16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

/**
 * Decode an audio file in the browser, slice the [startSec, endSec] window, and
 * encode it to a small standalone MP3 — no wasm/worker, just Web Audio + lamejs.
 */
export async function cutSnippet(
  file: File,
  startSec: number,
  endSec: number,
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const ctx = new AudioCtx();
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  } finally {
    void ctx.close();
  }

  const sampleRate = audioBuffer.sampleRate;
  const channels = Math.min(2, audioBuffer.numberOfChannels);
  const startSample = Math.max(0, Math.floor(startSec * sampleRate));
  const endSample = Math.min(
    audioBuffer.length,
    Math.floor(endSec * sampleRate),
  );

  const left = floatToInt16(
    audioBuffer.getChannelData(0).subarray(startSample, endSample),
  );
  const right =
    channels > 1
      ? floatToInt16(
          audioBuffer.getChannelData(1).subarray(startSample, endSample),
        )
      : null;

  const encoder = new Mp3Encoder(channels, sampleRate, 128);
  const blockSize = 1152;
  const chunks: Uint8Array[] = [];

  for (let i = 0; i < left.length; i += blockSize) {
    const leftChunk = left.subarray(i, i + blockSize);
    const buf =
      right !== null
        ? encoder.encodeBuffer(leftChunk, right.subarray(i, i + blockSize))
        : encoder.encodeBuffer(leftChunk);
    if (buf.length > 0) chunks.push(new Uint8Array(buf));
  }
  const tail = encoder.flush();
  if (tail.length > 0) chunks.push(new Uint8Array(tail));

  return new Blob(chunks as BlobPart[], { type: "audio/mpeg" });
}
