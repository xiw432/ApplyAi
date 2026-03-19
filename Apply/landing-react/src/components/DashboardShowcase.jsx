import { useScrollReveal } from '../hooks/useScrollReveal';

const DashboardShowcase = () => {
  const [headerRef, headerVisible] = useScrollReveal({ delay: 200 });
  const [dashboardRef, dashboardVisible] = useScrollReveal({ delay: 400 });

  return (
    <section className="dashboard-showcase-section">
      <div className="dashboard-showcase-container">
        <div ref={headerRef} className={`dashboard-showcase-header ${headerVisible ? 'dashboard-showcase-header--visible' : ''}`}>
          <div className="dashboard-showcase-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            <span>Platform Preview</span>
          </div>
          <h2 className="dashboard-showcase-headline">
            Your Entire Journey, <em>One Dashboard</em>
          </h2>
          <p className="dashboard-showcase-subtext">
            Everything organized, nothing missed. From first search to final application.
          </p>
        </div>

        <div ref={dashboardRef} className={`dashboard-glass ${dashboardVisible ? 'dashboard-glass--visible' : ''}`}>
          {/* Premium glow effect */}
          <div className="dashboard-glow"></div>
          
          {/* Dashboard Top Bar */}
          <div className="dash-topbar">
            <div className="dash-title-area">
              <h3>Good morning, Student 👋</h3>
              <p>You have 3 upcoming deadlines this week</p>
            </div>
            <div className="dash-actions">
              <button className="dash-action">
                <span>🔔</span>
                <span>Alerts</span>
              </button>
              <button className="dash-action dash-action-primary">
                <span>+</span>
                <span>Add University</span>
              </button>
            </div>
          </div>

          {/* Dashboard Body */}
          <div className="dash-body">
            {/* Sidebar Navigation */}
            <div className="dash-nav">
              <div className="dash-nav-section">Overview</div>
              <div className="dash-nav-item dash-nav-item-active">
                <span>🏠</span>
                <span>Dashboard</span>
              </div>
              <div className="dash-nav-item">
                <span>🌍</span>
                <span>Explorer</span>
              </div>
              <div className="dash-nav-section">My Applications</div>
              <div className="dash-nav-item">
                <span>🏛️</span>
                <span>Universities</span>
                <span className="dash-badge">7</span>
              </div>
              <div className="dash-nav-item">
                <span>🎓</span>
                <span>Scholarships</span>
                <span className="dash-badge">4</span>
              </div>
              <div className="dash-nav-item">
                <span>📅</span>
                <span>Calendar</span>
              </div>
              <div className="dash-nav-section">Tools</div>
              <div className="dash-nav-item">
                <span>📄</span>
                <span>Documents</span>
              </div>
              <div className="dash-nav-item">
                <span>🤖</span>
                <span>AI Chat</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="dash-content">
              {/* Stats Cards */}
              <div className="dash-stats">
                <div className="dash-stat-card">
                  <div className="dash-stat-num">12</div>
                  <div className="dash-stat-label">Saved Opportunities</div>
                  <div className="dash-stat-delta">↑ 3 this week</div>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-num">7</div>
                  <div className="dash-stat-label">Applications Tracking</div>
                  <div className="dash-stat-delta">↑ 2 in progress</div>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-num">3</div>
                  <div className="dash-stat-label">Deadlines This Week</div>
                  <div className="dash-stat-delta dash-stat-urgent">⚡ Action needed</div>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-num">71%</div>
                  <div className="dash-stat-label">Documents Ready</div>
                  <div className="dash-stat-delta">↑ 5/7 uploaded</div>
                </div>
              </div>

              {/* Opportunities Section */}
              <div className="dash-section-title">Trending Scholarships</div>
              <div className="dash-opp-cards">
                <div className="dash-opp-card">
                  <div className="dash-opp-header">
                    <span className="dash-opp-emoji">🇩🇪</span>
                    <button className="dash-opp-save dash-opp-saved">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.8">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                      </svg>
                    </button>
                  </div>
                  <div className="dash-opp-type dash-opp-type-green">Fully Funded</div>
                  <div className="dash-opp-title">DAAD Research Scholarship 2025</div>
                  <div className="dash-opp-detail">🏛️ Germany · All Fields</div>
                  <div className="dash-deadline-badge dash-deadline-soon">⏰ 12 days left</div>
                </div>

                <div className="dash-opp-card">
                  <div className="dash-opp-header">
                    <span className="dash-opp-emoji">🇨🇳</span>
                    <button className="dash-opp-save">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                      </svg>
                    </button>
                  </div>
                  <div className="dash-opp-type dash-opp-type-blue">Scholarship</div>
                  <div className="dash-opp-title">China Government Scholarship CSC</div>
                  <div className="dash-opp-detail">🏛️ China · Masters & PhD</div>
                  <div className="dash-deadline-badge">📅 Apr 15, 2025</div>
                </div>

                <div className="dash-opp-card">
                  <div className="dash-opp-header">
                    <span className="dash-opp-emoji">🇬🇧</span>
                    <button className="dash-opp-save">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                      </svg>
                    </button>
                  </div>
                  <div className="dash-opp-type dash-opp-type-purple">Prestigious</div>
                  <div className="dash-opp-title">Chevening Scholarship UK</div>
                  <div className="dash-opp-detail">🏛️ United Kingdom · Masters</div>
                  <div className="dash-deadline-badge">📅 Nov 5, 2025</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardShowcase;
