import React, { useRef, useEffect } from "react";

interface AudioVisualiserProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  audioContext: AudioContext | null;
  sourceNode: MediaElementAudioSourceNode | null;
}

const AudioVisualiser = ({
  audioRef,
  audioContext,
  sourceNode,
}: AudioVisualiserProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzer = useRef<AnalyserNode | null>(null);
  let animationController: number | null;

  useEffect(() => {
    if (audioContext && sourceNode && !analyzer.current) {
      analyzer.current = audioContext.createAnalyser();
      sourceNode.connect(analyzer.current);
      analyzer.current.connect(audioContext.destination);
    }

    const handlePlay = () => {
      if (!animationController) {
        visualizeData();
      }
    };

    const handlePause = () => {
      if (animationController) {
        cancelAnimationFrame(animationController);
        animationController = null;
      }
    };

    audioRef.current?.addEventListener("play", handlePlay);
    audioRef.current?.addEventListener("pause", handlePause);

    return () => {
      if (animationController) {
        cancelAnimationFrame(animationController);
      }
      audioRef.current?.removeEventListener("play", handlePlay);
      audioRef.current?.removeEventListener("pause", handlePause);
    };
  }, [audioContext, sourceNode]);

  const visualizeData = () => {
    if (!analyzer.current || !canvasRef.current) return;

    animationController = requestAnimationFrame(visualizeData);

    const songData = new Uint8Array(analyzer.current.frequencyBinCount);
    analyzer.current.getByteFrequencyData(songData);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const devicePixelRatio = window.devicePixelRatio || 1;
      const width = canvas.clientWidth * devicePixelRatio;
      const height = canvas.clientHeight * devicePixelRatio;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      const smoothedData = [];
      const segmentSizeNumber = 128;
      const segmentSize = Math.floor(songData.length / segmentSizeNumber); // Average over 64 segments
      for (let i = 0; i < segmentSizeNumber; i++) {
        const segmentStart = i * segmentSize;
        const segmentEnd = segmentStart + segmentSize;
        const segment = songData.slice(segmentStart, segmentEnd);
        const avg = segment.reduce((sum, val) => sum + val, 0) / segment.length;
        smoothedData.push(avg);
      }

      const movingAverage = smoothedData.map((val, idx, arr) => {
        const prevVal = idx > 0 ? arr[idx - 1] : val;
        const nextVal = idx < arr.length - 1 ? arr[idx + 1] : val;
        return (prevVal + val + nextVal) / 3;
      });

      ctx.beginPath();
      ctx.moveTo(0, height / 2);

      movingAverage.forEach((value, i) => {
        const x = (i / movingAverage.length) * width * 1.5;
        const y = height / 2 - (value / 255) * (height / 2); // Baseline at the middle of the canvas
        ctx.lineTo(x, y);
        ctx.lineTo(x, height - y);
      });

      ctx.strokeStyle = "rgba(0, 128, 255, 1)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  return <canvas ref={canvasRef} className="w-full h-full min-h-96 bg-black" />;
};

export default AudioVisualiser;
