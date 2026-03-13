import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import ItineraryBuilder from './pages/Itinerary/ItineraryBuilder';
import Wishlist from './pages/Wishlist/Wishlist';

function App() {
  return (
    <Router>
      <div className="app-container">
        <MainLayout>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/build" element={<ItineraryBuilder />} />
              <Route path="/wishlist" element={<Wishlist />} />
            </Routes>
          </main>
        </MainLayout>
      </div>
    </Router>
  );
}

export default App;
