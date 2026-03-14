import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isLoggedIn, loading } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="TravelMind Logo"
            className="h-11 w-auto object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.5)] group-hover:scale-105 group-hover:drop-shadow-[0_0_14px_rgba(139,92,246,0.8)] transition-all duration-300"
          />
          <span className="text-white font-black text-xl tracking-tight group-hover:text-brand-300 transition-colors">
            TravelMind
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1 text-sm">
          <Link to="/plan" className="text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
            Plan Trip
          </Link>
          {isLoggedIn && (
            <>
              <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                Dashboard
              </Link>
              <Link to="/wishlist" className="text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                ❤️ Wishlist
              </Link>
            </>
          )}

          {loading ? (
            <div className="flex items-center ml-3">
              <div className="w-32 h-8 rounded-lg animate-pulse bg-white/5" />
            </div>
          ) : isLoggedIn ? (
            <div className="flex items-center gap-2 ml-3">
              <Link to="/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-white text-sm font-medium">{user?.name?.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/10 text-xs"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-3">
              <Link to="/login" className="btn-ghost text-sm py-1.5 px-4">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary text-sm py-1.5 px-4">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
