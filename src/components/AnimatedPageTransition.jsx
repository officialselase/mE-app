import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * AnimatedPageTransition component that provides smooth fade transitions between routes
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to animate
 * @param {number} props.duration - Animation duration in milliseconds (default: 250)
 */
const AnimatedPageTransition = ({ children, duration = 250 }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === 'fadeOut') {
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [transitionStage, location, duration]);

  const getTransitionStyles = () => {
    const baseStyles = {
      transition: `opacity ${duration}ms ease-in-out, transform ${duration}ms ease-in-out`,
      willChange: 'opacity, transform',
    };

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      return {
        ...baseStyles,
        transition: 'none',
        opacity: 1,
        transform: 'none',
      };
    }

    switch (transitionStage) {
      case 'fadeOut':
        return {
          ...baseStyles,
          opacity: 0,
          transform: 'translateY(10px)',
        };
      case 'fadeIn':
      default:
        return {
          ...baseStyles,
          opacity: 1,
          transform: 'translateY(0)',
        };
    }
  };

  return (
    <div style={getTransitionStyles()}>
      {React.cloneElement(children, { key: displayLocation.pathname })}
    </div>
  );
};

export default AnimatedPageTransition;