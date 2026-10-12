import React, { forwardRef } from "react";

/** A pure-CSS planet. Position (in vw / vh from the world origin) is set by the parent. */
const Planet = forwardRef(function Planet({ planet, x, y }, ref) {
  const style = {
    left: `${x}vw`,
    top: `${y}vh`,
    "--c1": planet.c1,
    "--c2": planet.c2,
    "--c3": planet.c3,
    "--glow": planet.glow,
  };
  return (
    <div className="planet-anchor" style={style} ref={ref}>
      <div className="planet">
        {planet.ring && (
          <div className="ring-wrap">
            <div className="ring ring-back" />
          </div>
        )}
        <div className="sphere" />
        {planet.ring && (
          <div className="ring-wrap">
            <div className="ring ring-front" />
          </div>
        )}
        <span className="planet-label">{planet.name}</span>
      </div>
    </div>
  );
});

export default Planet;
