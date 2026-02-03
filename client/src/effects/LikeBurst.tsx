import React from "react";

const PARTICLES = [0, 1, 2, 3];

const LikeBurst = () => {
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {PARTICLES.map((i) => (
        <span
          key={i}
          className={`absolute burst-particle burst-${i}`}
        />
      ))}
    </span>
  );
};

export default LikeBurst;