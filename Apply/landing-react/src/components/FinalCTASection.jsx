const FinalCTASection = () => {
  return (
    <section id="final-cta" className="final-cta-section">
      <div className="final-cta-container">
        <div className="final-cta-card">
          {/* Background Decoration */}
          <div className="cta-bg-decoration">
            <div className="cta-gradient-orb cta-orb-1"></div>
            <div className="cta-gradient-orb cta-orb-2"></div>
          </div>

          {/* Content */}
          <div className="final-cta-content">
            <div className="final-cta-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Get Started Today</span>
            </div>

            <h2 className="final-cta-headline">
              Ready to start your study abroad journey?
            </h2>

            <p className="final-cta-subtext">
              Join thousands of students using ApplyAI to discover universities, track applications, and achieve their study abroad dreams. Start for free, no credit card required.
            </p>

            <div className="final-cta-buttons">
              <button className="btn-final-primary" onClick={() => window.location.href = '/auth/signup.html'}>
                <span>Start Free</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <button className="btn-final-secondary" onClick={() => window.location.href = '/Dashboard/university.html'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <span>Explore Universities</span>
              </button>
            </div>

            <div className="final-cta-trust">
              <div className="trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Free forever</span>
              </div>
              <div className="trust-divider"></div>
              <div className="trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>No credit card</span>
              </div>
              <div className="trust-divider"></div>
              <div className="trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
