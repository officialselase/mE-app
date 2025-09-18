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
      <img
        src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
        alt="Mr. ICT Demo Thumbnail"
        className="video-thumbnail"
        onClick={handleClick}
        loading="lazy"
      />
      {isOpen && (
        <div
          className="video-modal"
          role="dialog"
          aria-label="Mr. ICT Demo Video"
        >
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="Mr. ICT Demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-64"
          />
          <button onClick={() => setIsOpen(false)}>Close</button>
        </div>
      )}
    </>
  );
});

export default VideoPlayer;
