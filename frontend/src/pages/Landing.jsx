import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI-Powered Itineraries',
    desc: 'Groq AI generates real, structured day-by-day itineraries based on your interests and budget.',
  },
  {
    icon: '🎯',
    title: 'Personalized for You',
    desc: 'The system learns from your trips and preferences, getting smarter with every journey.',
  },
  {
    icon: '🗺️',
    title: 'Interactive Map',
    desc: 'Visualize your entire trip on a Leaflet map with day-wise colored routes and place markers.',
  },
  {
    icon: '💰',
    title: 'Budget Aware',
    desc: 'Set your budget and get cost estimates for each day so you never overspend.',
  },
]

const DESTINATIONS = [
  { name: 'Goa', emoji: '🏖️', desc: 'Beaches & Nightlife' },
  { name: 'Jaipur', emoji: '🏰', desc: 'Heritage & Culture' },
  { name: 'Manali', emoji: '🏔️', desc: 'Adventure & Nature' },
  { name: 'Kerala', emoji: '🌿', desc: 'Backwaters & Wellness' },
  { name: 'Agra', emoji: '🕌', desc: 'History & Architecture' },
  { name: 'Mumbai', emoji: '🌆', desc: 'City & Food Tours' },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 px-6">
        {/* Background gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-accent-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-brand-900/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-400/30 text-brand-300 text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow" />
            Powered by Groq AI · llama-3.3-70b-versatile
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight animate-slide-up">
            Plan Your Dream
            <span className="block bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
              Trip with AI
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            TravelMind generates personalized day-by-day travel itineraries using AI. 
            Just tell us where you want to go — we'll handle the rest.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/plan" className="btn-primary text-base px-8 py-4 animate-fade-in">
              ✨ Start Planning Free
            </Link>
            <Link to="/itinerary" className="btn-ghost text-base px-8 py-4">
              View Sample Itinerary
            </Link>
          </div>

          {/* Sample prompt */}
          <div className="mt-12 inline-flex items-center gap-3 px-6 py-4 glass-card text-left max-w-xl animate-float">
            <span className="text-2xl">💬</span>
            <div>
              <p className="text-xs text-gray-500 mb-1">Sample prompt</p>
              <p className="text-gray-300 text-sm font-medium">
                "Plan a 3 day Goa trip with beaches and nightlife under ₹15000"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-heading">Everything you need to travel smarter</h2>
            <p className="section-sub">AI-powered planning that learns from every trip you take.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass-card-hover p-6">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-brand-900/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-heading">Popular Destinations</h2>
            <p className="section-sub">Explore our curated database of real places across India.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {DESTINATIONS.map((d) => (
              <Link
                key={d.name}
                to={`/plan?dest=${d.name}`}
                className="glass-card-hover p-4 text-center group"
              >
                <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform duration-200">
                  {d.emoji}
                </span>
                <p className="text-white font-semibold text-sm">{d.name}</p>
                <p className="text-gray-500 text-xs mt-1">{d.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-heading">How TravelMind works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Enter Your Trip', desc: 'Tell us your destination, number of days, interests, and budget.' },
              { step: '02', title: 'AI Generates Itinerary', desc: 'Our Groq AI creates a personalized day-by-day plan with real places.' },
              { step: '03', title: 'Explore on Map', desc: 'View your route on an interactive Leaflet map with place markers.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-black text-xl mx-auto mb-4 shadow-lg shadow-brand-500/30">
                  {item.step}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link to="/plan" className="btn-primary text-base px-10 py-4">
              Plan My Trip →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-gray-600 text-sm">
        <p>TravelMind © 2024 · Built with Groq AI, React, Node.js & MongoDB</p>
      </footer>
    </div>
  )
}
