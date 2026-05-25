// ─── USE WINDOW SIZE HOOK ─────────────────────────────
// Custom React hook that returns the current window size
// and whether the screen is mobile or tablet
//
// Usage:
//   const { isMobile, isTablet, width } = useWindowSize();
//   if (isMobile) { ... }

import { useState, useEffect } from 'react';

const useWindowSize = () => {
  const { isMobile, isTablet, width } = useWindowSize();
  // Initialise with current window size
  const [windowSize, setWindowSize] = useState({
    width:  window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    // Handler called on every window resize event
    const handleResize = () => {
      setWindowSize({
        width:  window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add resize listener when component mounts
    window.addEventListener('resize', handleResize);

    // Remove listener when component unmounts
    // Prevents memory leaks
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty array = only run on mount/unmount

  return {
    width:    windowSize.width,
    height:   windowSize.height,
    // true if screen width is 768px or less (phone)
    isMobile: windowSize.width <= 768,
    // true if screen width is 1024px or less (tablet)
    isTablet: windowSize.width <= 1024,
  };
};

export default useWindowSize;