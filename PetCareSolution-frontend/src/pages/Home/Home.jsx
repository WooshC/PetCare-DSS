import React from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import CTA from './components/CTA';
import FAQ from './components/FAQ';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Home;