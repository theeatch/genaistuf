import React, { useEffect, useRef, useState } from "react";
import { projects } from "../projects.js";

const R = 90;
const C = 2 * Math.PI * R;
const MIN_MS = 2600;

/**
 * Space shuttle loader: the shuttle circles a ring (rocking left and right as it flies)
 * and leaves a glowing trail; the ring completes when assets are ready.
 */
export default function Loader({ onDone }) {
  const arcRef = useRef(null);
  const shipRef = useRef(null);
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState("loading"); // loading -> leaving -> gone

  useEffect(() => {
    document.body.style.overflow = "hidden";
    let loaded = 0;
    const total = projects.length + 1;
    const bump = () => (loaded += 1);

    projects.forEach((p) => {
      const img = new Image();
      img.onload = img.onerror = bump;
      img.src = p.image;
    });
    (document.fonts?.ready ?? Promise.resolve()).then(bump, bump);

    const start = performance.now();
    let shown = 0;
    let raf;
    const tick = (now) => {
      const timeP = Math.min((now - start) / MIN_MS, 1);
      const goal = Math.min(loaded / total, timeP);
      shown += (goal - shown) * 0.08;
      if (goal >= 1 && shown > 0.995) shown = 1;

      arcRef.current.style.strokeDashoffset = String(C * (1 - shown));
      const rock = Math.sin(now / 160) * 14; // rocking left and right
      shipRef.current.setAttribute(
        "transform",
        `rotate(${shown * 360}) translate(0 ${-R}) rotate(${rock})`
      );
      setPct(Math.round(shown * 100));

      if (shown >= 1) {
        setPhase("leaving");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (phase !== "leaving") return;
    document.body.style.overflow = "";
    onDone();
    const id = setTimeout(() => setPhase("gone"), 900);
    return () => clearTimeout(id);
  }, [phase, onDone]);

  if (phase === "gone") return null;

  return (
    <div className={"loader" + (phase === "leaving" ? " leaving" : "")} role="status" aria-label="Loading">
      <div className="loader-stars" />
      <svg className="loader-svg" viewBox="-130 -130 260 260">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7de3ff" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="2 6" />
        <circle
          ref={arcRef}
          r={R}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C}
          transform="rotate(-90)"
          style={{ filter: "drop-shadow(0 0 6px #7de3ff)" }}
        />
        <circle r="46" className="loader-planet" />
        <g ref={shipRef}>
          {/* shuttle, nose pointing right, so it flies clockwise along the ring */}
          <g transform="rotate(90) scale(0.9)">
            <path className="flame" d="M-4 14 L0 34 L4 14Z" fill="#ffb347" />
            <path d="M-4 -16 L-22 12 L-4 8Z M4 -16 L22 12 L4 8Z" fill="#cfd8ea" />
            <path d="M0 -26 C7 -16 7 8 5 16 L-5 16 C-7 8 -7 -16 0 -26Z" fill="#fff" />
            <path d="M0 -26 C3 -22 3 -18 0 -16 C-3 -18 -3 -22 0 -26Z" fill="#1b2a7a" />
            <rect x="-3" y="14" width="6" height="4" fill="#667" />
          </g>
        </g>
      </svg>
      <div className="loader-pct">{pct}%</div>
      <div className="loader-text">Preparing for launch</div>
    </div>
  );
}
