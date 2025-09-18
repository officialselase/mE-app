// src/components/games/CavemanGame.js
import React from "react";

const CavemanGame = () => {
  return (
    <div className="text-white flex flex-col items-center justify-center h-full">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/3/37/Caveman.svg"
        alt="Caveman"
        className="h-40 mb-4"
      />
      <p className="text-lg">🥩 Help the caveman collect food!</p>
      <p className="text-sm text-gray-300">(Playable mini-game coming soon)</p>
    </div>
  );
};

export default CavemanGame;
