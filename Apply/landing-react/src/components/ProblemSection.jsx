import SpotlightCard from './SpotlightCard';
import { useScrollReveal, useStaggeredReveal } from '../hooks/useScrollReveal';

const ProblemSection = () => {
  const [headerRef, headerVisible] = useScrollReveal({ delay: 200 });
  const [gridRef, visibleCards] = useStaggeredReveal(3, { staggerDelay: 200 });

  const problems = [
    {
      icon: '🌐',
      title: 'Too Many Scattered Sources',
      description: 'Students visit 20+ different websites to compare scholarships, university requirements, and application steps—with no central hub.',
      spotlightColor: 'rgba(220, 38, 38, 0.2)'
    },
    {
      icon: '📋',
      title: 'Confusing Requirements',
      description: 'Application requirements vary by country, university, and program—making it nearly impossible to know exactly what\'s needed.',
      spotlightColor: 'rgba(245, 101, 101, 0.2)'
    },
    {
      icon: '⏰',
      title: 'Missing Deadlines',
      description: 'Without a smart tracker, students miss scholarship and university deadlines worth thousands of dollars in funding every year.',
      spotlightColor: 'rgba(239, 68, 68, 0.2)'
    }
  ];

  return (
    <section className="problem-section">
      <div className="problem-container">
        <div ref={headerRef} className={`problem-header ${headerVisible ? 'problem-header--visible' : ''}`}>
          <div className="problem-badge">
            <span>⚡</span>
            <span>The Problem</span>
          </div>
          <h2 className="problem-headline">
            Finding Global Opportunities is <em>Exhausting</em>
          </h2>
          <p className="problem-subtext">
            Students spend hundreds of hours searching scattered websites, missing deadlines, 
            and losing opportunities they deserved.
          </p>
        </div>

        <div ref={gridRef} className="problem-grid">
          {problems.map((problem, index) => (
            <SpotlightCard 
              key={index} 
              className={`problem-spotlight-card ${visibleCards.has(index) ? 'problem-card--visible' : ''}`}
              spotlightColor={problem.spotlightColor}
            >
              <div className="problem-card-icon">{problem.icon}</div>
              <h3 className="problem-card-title">{problem.title}</h3>
              <p className="problem-card-desc">{problem.description}</p>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
