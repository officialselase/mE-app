import React from 'react';

const ElectricCavemanAnimation = ({ className = '', alt = 'Electric Caveman Animation' }) => {
  return (
    <img
      src="https://cdn.dribbble.com/userupload/20477400/file/original-c84e51367767f2a7c485a43d820bde27.gif"
      alt={alt}
      className={`w-full max-h-48 object-contain ${className}`}
      onError={(e) => {
        e.target.style.display = 'none'; // Hide if load fails
        console.warn('Failed to load Electric Caveman animation');
      }}
    />
  );
};

export default ElectricCavemanAnimation;
