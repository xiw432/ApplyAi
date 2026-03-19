import SpotlightCard from './SpotlightCard';

const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      title: 'Create Your Profile',
      description: 'Tell us about your academic background, goals, and preferences. Our AI analyzes your profile to understand your unique journey.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      spotlightColor: 'rgba(37, 99, 235, 0.2)'
    },
    {
      number: '02',
      title: 'Explore Smart Matches',
      description: 'Browse AI-recommended universities that fit your profile. Save favorites, compare programs, and discover opportunities across 60+ countries.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      ),
      spotlightColor: 'rgba(59, 130, 246, 0.2)'
    },
    {
      number: '03',
      title: 'Stay on Top of Every Application',
      description: 'Track applications with a visual kanban board, never miss deadlines with smart reminders, and get personalized AI guidance every step of the way.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      spotlightColor: 'rgba(96, 165, 250, 0.2)'
    }
  ];

  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="how-it-works-container">
        {/* Section Header */}
        <div className="how-it-works-header">
          <div className="how-it-works-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>How It Works</span>
          </div>
          <h2 className="how-it-works-headline">
            Your journey in three simple steps
          </h2>
          <p className="how-it-works-subtext">
            From profile creation to acceptance, ApplyAI guides you through every stage of your study abroad journey.
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="steps-timeline">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-number-wrapper">
                <div className="step-number">{step.number}</div>
                {index < steps.length - 1 && (
                  <div className="step-connector"></div>
                )}
              </div>
              <SpotlightCard 
                className="step-spotlight-content"
                spotlightColor={step.spotlightColor}
              >
                <div className="step-icon-wrapper">
                  <div className="step-icon">
                    {step.icon}
                  </div>
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
