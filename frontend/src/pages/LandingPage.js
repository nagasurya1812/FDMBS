import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import HeroSection from '../components/HeroSection'
import Features from '../components/FeaturesSection'
import About from '../components/aboutsection'
import Contact from '../components/ContactSection'

function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    // Check for section parameter in URL
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (section) {
      // Scroll to the section after a short delay to ensure content is loaded
      setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  return (
    <>
  
    <HeroSection/>
    <About/>
    <Features/>
    <Contact/>

    </>
  )
}

export default LandingPage