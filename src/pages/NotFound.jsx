// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-white font-serif px-4">
      {/* Caveman GIF background */}
      <div
        className="w-full h-96 bg-center bg-no-repeat bg-contain relative"
        style={{
          backgroundImage:
            "url('https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif')",
        }}
      >
        <h1 className="absolute inset-0 flex items-center justify-center text-8xl font-bold text-black drop-shadow-lg">
          404
        </h1>
      </div>

      {/* Text + Button */}
      <div className="text-center -mt-12">
        <h3 className="text-2xl font-bold">Looks like you're lost</h3>
        <p className="text-gray-600">
          The page you are looking for is not available!
        </p>

        <Link
          to="/"
          className="inline-block mt-6 px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
        >
          Go to Home
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
