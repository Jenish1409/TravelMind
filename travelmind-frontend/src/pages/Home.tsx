import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, Sparkles } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="gradient-blob blob-1"></div>
          <div className="gradient-blob blob-2"></div>
        </div>

        <div className="container hero-content animate-fade-in">
          <div className="badge glass-panel">
            <Sparkles size={16} className="text-primary-500" />
            <span>AI-Powered Travel Planning</span>
          </div>
          
          <h1 className="hero-title">
            Your Dream Trip, <br />
            <span className="text-gradient">Planned in Seconds.</span>
          </h1>
          
          <p className="hero-subtitle">
            Tell us where you want to go and what you love doing. TravelMind builds a personalized, day-by-day itinerary instantly.
          </p>

          <div className="search-box glass-panel">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={24} />
              <input 
                type="text" 
                placeholder="e.g., A romantic 5-day getaway to Paris under $2000..." 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="ai-prompt-input"
              />
            </div>
            
            <div className="search-filters">
              <button className="filter-btn">
                <MapPin size={18} /> Anywhere
              </button>
              <button className="filter-btn">
                <Calendar size={18} /> Any Week
              </button>
              <button className="filter-btn">
                <Users size={18} /> 2 Travelers
              </button>
              <button className="generate-btn bg-gradient pulse-hover">
                Generate Itinerary
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="features-section container">
        <h2 className="section-title text-center">Plan Smarter, Travel Better</h2>
        <div className="features-grid">
          <div className="feature-card glass-panel group-hover">
            <div className="feature-icon bg-gradient">
              <Sparkles size={24} color="white" />
            </div>
            <h3>AI-Generated Itineraries</h3>
            <p>Get a complete, day-by-day schedule organized by location and optimal timing.</p>
          </div>
          <div className="feature-card glass-panel group-hover">
            <div className="feature-icon bg-gradient">
              <Users size={24} color="white" />
            </div>
            <h3>Collaborate with Friends</h3>
            <p>Invite your travel buddies to view, vote, and add suggestions in real-time.</p>
          </div>
          <div className="feature-card glass-panel group-hover">
            <div className="feature-icon bg-gradient">
              <MapPin size={24} color="white" />
            </div>
            <h3>Verified Recommendations</h3>
            <p>Every hotel, restaurant, and experience comes from verified, bookable catalogs.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
