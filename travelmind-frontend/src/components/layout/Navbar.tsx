import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Calendar, Heart, Menu, X, User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { path: '/', label: 'Explore', icon: Compass },
    { path: '/build', label: 'Itinerary', icon: Calendar },
    { path: '/wishlist', label: 'Wishlist', icon: Heart },
  ];

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon bg-gradient">
             <Compass size={24} color="white" />
          </div>
          <span className="logo-text">TravelMind</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links desktop-only">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Actions */}
        <div className="nav-actions desktop-only">
          <button className="btn-secondary rounded-full">
            Log In
          </button>
          <button className="btn-primary rounded-full bg-gradient pulse-hover">
            Start Planning
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-toggle" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="mobile-menu glass-panel animate-fade-in">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`mobile-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="mobile-actions">
            <button className="btn-secondary w-full mb-4">Log In</button>
            <button className="btn-primary bg-gradient w-full">Start Planning</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
