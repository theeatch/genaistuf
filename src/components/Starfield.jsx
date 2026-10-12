import React, { useEffect, useRef } from "react";

const COUNT = 260;

/**
 * Canvas starfield with parallax. `stateRef.current` is { x, z, speed },
 * written every frame by App. Stars streak horizontally when travelling.
 */
export default function Starfield({ stateRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let raf;
    let frameNo = 0;

    const stars = Array.from({ length: COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      d: 0.15 + Math.random() * 0.85, // depth: 1 = closest
      tw: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (t) => {
      raf = requestAnimationFrame(draw);
      const { x: camX, z, speed } = stateRef.current;
      ctx.clearRect(0, 0, w, h);
      if (z > 4) return; // fully covered by the planet
      frameNo++;
      if (speed === 0 && frameNo % 3) return; // idle twinkle at a third of the rate
      const camPx = (camX * w) / 100;
      const zoom = 1 + (z - 1) * 0.06;
      const cx = w / 2;
      const cy = h / 2;
      const streak = Math.min(speed * 160, 260);

      for (const s of stars) {
        const px = (((s.x * w - camPx * s.d * 0.5) % w) + w) % w;
        const sx = cx + (px - cx) * zoom;
        const sy = cy + (s.y * h - cy) * zoom;
        const tw = 0.6 + 0.4 * Math.sin(t / 700 + s.tw);
        ctx.globalAlpha = (0.25 + s.d * 0.75) * tw;
        ctx.fillStyle = s.d > 0.8 ? "#cfe3ff" : "#ffffff";
        const size = 0.4 + s.d * 1.6;
        if (streak > 4) {
          ctx.fillRect(sx - streak * s.d, sy, streak * s.d, size);
        } else {
          ctx.fillRect(sx, sy, size * 1.4, size * 1.4);
        }
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [stateRef]);

  return <canvas ref={canvasRef} className="starfield" />;
}
