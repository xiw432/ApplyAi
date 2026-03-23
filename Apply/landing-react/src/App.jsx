import React from 'react';
import HeroWithBeams from './components/HeroWithBeams';
import WaitlistSection from './components/WaitlistSection';
import ProblemSection from './components/ProblemSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import DashboardShowcase from './components/DashboardShowcase';
import UniversitiesSection from './components/UniversitiesSection';
import AIAdvisorShowcase from './components/AIAdvisorShowcase';
import CommunitySection from './components/CommunitySection';
import TestimonialsSection from './components/TestimonialsSection';
import GlobalEducationSection from './components/GlobalEducationSection';
import FinalCTASection from './components/FinalCTASection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app">
      <HeroWithBeams />
      <WaitlistSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DashboardShowcase />
      <UniversitiesSection />
      <AIAdvisorShowcase />
      <CommunitySection />
      <TestimonialsSection />
      <GlobalEducationSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}

export default App;
