// ─── USE WINDOW SIZE HOOK ─────────────────────────────
// Returns current window dimensions and breakpoint flags
//
// isMobile: true when screen width is 768px or less
// isTablet: true when screen width is 1024px or less
//
// Uses useCallback and a stable event listener to
// prevent infinite re-render loops

import { useState, useEffect, useCallback } from 'react';

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width:  window.innerWidth,
    height: window.innerHeight,
  });

  // useCallback ensures handleResize is not recreated
  // on every render — this prevents infinite loops
  // where adding/removing the listener causes a render
  // which adds/removes the listener again
  const handleResize = useCallback(() => {
    setWindowSize({
      width:  window.innerWidth,
      height: window.innerHeight,
    });
  }, []); // Empty array = function never changes

  useEffect(() => {
    // Add resize listener once on mount
    window.addEventListener('resize', handleResize);

    // Remove listener on unmount to prevent memory leaks
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]); // Only re-run if handleResize changes
                      // Since handleResize never changes
                      // this effect only runs once

  return {
    width:    windowSize.width,
    height:   windowSize.height,
    isMobile: windowSize.width <= 768,
    isTablet: windowSize.width <= 1024,
  };
};

export default useWindowSize;