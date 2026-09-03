import React, { useRef, useState } from "react";

/** A card that tilts in 3D towards the cursor. */
export default function ProjectCard({ title, description, image, link }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    // -1 .. 1 relative to the centre of the card
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -py * 16, y: px * 16 });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      className="card-container"
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={ref}
        className={"card" + (hovered ? " card-hovered" : "")}
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <h2 className="card-title" style={{ transform: "translateZ(50px)" }}>
          {title}
        </h2>
        <p className="card-text" style={{ transform: "translateZ(60px)" }}>
          {description}
        </p>
        <div className="card-image" style={{ transform: "translateZ(100px)" }}>
          <img src={image} alt={title} />
        </div>
        <div className="card-footer">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="card-link"
            style={{ transform: "translateZ(20px)" }}
          >
            Try now &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
