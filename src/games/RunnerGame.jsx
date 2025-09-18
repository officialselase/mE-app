// src/components/games/RunnerGame.js
import React, { useEffect, useRef } from "react";

const RunnerGame = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let x = 50;
    let y = 180;
    let velocityY = 0;
    let gravity = 0.6;
    let isJumping = false;

    const keyDownHandler = (e) => {
      if (e.code === "Space" && !isJumping) {
        velocityY = -12;
        isJumping = true;
      }
    };

    document.addEventListener("keydown", keyDownHandler);

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ground
      ctx.fillStyle = "#4caf50";
      ctx.fillRect(0, 200, canvas.width, 50);

      // player
      ctx.fillStyle = "#2196f3";
      ctx.fillRect(x, y, 30, 30);

      // physics
      y += velocityY;
      velocityY += gravity;

      if (y >= 180) {
        y = 180;
        isJumping = false;
      }

      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={250}
      className="bg-white rounded"
    />
  );
};

export default RunnerGame;
