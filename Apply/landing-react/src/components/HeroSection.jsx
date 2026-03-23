import React, { useEffect, useState } from 'react';

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="home" className="hero-section">
      <div className="hero-container">
        <div className="hero-content-centered">
          <div className={`hero-badge ${isLoaded ? 'hero-badge--visible' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>AI-Powered Study Abroad Platform</span>
          </div>

          <h1 className={`hero-headline ${isLoaded ? 'hero-headline--visible' : ''}`}>
            <span className="hero-headline-line">
              Discover Global <span className="hero-gradient"><em>Opportunities</em></span>
            </span>
            <span className="hero-headline-line">
              for Your Future
            </span>
          </h1>

          <p className={`hero-subtext ${isLoaded ? 'hero-subtext--visible' : ''}`}>
            Find scholarships, universities, and expert guidance—all in one platform, powered by AI.
            Stop searching scattered websites. Start applying with confidence.
          </p>

          <div className={`hero-cta ${isLoaded ? 'hero-cta--visible' : ''}`}>
            <button className="btn-primary btn-glass" onClick={() => window.location.href = '/auth/signup.html'}>
              <span>Get Started</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          <div className={`hero-stats ${isLoaded ? 'hero-stats--visible' : ''}`}>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Universities</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">60+</div>
              <div className="stat-label">Countries</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">AI</div>
              <div className="stat-label">Powered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium spotlight effect */}
      <div className="hero-spotlight"></div>
    </section>
  );
};

export default HeroSection;
