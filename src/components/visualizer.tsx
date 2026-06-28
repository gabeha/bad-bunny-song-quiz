import { useEffect, useRef } from "react";
import { getAnalyser } from "@/lib/audio-viz.ts";

interface VisualizerProps {
  active: boolean;
  className?: string;
  barCount?: number;
}

// Frequency-bar visualizer driven by the shared Web Audio analyser. Animates
// only while `active`; otherwise it paints a calm idle baseline.
export default function Visualizer({
  active,
  className,
  barCount = 32,
}: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = getAnalyser();
    const bins = analyser?.frequencyBinCount ?? barCount;
    const data = new Uint8Array(bins);
    let raf = 0;

    const paint = (heights: (i: number) => number, idle = false) => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      if (idle) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.10)";
      } else {
        const grad = ctx.createLinearGradient(0, h, 0, 0);
        grad.addColorStop(0, "#ef4444");
        grad.addColorStop(0.5, "#facc15");
        grad.addColorStop(1, "#a855f7");
        ctx.fillStyle = grad;
      }

      if (w <= 0 || h <= 0) return;
      const gap = barCount > 1 ? Math.min(3, w / (barCount * 2)) : 0;
      const barW = Math.max(1, (w - gap * (barCount - 1)) / barCount);
      const radius = Math.max(0, Math.min(barW / 2, 3));
      for (let i = 0; i < barCount; i++) {
        const v = Math.max(0.03, Math.min(1, heights(i)));
        const bh = Math.max(2, v * h);
        const x = i * (barW + gap);
        const y = h - bh;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, bh, radius);
        ctx.fill();
      }
    };

    if (!active || !analyser) {
      // Idle baseline (gentle static gray bars).
      paint((i) => 0.06 + (i % 3 === 0 ? 0.05 : 0), true);
      return;
    }

    const step = Math.max(1, Math.floor(bins / barCount));
    const loop = () => {
      raf = requestAnimationFrame(loop);
      analyser.getByteFrequencyData(data);
      paint((i) => data[i * step] / 255);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [active, barCount]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
