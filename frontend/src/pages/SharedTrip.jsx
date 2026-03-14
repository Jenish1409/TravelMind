import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPublicTrip } from '../services/api'

const DAY_COLORS = [
    { bg: 'from-brand-500 to-brand-700', light: 'bg-brand-500/10 border-brand-400/30', text: 'text-brand-300' },
    { bg: 'from-purple-500 to-purple-700', light: 'bg-purple-500/10 border-purple-400/30', text: 'text-purple-300' },
    { bg: 'from-emerald-500 to-emerald-700', light: 'bg-emerald-500/10 border-emerald-400/30', text: 'text-emerald-300' },
    { bg: 'from-rose-500 to-rose-700', light: 'bg-rose-500/10 border-rose-400/30', text: 'text-rose-300' },
    { bg: 'from-amber-500 to-amber-700', light: 'bg-amber-500/10 border-amber-400/30', text: 'text-amber-300' },
]

export default function SharedTrip() {
    const { shareToken } = useParams()
    const [trip, setTrip] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeDay, setActiveDay] = useState(0)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!shareToken) return
        getPublicTrip(shareToken)
            .then(setTrip)
            .catch(() => setError('This shared itinerary could not be found.'))
            .finally(() => setLoading(false))
    }, [shareToken])

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center text-gray-400">
                <span className="text-2xl animate-pulse">✈️ Loading shared itinerary…</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center px-6">
                <div className="text-center">
                    <div className="text-5xl mb-4">🔗</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Link Not Found</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <Link to="/" className="btn-primary">Go Home</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-24 pb-16 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Read-only banner */}
                <div className="flex items-center gap-2 mb-6 px-4 py-2.5 glass-card border border-white/10 rounded-xl text-sm text-gray-400">
                    <span>👁️</span>
                    <span>Read-only shared itinerary · Plan your own at</span>
                    <Link to="/plan" className="text-brand-400 hover:text-brand-300 underline underline-offset-2">TravelMind</Link>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-white">{trip.destination} <span className="text-gray-500 font-light">– {trip.days} Days</span></h1>
                        {trip.budget_estimate && (
                            <p className="text-gray-400 mt-2">💰 {trip.budget_estimate}</p>
                        )}
                        {trip.best_time_to_visit && (
                            <p className="text-gray-400 mt-1">🗓 Best time: {trip.best_time_to_visit}</p>
                        )}
                    </div>
                    <button
                        onClick={copyLink}
                        className="btn-ghost py-2.5 px-5 text-sm flex items-center gap-2 self-start"
                    >
                        {copied ? '✅ Copied!' : '🔗 Copy Link'}
                    </button>
                </div>

                {/* Day tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
                    {(trip.itinerary || []).map((day, idx) => {
                        const color = DAY_COLORS[idx % DAY_COLORS.length]
                        return (
                            <button
                                key={day.day}
                                onClick={() => setActiveDay(idx)}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${activeDay === idx
                                        ? `bg-gradient-to-r ${color.bg} text-white border-transparent shadow-lg`
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                Day {day.day}
                            </button>
                        )
                    })}
                </div>

                {/* Day content */}
                {(trip.itinerary || []).map((day, dayIdx) => {
                    if (dayIdx !== activeDay) return null
                    const color = DAY_COLORS[dayIdx % DAY_COLORS.length]
                    return (
                        <div key={day.day}>
                            <div className={`glass-card p-5 mb-6 border ${color.light}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`day-badge bg-gradient-to-br ${color.bg}`}>{day.day}</div>
                                    <div>
                                        <h2 className={`text-xl font-bold ${color.text}`}>{day.theme || `Day ${day.day}`}</h2>
                                        {day.estimated_cost && <p className="text-gray-500 text-sm">Est. cost: {day.estimated_cost}</p>}
                                    </div>
                                </div>
                                {day.description && <p className="text-gray-300 text-sm">{day.description}</p>}
                            </div>
                            <div className="space-y-4">
                                {(day.places || []).map((place, pi) => (
                                    <div key={pi} className="glass-card p-5">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color.bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                                {pi + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between gap-3 mb-1">
                                                    <h3 className="text-white font-semibold">{place.name}</h3>
                                                    {place.duration && <span className="text-gray-500 text-xs">⏱ {place.duration}</span>}
                                                </div>
                                                <p className="text-gray-400 text-sm mb-2">{place.description}</p>
                                                {place.tips && (
                                                    <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-400/20 text-amber-300/80 text-xs">
                                                        💡 {place.tips}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}

                {/* CTA */}
                <div className="mt-12 glass-card p-8 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Plan your own trip ✨</h3>
                    <p className="text-gray-400 mb-4">Use TravelMind's AI to create your personalized itinerary in seconds.</p>
                    <Link to="/plan" className="btn-primary px-8 py-3">Start Planning Free →</Link>
                </div>
            </div>
        </div>
    )
}
