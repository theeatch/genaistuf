import React, { useEffect, useRef, useState } from "react";
import Typewriter from "./components/Typewriter.jsx";
import PlanetSurface from "./components/PlanetSurface.jsx";
import Planet from "./components/Planet.jsx";
import Loader from "./components/Loader.jsx";
import Starfield from "./components/Starfield.jsx";
import { projects } from "./projects.js";

const words = [
  { text: "Explore" },
  { text: "my" },
  { text: "different" },
  { text: "AI" },
  { text: "Projects!", className: "blue" },
];

/* ---------- camera timeline ----------
 * Scroll position (in "units" of 80vh) maps to a camera {x, y, z, c}:
 * x / y = world position in vw / vh, z = zoom, c = card visibility.
 * For each planet: fly to it, zoom in, show the card, hide it, zoom out. */
const ZOOM = 8;
const UNIT_VH = 0.62;
const planetX = (i) => 45 + i * 100;
const planetY = (i) => (i % 2 ? -7 : 6);

const keys = [{ u: 0, x: 0, y: 0, z: 1, c: 0 }];
const stops = [];
let u = 0;
const push = (dt, k) => keys.push({ u: (u += dt), ...k });
projects.forEach((_, i) => {
  const x = planetX(i);
  const y = planetY(i);
  push(0.9, { x, y, z: 1, c: 0 });
  push(0.9, { x, y, z: ZOOM, c: 0 });
  push(0.4, { x, y, z: ZOOM, c: 1 });
  stops.push(u + 0.5);
  push(1, { x, y, z: ZOOM, c: 1 });
  push(0.4, { x, y, z: ZOOM, c: 0 });
  push(0.9, { x, y, z: 1, c: 0 });
});
push(0.6, { x: planetX(projects.length - 1) + 30, y: 0, z: 1, c: 0 });
const TOTAL = u;

const smooth = (t) => t * t * (3 - 2 * t);
const mix = (a, b, t) => a + (b - a) * t;

function camera(at) {
  const p = Math.min(Math.max(at, 0), TOTAL);
  let i = keys.findIndex((k) => k.u >= p);
  if (i <= 0) i = 1;
  const a = keys[i - 1];
  const b = keys[i];
  const t = smooth((p - a.u) / (b.u - a.u));
  return {
    x: mix(a.x, b.x, t),
    y: mix(a.y, b.y, t),
    z: Math.exp(mix(Math.log(a.z), Math.log(b.z), t)),
    c: mix(a.c, b.c, t),
  };
}

