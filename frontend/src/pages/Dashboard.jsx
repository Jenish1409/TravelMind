import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserTrips, deleteTrip, getTripById, getInvitations, acceptInvitation } from '../services/api'

export default function Dashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [trips, setTrips] = useState([])
    const [invitations, setInvitations] = useState([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState(null)
    const [acceptingId, setAcceptingId] = useState(null)

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        loadTrips()
    }, [user])

    const loadTrips = async () => {
        try {
            setLoading(true)
            const [data, invData] = await Promise.all([
                getUserTrips(user.user_id),
                getInvitations(user.user_id)
            ])
            setTrips(data.trips || [])
            setInvitations(invData.trips || [])
        } catch {
            setTrips([])
            setInvitations([])
        } finally {
            setLoading(false)
        }
    }

    const handleAccept = async (tripId) => {
        setAcceptingId(tripId)
        try {
            await acceptInvitation({ tripId, userId: user.user_id })
            loadTrips()
        } catch {
            alert('Failed to accept invitation.')
        } finally {
            setAcceptingId(null)
        }
    }

    const handleDelete = async (tripId) => {
        if (!confirm('Delete this trip?')) return
        setDeletingId(tripId)
        try {
            await deleteTrip(tripId, user.user_id)
            setTrips((t) => t.filter((trip) => trip.trip_id !== tripId))
        } catch {
            alert('Failed to delete trip.')
        } finally {
            setDeletingId(null)
        }
    }

    const handleLoadTrip = async (trip) => {
        try {
            // Set some lightweight loading state on the button
            const btn = document.getElementById(`view-btn-${trip.trip_id}`)
            if (btn) btn.innerText = '⏳...'

            const fullTrip = await getTripById(trip.trip_id)

            const sessionData = {
                tripId: fullTrip.trip_id,
                shareToken: fullTrip.shareToken,
                destination: fullTrip.destination,
                days: fullTrip.days,
                interests: fullTrip.interests,
                budget: fullTrip.budget,
                budget_estimate: fullTrip.budget_estimate,
                best_time_to_visit: fullTrip.best_time_to_visit,
                itinerary: fullTrip.itinerary || [],
                ownerId: fullTrip.ownerId || fullTrip.user_id,
                collaborators: fullTrip.collaborators || [],
                meta: {
                    userId: user.user_id,
                    source: 'saved',
                    personalization: { isPersonalized: fullTrip.personalized },
                    ownerDetails: fullTrip.ownerDetails || null,
                },
            }
            sessionStorage.setItem('currentItinerary', JSON.stringify(sessionData))
            navigate('/itinerary')
        } catch (err) {
            alert('Failed to load full itinerary.')
        } finally {
            const btn = document.getElementById(`view-btn-${trip.trip_id}`)
            if (btn) btn.innerText = 'View →'
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen pt-24 pb-16 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-1">
                            Welcome back, {user.name.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-gray-400">Your travel command center</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/plan" className="btn-primary py-2.5 px-5 text-sm">
                            ✨ New Trip
                        </Link>
                        <Link to="/wishlist" className="btn-ghost py-2.5 px-5 text-sm">
                            ❤️ Wishlist
                        </Link>
                        <button
                            onClick={() => { logout(); navigate('/') }}
                            className="btn-ghost py-2.5 px-5 text-sm text-red-400 hover:text-red-300"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    {[
                        { label: 'Trips Planned', value: trips.length, icon: '🗺️' },
                        { label: 'Cities Visited', value: new Set(trips.map(t => t.destination)).size, icon: '🏙️' },
                        { label: 'Days Traveled', value: trips.reduce((s, t) => s + (t.days || 0), 0), icon: '📅' },
                    ].map(({ label, value, icon }) => (
                        <div key={label} className="glass-card p-5 text-center">
                            <div className="text-2xl mb-1">{icon}</div>
                            <div className="text-2xl font-black text-white">{value}</div>
                            <div className="text-gray-500 text-xs mt-0.5">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Invitations list */}
                {invitations.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-xl font-bold text-white mb-5">Pending Invitations</h2>
                        <div className="space-y-4">
                            {invitations.map((inv) => (
                                <div key={inv.trip_id} className="glass-card-hover p-5 flex items-center gap-5 border border-brand-500/30">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-amber-500 flex items-center justify-center text-white text-xl flex-shrink-0">
                                        💌
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-semibold text-lg">{inv.destination}</h3>
                                        <p className="text-gray-500 text-sm">
                                            {inv.days} days
                                        </p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleAccept(inv.trip_id)}
                                            disabled={acceptingId === inv.trip_id}
                                            className="btn-primary text-xs py-1.5 px-3"
                                        >
                                            {acceptingId === inv.trip_id ? 'Accepting...' : 'Accept Invite'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Trip list */}
                <h2 className="text-xl font-bold text-white mb-5">Your Trips</h2>

                {loading ? (
                    <div className="text-center py-16 text-gray-500">Loading your trips…</div>
                ) : trips.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <div className="text-5xl mb-4">✈️</div>
                        <p className="text-white font-semibold text-lg mb-2">No trips yet</p>
                        <p className="text-gray-400 mb-6">Plan your first adventure!</p>
                        <Link to="/plan" className="btn-primary">Plan a Trip →</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {trips.map((trip) => (
                            <div key={trip.trip_id} className="glass-card-hover p-5 flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xl flex-shrink-0">
                                    🏖️
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-semibold text-lg">{trip.destination}</h3>
                                    <p className="text-gray-500 text-sm">
                                        {trip.days} days · {new Date(trip.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        {trip.personalized && <span className="ml-2 text-brand-400">🎯 Personalized</span>}
                                    </p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    {trip.shareToken && (
                                        <button
                                            onClick={() => {
                                                const url = `${window.location.origin}/trip/share/${trip.shareToken}`
                                                navigator.clipboard.writeText(url)
                                                alert('Share link copied!')
                                            }}
                                            className="btn-ghost text-xs py-1.5 px-3"
                                            title="Copy share link"
                                        >
                                            🔗 Share
                                        </button>
                                    )}
                                    <button
                                        id={`view-btn-${trip.trip_id}`}
                                        onClick={() => handleLoadTrip(trip)}
                                        className="btn-primary text-xs py-1.5 px-3"
                                    >
                                        View →
                                    </button>
                                    <button
                                        onClick={() => handleDelete(trip.trip_id)}
                                        disabled={deletingId === trip.trip_id}
                                        className="btn-ghost text-xs py-1.5 px-3 text-red-400 hover:text-red-300"
                                    >
                                        {deletingId === trip.trip_id ? '…' : '🗑️'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
