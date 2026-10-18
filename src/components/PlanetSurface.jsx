import React, { useRef } from "react";

const hostOf = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

/**
 * The project info, laid out as features of the planet's land:
 * a ridge line, craters, the title carved into the ground, the screenshot
 * on a floating holo-monitor, and a landing beacon for the link.
 * Visibility is driven by the --c custom property set by App.
 */
export default function PlanetSurface({ title, description, image, link, planet }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", String((e.clientX - r.left) / r.width - 0.5));
    ref.current.style.setProperty("--my", String((e.clientY - r.top) / r.height - 0.5));
  };

  return (
    <div
      ref={ref}
      className="land"
      style={{ "--glow": planet.glow, "--c1": planet.c1, "--c3": planet.c3 }}
      onPointerMove={onMove}
    >
      <svg className="land-grain" aria-hidden="true">
        <filter id={"grain-" + planet.name.replace(/\W/g, "")}>
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="4" seed="3" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.2 -0.3" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${planet.name.replace(/\W/g, "")})`} />
      </svg>

      {/* scattered craters */}
      <i className="crater" style={{ "--x": "8%", "--y": "62%", "--s": "9rem", "--z": 0.5 }} />
      <i className="crater" style={{ "--x": "44%", "--y": "78%", "--s": "6rem", "--z": 1.2 }} />
      <i className="crater" style={{ "--x": "90%", "--y": "20%", "--s": "7rem", "--z": 0.8 }} />
      <i className="crater" style={{ "--x": "62%", "--y": "8%", "--s": "4rem", "--z": 1.5 }} />

      <svg className="ridge" viewBox="0 0 1440 200" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0 200V120l90-50 80 40 120-80 100 70 110-40 130 70 120-90 110 60 100-30 140 80 110-60 130 50 100-20V200Z"
          fill="rgba(2,3,10,0.85)"
        />
      </svg>

      <div className="land-inner">
        <div className="land-text">
          <div className="land-item land-eyebrow" style={{ "--d": 0, "--z": 1 }}>
            {planet.name}
          </div>
          <h2 className="land-title land-item" style={{ "--d": 0.08, "--z": 1.6 }}>
            {title}
          </h2>
          <p className="land-desc land-item" style={{ "--d": 0.2, "--z": 1.2 }}>
            {description}
          </p>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="beacon land-item"
            style={{ "--d": 0.35, "--z": 2 }}
          >
            <span className="beacon-pulse" />
            Land here <span aria-hidden="true">&rarr;</span>
          </a>
        </div>

        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
          className="land-item viewport"
          style={{ "--d": 0.15, "--z": 2.4 }}
        >
          <div className="viewport-frame">
            <div className="viewport-body">
              <div className="viewport-bar">
                <span className="viewport-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="viewport-url">{hostOf(link)}</span>
                <span className="viewport-live">Live</span>
              </div>
              <div className="viewport-screen">
                <img src={image} alt={`${title} screenshot`} />
                <span className="viewport-open" aria-hidden="true">
                  Open site &#8599;
                </span>
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
