import React from 'react';
import Silk from './Silk';
import LandingHeader from './LandingHeader';
import HeroSection from './HeroSection';

const HeroWithBeams = () => {
  return (
    <div className="hero-beams-wrapper">
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
