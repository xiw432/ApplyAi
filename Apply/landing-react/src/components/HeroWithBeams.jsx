import React, { useState, useEffect } from 'react';
import Silk from './Silk';
import LandingHeader from './LandingHeader';
import HeroSection from './HeroSection';

const HeroWithBeams = () => {
  const [silkLoaded, setSilkLoaded] = useState(false);

  useEffect(() => {
    // Silk/Three.js Canvas takes a moment to initialize.
    // Fade out placeholder once canvas has had time to render.
    const timer = setTimeout(() => {
      setSilkLoaded(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="hero-beams-wrapper">
      {/* CSS-only placeholder shown while Silk canvas loads */}
      <div className={`silk-placeholder ${silkLoaded ? 'silk-placeholder--loaded' : ''}`}>
        <div className="silk-placeholder-shimmer"></div>
      </div>
      <div className="beams-background">
        <Silk
          speed={3}
          scale={1.2}
          color="#3b82f6"
          noiseIntensity={1.2}
          rotation={0}
        />
      </div>
      <div className="hero-content-layer">
        <LandingHeader />
        <HeroSection />
      </div>
    </div>
  );
};

export default HeroWithBeams;
