import React from 'react';
import HeroWithBeams from './components/HeroWithBeams';
import ProblemSection from './components/ProblemSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import DashboardShowcase from './components/DashboardShowcase';
import UniversitiesSection from './components/UniversitiesSection';
import AIAdvisorShowcase from './components/AIAdvisorShowcase';
import GlobalEducationSection from './components/GlobalEducationSection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app">
      <HeroWithBeams />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DashboardShowcase />
      <UniversitiesSection />
      <AIAdvisorShowcase />
      <GlobalEducationSection />
      <Footer />
    </div>
  );
}

export default App;
