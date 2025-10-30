import React, { useState, useCallback } from "react";

const VideoPlayer = React.memo(({ videoUrl }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Extract video ID from URL
  let videoId = "";
  if (videoUrl) {
    const urlObj = new URL(videoUrl);
    if (urlObj.hostname === "youtu.be") {
      videoId = urlObj.pathname.slice(1); // Get ID from path (e.g., /TBdZsbNG8Z0)
    } else if (urlObj.searchParams.get("v")) {
      videoId = urlObj.searchParams.get("v"); // Get ID from v parameter (e.g., watch?v=TBdZsbNG8Z0)
    }
  }

  if (!videoId) {
    return <p>Invalid video URL. Please check the link.</p>; // Fallback for invalid URL
  }

  return (
    <>
      <div className="relative group cursor-pointer" onClick={handleClick}>
        <img
          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
          alt="Mr. ICT Demo Thumbnail"
          className="w-full h-auto rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-red-600 text-white rounded-full p-4 shadow-lg">
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          role="dialog"
          aria-label="Mr. ICT Demo Video"
        >
          <div className="relative w-full max-w-4xl mx-4">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="Mr. ICT Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-96 md:h-[500px] rounded-lg"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default VideoPlayer;
