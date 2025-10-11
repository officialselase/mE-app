import { useState, useEffect } from 'react';

const AnimatedBear = ({ 
  isPasswordFocused = false, 
  isEmailFocused = false, 
  authState = 'idle' // 'idle', 'success', 'error'
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Calculate eye position based on mouse/focus
  const getEyePosition = () => {
    if (isPasswordFocused) {
      return { x: 0, y: 0 }; // Eyes covered, position doesn't matter
    }
    
    if (isEmailFocused && !prefersReducedMotion) {
      // Look down at email field
      return { x: 0, y: 8 };
    }

    if (!prefersReducedMotion && mousePosition.x !== 0) {
      // Follow mouse
      const maxMove = 4;
      return {
        x: Math.max(-maxMove, Math.min(maxMove, mousePosition.x / 20)),
        y: Math.max(-maxMove, Math.min(maxMove, mousePosition.y / 20))
      };
    }

    return { x: 0, y: 0 };
  };

  const eyePos = getEyePosition();

  // Get expression based on auth state
  const getMouthPath = () => {
    if (authState === 'success') {
      // Happy smile
      return 'M 35 55 Q 50 65 65 55';
    } else if (authState === 'error') {
      // Sad frown
      return 'M 35 60 Q 50 50 65 60';
    }
    // Neutral
    return 'M 35 57 L 65 57';
  };

  return (
    <div 
      className="flex justify-center items-center mb-6"
      onMouseMove={(e) => {
        if (!prefersReducedMotion && !isPasswordFocused && !isEmailFocused) {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePosition({
            x: e.clientX - rect.left - rect.width / 2,
            y: e.clientY - rect.top - rect.height / 2
          });
        }
      }}
      onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
    >
      <svg
        width="120"
        height="120"
        viewBox="0 0 100 100"
        className="select-none"
        aria-hidden="true"
      >
        {/* Bear head */}
        <circle cx="50" cy="50" r="35" fill="#8B4513" />
        
        {/* Left ear */}
        <circle cx="25" cy="25" r="15" fill="#8B4513" />
        <circle cx="25" cy="25" r="10" fill="#D2691E" />
        
        {/* Right ear */}
        <circle cx="75" cy="25" r="15" fill="#8B4513" />
        <circle cx="75" cy="25" r="10" fill="#D2691E" />
        
        {/* Face/snout area */}
        <ellipse cx="50" cy="55" rx="25" ry="20" fill="#D2691E" />
        
        {/* Eyes */}
        {!isPasswordFocused ? (
          <>
            {/* Left eye */}
            <g className={prefersReducedMotion ? '' : 'transition-transform duration-200'}>
              <circle 
                cx={35 + eyePos.x} 
                cy={40 + eyePos.y} 
                r="5" 
                fill="white" 
              />
              <circle 
                cx={35 + eyePos.x} 
                cy={40 + eyePos.y} 
                r="3" 
                fill="black" 
              />
            </g>
            
            {/* Right eye */}
            <g className={prefersReducedMotion ? '' : 'transition-transform duration-200'}>
              <circle 
                cx={65 + eyePos.x} 
                cy={40 + eyePos.y} 
                r="5" 
                fill="white" 
              />
              <circle 
                cx={65 + eyePos.x} 
                cy={40 + eyePos.y} 
                r="3" 
                fill="black" 
              />
            </g>
          </>
        ) : (
          <>
            {/* Paws covering eyes */}
            <g className={prefersReducedMotion ? '' : 'animate-paw-cover'}>
              {/* Left paw */}
              <ellipse 
                cx="35" 
                cy="40" 
                rx="12" 
                ry="10" 
                fill="#8B4513"
                className={prefersReducedMotion ? '' : 'transition-all duration-300'}
              />
              {/* Paw pads */}
              <circle cx="32" cy="40" r="2" fill="#654321" />
              <circle cx="38" cy="40" r="2" fill="#654321" />
              <circle cx="35" cy="43" r="2" fill="#654321" />
              
              {/* Right paw */}
              <ellipse 
                cx="65" 
                cy="40" 
                rx="12" 
                ry="10" 
                fill="#8B4513"
                className={prefersReducedMotion ? '' : 'transition-all duration-300'}
              />
              {/* Paw pads */}
              <circle cx="62" cy="40" r="2" fill="#654321" />
              <circle cx="68" cy="40" r="2" fill="#654321" />
              <circle cx="65" cy="43" r="2" fill="#654321" />
            </g>
          </>
        )}
        
        {/* Nose */}
        <ellipse cx="50" cy="50" rx="4" ry="3" fill="black" />
        
        {/* Mouth */}
        <path
          d={getMouthPath()}
          stroke="black"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          className={prefersReducedMotion ? '' : 'transition-all duration-300'}
        />
      </svg>
    </div>
  );
};

export default AnimatedBear;
