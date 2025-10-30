// src/components/BowGame.jsx
import React, { useEffect, useRef } from "react";

const BowGame = () => {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    const arrows = svg.querySelector("#arrows");
    let isDrawing = false;

    const draw = () => {
      if (!isDrawing) {return;}
      const arrow = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      arrow.setAttribute("x1", "100");
      arrow.setAttribute("y1", "250");
      arrow.setAttribute("x2", "900");
      arrow.setAttribute("y2", `${Math.random() * 400 + 50}`);
      arrow.setAttribute("stroke", "cyan");
      arrow.setAttribute("stroke-width", "5");
      arrows.appendChild(arrow);
    };

    const handleDown = () => {
      isDrawing = true;
    };
    const handleUp = () => {
      isDrawing = false;
      draw();
    };

    svg.addEventListener("mousedown", handleDown);
    svg.addEventListener("mouseup", handleUp);

    return () => {
      svg.removeEventListener("mousedown", handleDown);
      svg.removeEventListener("mouseup", handleUp);
    };
  }, []);

  return (
    <div className="flex justify-center">
      <svg
        ref={svgRef}
        width="1000"
        height="500"
        style={{ background: "black" }}
      >
        <g id="arrows" />
        <circle
          cx="900"
          cy="250"
          r="40"
          fill="red"
          stroke="white"
          strokeWidth="5"
        />
        <circle cx="900" cy="250" r="20" fill="white" />
      </svg>
    </div>
  );
};

export default BowGame;
