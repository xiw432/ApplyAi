const GlobalEducationSection = () => {
  return (
    <section className="global-education-section">
      <div className="global-education-container">
        <div className="global-education-content">
          <h2 className="global-education-headline">
            Start Your <em>Global</em> Education Journey Today
          </h2>
          <p className="global-education-subtext">
            Join thousands of students already discovering scholarships, tracking deadlines, and applying with confidence.
          </p>
          
          <div className="global-education-buttons">
            <button 
              className="btn-global-primary" 
              onClick={() => window.location.href = '/auth/signup.html'}
            >
              Get Started Free →
            </button>
            <button 
              className="btn-global-secondary"
              onClick={() => window.location.href = '/Dashboard/university.html'}
            >
              Explore Scholarships
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalEducationSection;