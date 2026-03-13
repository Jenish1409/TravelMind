import React, { useState } from 'react';
import { Clock, MapPin, Navigation, Info, ChevronDown, CheckCircle } from 'lucide-react';
import './Itinerary.css';

// Mock Data structure based on the problem statement "verified catalog data"
const mockItinerary = {
  destination: "Paris, France",
  duration: "3 Days",
  budget: "$2000",
  hotel: {
    name: "Hôtel Le Relais Saint-Germain",
    address: "9 Carrefour de l'Odéon, 75006 Paris",
    rating: 4.8,
    verified: true
  },
  days: [
    {
      day: 1,
      date: "Oct 12",
      activities: [
        {
          id: "act-1",
          time: "09:00 AM",
          title: "Breakfast at Café de Flore",
          type: "Dining",
          location: "172 Bd Saint-Germain",
          verified: true
        },
        {
          id: "act-2",
          time: "11:00 AM",
          title: "Louvre Museum Guided Tour",
          type: "Experience",
          location: "Rue de Rivoli",
          verified: true,
          duration: "3 hours"
        },
        {
          id: "act-3",
          time: "03:30 PM",
          title: "Seine River Cruise",
          type: "Experience",
          location: "Port de la Bourdonnais",
          verified: true
        }
      ]
    },
    {
      day: 2,
      date: "Oct 13",
      activities: [
        {
          id: "act-4",
          time: "10:00 AM",
          title: "Eiffel Tower Ascent",
          type: "Experience",
          location: "Champ de Mars",
          verified: true
        },
        {
          id: "act-5",
          time: "01:00 PM",
          title: "Lunch near Trocadéro",
          type: "Dining",
          location: "Trocadéro Square",
          verified: true
        }
      ]
    }
  ]
};

const ItineraryBuilder = () => {
  const [activeDay, setActiveDay] = useState(1);

  return (
    <div className="itinerary-page container">
      {/* Header Section */}
      <header className="itinerary-header animate-fade-in">
        <div className="header-content">
          <h1 className="text-gradient">Your Trip to {mockItinerary.destination}</h1>
          <div className="trip-meta">
            <span className="badge"><Clock size={16} /> {mockItinerary.duration}</span>
            <span className="badge badge-outline">Budget: {mockItinerary.budget}</span>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-secondary">Share <ChevronDown size={16}/></button>
          <button className="btn-primary bg-gradient">Book All Items</button>
        </div>
      </header>

      <div className="itinerary-layout">
        {/* Sidebar: Accommodations & Map Summary */}
        <aside className="itinerary-sidebar animate-fade-in">
          <div className="glass-panel accommodation-card">
            <div className="card-header">
              <h3>Accommodation</h3>
              <div className="verified-badge" title="Sourced from verified catalog">
                 <CheckCircle size={16} /> Verified
              </div>
            </div>
            <div className="hotel-info">
              <div className="hotel-image-placeholder bg-gradient">
                 <MapPin size={32} color="white" />
              </div>
              <div className="hotel-details">
                <h4>{mockItinerary.hotel.name}</h4>
                <p className="text-sm"><MapPin size={14} /> {mockItinerary.hotel.address}</p>
                <div className="rating">⭐ {mockItinerary.hotel.rating} / 5</div>
              </div>
            </div>
            <button className="btn-secondary w-full mt-4">Manage Booking</button>
          </div>

          <div className="glass-panel map-card mt-4">
             <div className="map-placeholder">
               <Navigation size={48} className="text-tertiary" />
               <p>Interactive Map View</p>
             </div>
          </div>
        </aside>

        {/* Main Timeline Content */}
        <main className="timeline-container animate-fade-in" style={{animationDelay: '0.1s'}}>
          {/* Day Tabs */}
          <div className="day-tabs">
            {mockItinerary.days.map((dayPlan) => (
              <button 
                key={dayPlan.day}
                className={`day-tab ${activeDay === dayPlan.day ? 'active' : ''}`}
                onClick={() => setActiveDay(dayPlan.day)}
              >
                Day {dayPlan.day}
                <span className="tab-date">{dayPlan.date}</span>
              </button>
            ))}
          </div>

          {/* Timeline */}
          <div className="timeline-content glass-panel">
            {mockItinerary.days.find(d => d.day === activeDay)?.activities.map((activity, index) => (
              <div key={activity.id} className="timeline-item">
                <div className="timeline-time">
                  <span>{activity.time}</span>
                  {activity.duration && <span className="duration text-xs text-tertiary">{activity.duration}</span>}
                </div>
                
                <div className="timeline-node">
                  <div className="node-dot bg-gradient"></div>
                  {index !== mockItinerary.days.find(d => d.day === activeDay)!.activities.length - 1 && (
                    <div className="node-line"></div>
                  )}
                </div>
                
                <div className="timeline-card group-hover">
                  <div className="card-top">
                    <h4>{activity.title}</h4>
                    {activity.verified && <CheckCircle size={16} className="text-primary-500" title="Verified Activity" />}
                  </div>
                  <div className="card-meta text-sm text-secondary">
                    <span className="activity-type">{activity.type}</span>
                    <span className="activity-location"><MapPin size={14}/> {activity.location}</span>
                  </div>
                  <div className="card-actions">
                    <button className="icon-btn"><Info size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ItineraryBuilder;
