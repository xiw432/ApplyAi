import SpotlightCard from './SpotlightCard';
import { useScrollReveal, useStaggeredReveal } from '../hooks/useScrollReveal';

const FeaturesSection = () => {
  const [headerRef, headerVisible] = useScrollReveal({ delay: 200 });
  const [gridRef, visibleCards] = useStaggeredReveal(4, { staggerDelay: 150 });

  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
      title: 'Discover Best-Fit Universities',
      description: 'Browse 500+ universities across 60 countries with intelligent filters and AI-powered recommendations tailored to your profile.',
      badge: '500+ Universities',
      color: 'blue',
      spotlightColor: 'rgba(37, 99, 235, 0.2)',
      featured: true
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      ),
      title: 'Track Applications in One Place',
      description: 'Manage all your applications with a visual kanban board. Track status, documents, and progress from planning to acceptance.',
      badge: 'Kanban Board',
      color: 'green',
      spotlightColor: 'rgba(16, 185, 129, 0.2)'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path d="M8 14h.01" />
          <path d="M12 14h.01" />
          <path d="M16 14h.01" />
          <path d="M8 18h.01" />
          <path d="M12 18h.01" />
          <path d="M16 18h.01" />
        </svg>
      ),
      title: 'Never Miss a Deadline',
      description: 'Smart calendar with automated reminders for application deadlines, document submissions, and important dates.',
      badge: 'Smart Reminders',
      color: 'amber',
      spotlightColor: 'rgba(245, 158, 11, 0.2)'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          <path d="M8 10h.01" />
          <path d="M12 10h.01" />
          <path d="M16 10h.01" />
        </svg>
      ),
      title: 'Get AI-Powered Guidance',
      description: 'Your personal AI advisor analyzes your profile and provides tailored recommendations, next actions, and application strategies.',
      badge: 'AI Advisor',
      color: 'purple',
      spotlightColor: 'rgba(124, 58, 237, 0.2)'
    }
  ];

  return (
    <section id="features" className="features-section">
      <div className="features-container">
        {/* Section Header */}
        <div ref={headerRef} className={`features-header ${headerVisible ? 'features-header--visible' : ''}`}>
          <div className="features-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>Features</span>
          </div>
          <h2 className="features-headline">
            Everything you need to <em>succeed</em>
          </h2>
          <p className="features-subtext">
            A complete platform designed to simplify your study abroad journey from discovery to acceptance.
          </p>
        </div>

        {/* Features Grid */}
        <div ref={gridRef} className="features-grid">
          {features.map((feature, index) => (
            <SpotlightCard 
              key={index} 
              className={`feature-spotlight-card feature-${feature.color} ${feature.featured ? 'feature-spotlight-card--featured' : ''} ${visibleCards.has(index) ? 'feature-card--visible' : ''}`}
              spotlightColor={feature.spotlightColor}
            >
              <div className="feature-icon-wrapper">
                <div className={`feature-icon feature-icon-${feature.color}`}>
                  {feature.icon}
                </div>
              </div>
              <div className="feature-content">
                <div className="feature-header-row">
                  <h3 className="feature-title">{feature.title}</h3>
                  <span className={`feature-badge feature-badge-${feature.color}`}>
                    {feature.badge}
                  </span>
                </div>
                <p className="feature-description">{feature.description}</p>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
