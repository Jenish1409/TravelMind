import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import TripPlanner from './pages/TripPlanner'
import Itinerary from './pages/Itinerary'
import MapView from './pages/MapView'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Wishlist from './pages/Wishlist'
import Onboarding from './pages/Onboarding'
import SharedTrip from './pages/SharedTrip'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-950">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/plan" element={<TripPlanner />} />
            <Route path="/itinerary" element={<Itinerary />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/trip/share/:shareToken" element={<SharedTrip />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
