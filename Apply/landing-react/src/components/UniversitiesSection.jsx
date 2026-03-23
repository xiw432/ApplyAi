import { useState, useEffect } from 'react';

const UniversitiesSection = () => {
  const universityNames = [
    'Top Universities Worldwide',
    'MIT & Stanford',
    'Oxford & Cambridge',
    'Harvard & Yale',
    'ETH Zurich & NTU',
    'Ivy League Schools'
  ];

  const [currentNameIndex, setCurrentNameIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true); // triggers fade-out class

      setTimeout(() => {
        setCurrentNameIndex(
          (prevIndex) => (prevIndex + 1) % universityNames.length
        );

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsAnimating(false); // triggers fade-in class
          });
        });
      }, 500); // matches the CSS transition duration
    }, 3500);

    return () => clearInterval(interval);
  }, [universityNames.length]);

  const universities = [
    {
      name: 'University of Oxford',
      location: 'United Kingdom',
      logo: 'OX',
      color: '#003d82'
    },
    {
      name: 'Stanford University',
      location: 'United States',
      logo: 'SU',
      color: '#8c1515'
    },
    {
      name: 'Tsinghua University',
      location: 'China',
      logo: 'TH',
      color: '#722f8b'
    },
    {
      name: 'ETH Zurich',
      location: 'Switzerland',
      logo: 'ETH',
      color: '#1f407a'
    },
    {
      name: 'University of Cambridge',
      location: 'United Kingdom',
      logo: 'CAM',
      color: '#003d82'
    },
    {
      name: 'University of Toronto',
      location: 'Canada',
      logo: 'UT',
      color: '#003d82'
    },
    {
      name: 'Nanyang Tech University',
      location: 'Singapore',
      logo: 'NTU',
      color: '#1f407a'
    }
  ];

  return (
    <section className="universities-section">
      <div className="universities-container">
        <div className="universities-header">
          <div className="universities-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <span>Universities</span>
          </div>
          <h2 className="universities-headline">
            Explore Opportunities from{' '}
            <em className={`animated-university-name ${isAnimating ? 'fade-out' : 'fade-in'}`}>
              {universityNames[currentNameIndex]}
            </em>
          </h2>
          <p className="universities-subtext">
            From MIT to Oxford, track applications and deadlines for the world's leading institutions.
          </p>
        </div>

        <div className="universities-grid">
          {universities.map((university, index) => (
            <div key={index} className="university-card">
              <div
                className="university-logo"
                style={{ backgroundColor: university.color }}
              >
                {university.logo}
              </div>
              <div className="university-info">
                <h3 className="university-name">{university.name}</h3>
                <p className="university-location">{university.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UniversitiesSection;