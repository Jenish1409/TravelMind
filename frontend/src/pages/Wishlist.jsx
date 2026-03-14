import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getWishlist, removeFromWishlist } from '../services/api'

const TYPE_ICONS = { hotel: '🏨', activity: '🎯', event: '🎪', place: '📍' }
const TYPE_COLORS = {
    hotel: 'text-amber-300 bg-amber-500/10 border-amber-400/20',
    activity: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20',
    event: 'text-purple-300 bg-purple-500/10 border-purple-400/20',
    place: 'text-brand-300 bg-brand-500/10 border-brand-400/20',
}

export default function Wishlist() {
    const { user, loading: authLoading } = useAuth()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    const userId = user?.user_id

    useEffect(() => {
        if (authLoading) return
        if (!userId) {
            setLoading(false)
            return
        }
        loadWishlist()
    }, [userId, authLoading])

    const loadWishlist = async () => {
        try {
            setLoading(true)
            const data = await getWishlist(userId)
            setItems(data.wishlist || [])
        } catch {
            setItems([])
        } finally {
            setLoading(false)
        }
    }

    const handleRemove = async (id) => {
        try {
            await removeFromWishlist(id, userId)
            setItems((prev) => prev.filter((item) => item._id !== id))
        } catch {
            alert('Failed to remove item.')
        }
    }

    const filtered = filter === 'all' ? items : items.filter((i) => i.itemType === filter)
    const types = ['all', ...new Set(items.map((i) => i.itemType))]

    return (
        <div className="min-h-screen pt-24 pb-16 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-1">❤️ Wishlist</h1>
                        <p className="text-gray-400">{items.length} saved places</p>
                    </div>
                    <Link to="/plan" className="btn-primary py-2.5 px-5 text-sm">
                        + Plan Trip
                    </Link>
                </div>

                {!userId && (
                    <div className="glass-card p-10 text-center">
                        <div className="text-4xl mb-3">🔒</div>
                        <p className="text-white font-semibold mb-2">Sign in to see your wishlist</p>
                        <Link to="/login" className="btn-primary mt-4">Sign In</Link>
                    </div>
                )}

                {userId && (
                    <>
                        {/* Filter tabs */}
                        {types.length > 1 && (
                            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                                {types.map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setFilter(t)}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all flex-shrink-0 capitalize ${filter === t
                                                ? 'bg-brand-500/20 border-brand-400/30 text-brand-200'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
                                            }`}
                                    >
                                        {t !== 'all' && TYPE_ICONS[t]} {t === 'all' ? 'All' : t + 's'}
                                    </button>
                                ))}
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-16 text-gray-500">Loading wishlist…</div>
                        ) : filtered.length === 0 ? (
                            <div className="glass-card p-12 text-center">
                                <div className="text-5xl mb-4">💭</div>
                                <p className="text-white font-semibold text-lg mb-2">Nothing saved yet</p>
                                <p className="text-gray-400 mb-6">Hit ❤️ on any place in your itinerary to save it here.</p>
                                <Link to="/plan" className="btn-primary">Plan a Trip</Link>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {filtered.map((item) => (
                                    <div key={item._id} className="glass-card-hover p-5 flex items-start gap-4">
                                        <div className="text-3xl flex-shrink-0 mt-0.5">{TYPE_ICONS[item.itemType] || '📍'}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-white font-semibold">{item.name}</h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${TYPE_COLORS[item.itemType] || ''}`}>
                                                    {item.itemType}
                                                </span>
                                            </div>
                                            {item.location && <p className="text-gray-500 text-sm">📍 {item.location}</p>}
                                            {item.description && (
                                                <p className="text-gray-400 text-sm mt-1 line-clamp-2">{item.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                                                {item.price && <span>💰 {item.price}</span>}
                                                {item.rating && <span>⭐ {item.rating}</span>}
                                                <span>Saved {new Date(item.savedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(item._id)}
                                            className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 p-1"
                                            title="Remove from wishlist"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
