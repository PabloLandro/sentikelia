import React, { useState } from 'react';
import wheel from '@/assets/images/reload-wheel.svg';

function ReloadWheel({ onClick }) {
  // This state is used to force the image to reload by updating the query string.
  const [reloadKey, setReloadKey] = useState(Date.now());
  // This state toggles the animation class.
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    onClick()
    // Update the reload key so the src changes
    setReloadKey(Date.now());
    // Start the animation
    setIsAnimating(true);
    // Remove the animation class after the animation duration (1s here)
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <>
      <img
        src={`${wheel}?reload=${reloadKey}`}
        alt="Reload wheel"
        onClick={handleClick}
        className={`w-8 h-8 cursor-pointer ${isAnimating ? 'spin-once' : ''}`}
      />
      {/* CSS for the one-time spin animation */}
      <style jsx>{`
        @keyframes spinOnce {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-once {
          animation: spinOnce 0.3s linear;
        }
      `}</style>
    </>
  );
}

export default ReloadWheel;
