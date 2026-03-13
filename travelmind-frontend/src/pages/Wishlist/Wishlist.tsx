import React, { useState } from 'react';
import { Heart, ThumbsUp, MapPin, UserPlus, Globe, CheckCircle } from 'lucide-react';
import './Wishlist.css';

// Mock Data for the wishlist, simulating verified catalog items proposed by the AI
const mockWishlist = [
  {
    id: "wl-1",
    title: "The Ritz-Carlton, Paris",
    type: "Hotel",
    location: "15 Pl. Vendôme, 75001 Paris",
    votes: 3,
    addedBy: "Sarah",
    price: "$$$$",
    verified: true,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "wl-2",
    title: "Disneyland Paris 1-Day Pass",
    type: "Experience",
    location: "Chessy, France",
    votes: 4,
    addedBy: "Mike",
    price: "$130",
    verified: true,
    image: "https://images.unsplash.com/photo-1601360098908-16dcba186358?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "wl-3",
    title: "Le Jules Verne Dinner",
    type: "Dining",
    location: "Eiffel Tower, 2nd Floor",
    votes: 1,
    addedBy: "Sarah",
    price: "$$$",
    verified: true,
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  }
];

const Wishlist = () => {
  const [items, setItems] = useState(mockWishlist);

  const handleVote = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, votes: item.votes + 1 } : item
    ));
  };

  return (
    <div className="wishlist-page container animate-fade-in">
      {/* Header */}
      <header className="wishlist-header">
        <div className="header-text">
          <h1>Shared <span className="text-gradient">Wishlist</span></h1>
          <p className="text-secondary">Collaborate and vote on verified accommodations and experiences for your upcoming trip.</p>
        </div>
        
        <div className="collaborators">
          <div className="avatars">
             <div className="avatar bg-gradient" title="Sarah">S</div>
             <div className="avatar avatar-alt" title="Mike">M</div>
          </div>
          <button className="btn-secondary add-user-btn">
             <UserPlus size={18} /> Invite
          </button>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="wishlist-grid">
        {items.sort((a,b) => b.votes - a.votes).map(item => (
          <div key={item.id} className="wishlist-card glass-panel group-hover">
             <div className="card-image-wrapper">
               <img src={item.image} alt={item.title} className="card-image" />
               <div className="card-badge type-badge">{item.type}</div>
               {item.verified && (
                 <div className="card-badge verified-badge absolute-top-left" title="Verified by TravelMind Database">
                   <CheckCircle size={14} /> Verified
                 </div>
               )}
             </div>
             
             <div className="card-content">
               <div className="card-main-info">
                 <h3>{item.title}</h3>
                 <p className="location text-sm text-secondary">
                   <MapPin size={14} /> {item.location}
                 </p>
               </div>
               
               <div className="card-footer">
                 <div className="added-by text-xs text-tertiary">
                   Added by {item.addedBy} • {item.price}
                 </div>
                 
                 <button 
                   className="vote-btn" 
                   onClick={() => handleVote(item.id)}
                   aria-label={`Vote for ${item.title}`}
                 >
                   <ThumbsUp size={16} className="vote-icon" />
                   <span className="vote-count">{item.votes}</span>
                 </button>
               </div>
             </div>
          </div>
        ))}
        
        {/* Add New Discovery Card */}
        <div className="wishlist-card add-new-card glass-panel flex-center">
           <div className="add-icon bg-gradient">
             <Globe size={32} color="white" />
           </div>
           <h3>Discover More</h3>
           <p className="text-sm text-secondary text-center max-w-xs">
             Browse our verified catalog to add more hotels or experiences to your group wishlist.
           </p>
           <button className="btn-primary rounded-full mt-4 bg-gradient pulse-hover">
             Open Catalog
           </button>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