export default function App() {
  const scrollerRef = useRef(null);
  const worldRef = useRef(null);
  const nebulaRef = useRef(null);
  const veilRef = useRef(null);
  const introRef = useRef(null);
  const cardRefs = useRef([]);
  const starState = useRef({ x: 0, z: 1, speed: 0 });
  const planetRefs = useRef([]);
  const [active, setActive] = useState(-1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let unit = window.innerHeight * UNIT_VH;
    let cur = window.scrollY / unit;
    let last = camera(cur);
    let activeNow = -1;
    let raf;
    let prevT = performance.now();
    let deep = false;
    let travelling = true;
    let idle = false;

    const size = () => {
      unit = window.innerHeight * UNIT_VH;
      scrollerRef.current.style.height = `${TOTAL * unit + window.innerHeight}px`;
    };
    size();
    window.addEventListener("resize", size);

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - prevT) / 1000, 0.05);
      prevT = now;
      const target = window.scrollY / unit;
      // frame-rate independent easing, snappy enough to feel direct
      cur = reduce ? target : cur + (target - cur) * (1 - Math.exp(-dt * 12));
      if (Math.abs(target - cur) < 0.0005) cur = target;
      if (cur === last.u && idle) return;

      const cam = camera(cur);
      const vw = window.innerWidth / 100;
      const vh = window.innerHeight / 100;
      const speed = Math.abs(cam.x - last.x) + Math.abs(Math.log(cam.z / last.z)) * 8;
      last = { ...cam, u: cur };
      idle = speed === 0;
      starState.current = { x: cam.x, z: cam.z, speed };

      // cheap rendering while zoomed in: no spin, no glow, hide far planets
      const nowDeep = cam.z > 2;
      if (nowDeep !== deep) {
        deep = nowDeep;
        worldRef.current.classList.toggle("deep", deep);
      }
      const nowTravel = cam.z < 1.05;
      if (nowTravel !== travelling) {
        travelling = nowTravel;
        worldRef.current.style.willChange = travelling ? "transform" : "auto";
      }
      planetRefs.current.forEach((el, i) => {
        if (el) el.style.visibility = Math.abs(cam.x - planetX(i)) < 115 ? "visible" : "hidden";
      });

      worldRef.current.style.transform = `scale(${cam.z}) translate3d(${-cam.x * vw}px, ${-cam.y * vh}px, 0)`;
      worldRef.current.style.setProperty("--label", String(Math.max(0, 1.6 - cam.z)));
      nebulaRef.current.style.transform = `translate3d(${-cam.x * vw * 0.12}px, 0, 0) scale(${1 + (cam.z - 1) * 0.04})`;
      veilRef.current.style.opacity = String(cam.c * 0.35);

      const intro = Math.max(0, 1 - cur / 0.8);
      introRef.current.style.opacity = String(intro);
      introRef.current.style.transform = `translate3d(0, ${-(1 - intro) * 40}px, 0)`;

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const near = Math.abs(cam.x - planetX(i)) < 1 ? cam.c : 0;
        el.style.setProperty("--c", near.toFixed(3));
        el.style.pointerEvents = near > 0.85 ? "auto" : "none";
        el.style.visibility = near > 0.01 ? "visible" : "hidden";
      });

      let nearest = -1;
      if (cur > 0.6) {
        nearest = stops.reduce(
          (best, s, i) => (Math.abs(s - cur) < Math.abs(stops[best] - cur) ? i : best),
          0
        );
      }
      if (nearest !== activeNow) {
        activeNow = nearest;
        setActive(nearest);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, []);

  const goTo = (i) =>
    window.scrollTo({ top: stops[i] * window.innerHeight * UNIT_VH, behavior: "smooth" });

  return (
    <div ref={scrollerRef} className="scroller">
      <Loader onDone={() => setReady(true)} />
      <div className="stage">
        <div className="nebula" ref={nebulaRef} />
        <Starfield stateRef={starState} />

        <div className="world" ref={worldRef}>
          {projects.map((project, i) => (
            <Planet
              key={project.title}
              ref={(el) => (planetRefs.current[i] = el)}
              planet={project.planet}
              x={planetX(i)}
              y={planetY(i)}
            />
          ))}
        </div>

        <div className="veil" ref={veilRef} />

        <div className="intro" ref={introRef}>
          {ready && <Typewriter words={words} />}
          <div className="scroll-hint">
            <span>Scroll to fly</span>
            <i />
          </div>
        </div>

        {projects.map((project, i) => (
          <div
            key={project.title}
            className="card-layer"
            ref={(el) => (cardRefs.current[i] = el)}
          >
            <PlanetSurface {...project} />
          </div>
        ))}

        <nav className="hud" aria-label="Planets">
          {projects.map((project, i) => (
            <button
              key={project.title}
              className={"hud-dot" + (active === i ? " on" : "")}
              onClick={() => goTo(i)}
              aria-label={project.planet.name}
              title={project.planet.name}
            />
          ))}
        </nav>

        <footer className="footer">
          <a
            href="https://github.com/theeatch"
            target="_blank"
            rel="noopener noreferrer"
            className="icon"
            aria-label="GitHub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
            </svg>
          </a>

          <span>
            &copy; {new Date().getFullYear()}. Check out{" "}
            <a
              href="https://dhportfoliov2.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="portfolio"
            >
              Portfolio!
            </a>
          </span>

          <a
            href="https://www.linkedin.com/in/dhruv-negi-387a3a233/"
            target="_blank"
            rel="noopener noreferrer"
            className="icon"
            aria-label="LinkedIn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />
            </svg>
          </a>
        </footer>
      </div>
    </div>
  );
}
