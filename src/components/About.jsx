// src/components/About.jsx
import React, { useEffect, useState } from 'react';
import { settingsService } from '../services/api';
import './About.css';

const About = () => {
  const [settings, setSettings] = useState({
    aboutPageTitle: 'Our Story',
    aboutPageContent: 'Born out of the frustration of "nothing to eat" while having a full fridge...',
    aboutPageMission: 'We believe that great cooking should be accessible to everyone',
    aboutPageVision: 'Our vision is to make cooking fun and easy for everyone'
  });
  const [loading, setLoading] = useState(true);

  const renderHighlightedTitle = (title, defaultLeadingText, defaultHighlightedText) => {
    if (title && title.trim()) {
      const words = title.trim().split(/\s+/);
      if (words.length === 1) {
        return <span>{words[0]}</span>;
      }

      return (
        <>
          {words.slice(0, -1).join(' ')} <span className="text-warning">{words[words.length - 1]}</span>
        </>
      );
    }

    return (
      <>
        {defaultLeadingText} <span className="text-warning">{defaultHighlightedText}</span>
      </>
    );
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsService.getSettings();
      if (response.success && response.settings) {
        setSettings(response.settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="about-header text-center shadow-lg">
        <div className="container">
          <h1 className="display-3 fw-bold">
            {renderHighlightedTitle(settings.aboutPageTitle, 'Our', 'Story')}
          </h1>
          <p className="lead fs-4">Turning your kitchen ingredients into culinary masterpieces.</p>
        </div>
      </div>

      {!loading && (
      <div className="container my-5 py-5">
        {/* Story Section */}
        <div className="row align-items-center mb-5 pb-5">
          <div className="col-md-6 order-md-1 order-2">
            <h2 className="fw-bold text-danger mb-3">
              What is <span className="text-warning">QuickCook?</span>
            </h2>
            <p className="text-muted fs-5">
              {settings.aboutPageContent || 'Born out of the frustration of "nothing to eat" while having a full fridge, QuickCook was created to bridge the gap between ingredients and inspiration.'}
            </p>
            <p className="text-muted">
              {settings.aboutPageMission || 'We believe that great cooking shouldn\'t require a trip to the grocery store. By entering what you already have, we unlock thousands of potential meals.'}
            </p>
            <button className="btn btn-danger btn-lg mt-3 shadow">Explore Our Recipes</button>
          </div>
          <div className="col-md-6 order-md-2 order-1 text-center mb-4 mb-md-0">
            <div className="position-relative">
              <img 
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600" 
                className="img-fluid rounded-4 shadow-lg border-5 border-warning" 
                alt="Cooking" 
              />
              <div className="position-absolute bottom-0 start-0 bg-warning text-danger p-3 rounded-end fw-bold shadow">
                Est. 2026
              </div>
            </div>
          </div>
        </div>

        {/* Vision Section */}
        <div className="row bg-light rounded-4 p-5 text-center shadow-sm mb-5 border-top border-warning border-3">
          <div className="col-md-12">
            <h3 className="fw-bold text-danger mb-3">Our Vision</h3>
            <p className="text-muted fs-5">
              {settings.aboutPageVision || 'Our vision is to make cooking fun and easy for everyone'}
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="row text-center mt-5">
          <h2 className="fw-bold mb-5">Why Choose <span className="text-danger">Us?</span></h2>
          <div className="col-md-4 mb-4">
            <div className="card h-100 p-4 shadow-sm border-0">
              <div className="feature-icon"><i className="bi bi-search"></i></div>
              <h4 className="fw-bold">Smart Search</h4>
              <p className="text-muted">Enter ingredients you have, and we'll tell you what you can make instantly.</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100 p-4 shadow-sm border-0">
              <div className="feature-icon"><i className="bi bi-shield-check"></i></div>
              <h4 className="fw-bold">Verified Recipes</h4>
              <p className="text-muted">Every recipe is reviewed by our admins to ensure quality and taste.</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100 p-4 shadow-sm border-0">
              <div className="feature-icon"><i className="bi bi-lightning-charge"></i></div>
              <h4 className="fw-bold">Quick Meals</h4>
              <p className="text-muted">Filter by preparation time to find meals that fit your busy schedule.</p>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default About;