import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { addToWishlist, saveTrip, inviteCollaborator } from '../services/api'
import BudgetChart from '../components/BudgetChart'

const DAY_COLORS = [
  { bg: 'from-brand-500 to-brand-700', light: 'bg-brand-500/10 border-brand-400/30', text: 'text-brand-300' },
  { bg: 'from-purple-500 to-purple-700', light: 'bg-purple-500/10 border-purple-400/30', text: 'text-purple-300' },
  { bg: 'from-emerald-500 to-emerald-700', light: 'bg-emerald-500/10 border-emerald-400/30', text: 'text-emerald-300' },
  { bg: 'from-rose-500 to-rose-700', light: 'bg-rose-500/10 border-rose-400/30', text: 'text-rose-300' },
  { bg: 'from-amber-500 to-amber-700', light: 'bg-amber-500/10 border-amber-400/30', text: 'text-amber-300' },
  { bg: 'from-cyan-500 to-cyan-700', light: 'bg-cyan-500/10 border-cyan-400/30', text: 'text-cyan-300' },
  { bg: 'from-pink-500 to-pink-700', light: 'bg-pink-500/10 border-pink-400/30', text: 'text-pink-300' },
]

export default function Itinerary() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [itinerary, setItinerary] = useState(null)
  const [activeDay, setActiveDay] = useState(0)
  const [activeTab, setActiveTab] = useState('itinerary') // 'itinerary' | 'budget'
  const [savedItems, setSavedItems] = useState(new Set())
  const [shareToken, setShareToken] = useState(null)
  const [copied, setCopied] = useState(false)
  const [savingTrip, setSavingTrip] = useState(false)
  const [tripId, setTripId] = useState(null)
  // Collaborator panel
  const [showCollabPanel, setShowCollabPanel] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('currentItinerary')
    if (stored) {
      const data = JSON.parse(stored)
      setItinerary(data)
      setShareToken(data.shareToken || null)
      setTripId(data.tripId || null)
    }
  }, [])

  if (!itinerary) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold text-white mb-3">No itinerary yet</h2>
          <p className="text-gray-400 mb-6">Generate a trip plan first to see your itinerary here.</p>
          <Link to="/plan" className="btn-primary">Plan a Trip →</Link>
        </div>
      </div>
    )
  }

  const { destination, days, budget_estimate, best_time_to_visit, itinerary: days_data, meta } = itinerary
  const isPersonalized = meta?.personalization?.isPersonalized
  const userId = user?.user_id || 'guest'

  // Save place to wishlist
  const handleSavePlace = async (place, dayNumber) => {
    const itemId = `${destination}-day${dayNumber}-${place.name}`.replace(/\s+/g, '_').toLowerCase()
    try {
      await addToWishlist({
        userId,
        itemId,
        itemType: 'place',
        name: place.name,
        location: destination,
        description: place.description,
        coordinates: place.coordinates,
        price: place.estimated_cost,
      })
      setSavedItems((prev) => new Set([...prev, itemId]))
    } catch {
      // Already saved or error
      setSavedItems((prev) => new Set([...prev, itemId]))
    }
  }

  // Copy share link
  const handleShare = async () => {
    let token = shareToken
    // If no token yet, save trip and get token
    if (!token && !savingTrip) {
      setSavingTrip(true)
      try {
        const result = await saveTrip({
          userId,
          destination,
          days,
          itinerary: days_data,
          budget_estimate,
          best_time_to_visit,
          personalized: isPersonalized || false,
        })
        token = result.shareToken
        setShareToken(token)
        setTripId(result.trip_id)
        const updated = { ...itinerary, shareToken: token, tripId: result.trip_id }
        sessionStorage.setItem('currentItinerary', JSON.stringify(updated))
      } catch {
        alert('Failed to generate share link.')
        setSavingTrip(false)
        return
      }
      setSavingTrip(false)
    }
    const url = `${window.location.origin}/trip/share/${token}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  // Invite collaborator
  const handleInvite = async () => {
    if (!inviteEmail || !tripId) return
    setInviting(true)
    try {
      await inviteCollaborator(tripId, { collaboratorEmail: inviteEmail })
      setInviteSuccess(true)
      setInviteEmail('')
      setTimeout(() => setInviteSuccess(false), 3000)
    } catch {
      alert('Failed to invite collaborator.')
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {isPersonalized && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-400/30 text-brand-300 text-xs font-medium">
                  🎯 Personalized
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs">
                {meta?.source === 'ai_dynamic' ? '🤖 AI Generated' : '📚 Saved Trip'}
              </span>
            </div>
            <h1 className="text-4xl font-black text-white">
              {destination} <span className="text-gray-500 font-light">– {days} Days</span>
            </h1>
            {isPersonalized && (
              <p className="text-brand-300/80 text-sm mt-2">{meta.personalization.message}</p>
            )}
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            {budget_estimate && (
              <div className="glass-card px-4 py-2 text-sm">
                <span className="text-gray-500">Budget: </span>
                <span className="text-white font-semibold">{budget_estimate}</span>
              </div>
            )}
            {best_time_to_visit && (
              <div className="glass-card px-4 py-2 text-sm">
                <span className="text-gray-500">Best time: </span>
                <span className="text-white font-semibold">{best_time_to_visit}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons row */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={handleShare}
            disabled={savingTrip}
            className="btn-ghost text-sm py-2 px-4 flex items-center gap-1.5"
          >
            {savingTrip ? '⏳' : copied ? '✅ Copied!' : '🔗 Share'}
          </button>
          <button
            onClick={() => setShowCollabPanel((v) => !v)}
            className="btn-ghost text-sm py-2 px-4 flex items-center gap-1.5"
          >
            👥 Collaborate
          </button>
          <Link to="/map" className="btn-ghost text-sm py-2 px-4">🗺️ Map View</Link>
          <Link to="/wishlist" className="btn-ghost text-sm py-2 px-4">❤️ Wishlist</Link>
          <button
            onClick={() => {
              navigate('/plan', {
                state: {
                  destination,
                  days,
                  budget: itinerary.budget,
                  interests: itinerary.interests,
                  tripId
                }
              })
            }}
            className="btn-ghost text-sm py-2 px-4"
          >
            ← Replan
          </button>
        </div>

        {/* Collaborator Panel */}
        {showCollabPanel && (
          <div className="glass-card p-5 mb-6 border border-brand-400/20">
            <h3 className="text-white font-semibold mb-3">👥 Invite Collaborator</h3>
            <p className="text-gray-500 text-sm mb-3">Share this trip with a travel companion by email.</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="companion@email.com"
                className="input-field flex-1 py-2 text-sm"
              />
              <button
                onClick={handleInvite}
                disabled={!inviteEmail || inviting || !tripId}
                className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
              >
                {inviting ? '…' : 'Invite'}
              </button>
            </div>
            {!tripId && (
              <p className="text-amber-400 text-xs mt-2">⚠️ Save the trip first using the Share button to enable collaboration.</p>
            )}
            {inviteSuccess && (
              <p className="text-emerald-400 text-xs mt-2">✅ Invitation recorded!</p>
            )}
          </div>
        )}

        {/* Tab: Itinerary / Budget */}
        <div className="flex gap-2 mb-6 p-1 glass-card rounded-xl w-fit">
          {[{ key: 'itinerary', label: '📋 Itinerary' }, { key: 'budget', label: '💰 Budget' }].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`py-2 px-5 rounded-lg text-sm font-medium transition-all ${activeTab === t.key
                ? 'bg-brand-500/20 text-brand-200 border border-brand-400/30'
                : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'budget' ? (
          <BudgetChart itinerary={days_data} />
        ) : (
          <>
            {/* Day tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
              {days_data?.map((day, idx) => {
                const color = DAY_COLORS[idx % DAY_COLORS.length]
                return (
                  <button
                    key={day.day}
                    onClick={() => setActiveDay(idx)}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${activeDay === idx
                      ? `bg-gradient-to-r ${color.bg} text-white border-transparent shadow-lg`
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20'
                      }`}
                  >
                    Day {day.day}
                  </button>
                )
              })}
            </div>

            {/* Active day content */}
            {days_data?.map((day, dayIdx) => {
              if (dayIdx !== activeDay) return null
              const color = DAY_COLORS[dayIdx % DAY_COLORS.length]
              return (
                <div key={day.day} className="animate-slide-up">
                  <div className={`glass-card p-5 mb-6 border ${color.light}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`day-badge bg-gradient-to-br ${color.bg} shadow-lg`}>{day.day}</div>
                      <div>
                        <h2 className={`text-xl font-bold ${color.text}`}>{day.theme || `Day ${day.day}`}</h2>
                        {day.estimated_cost && (
                          <p className="text-gray-500 text-sm">Est. cost: {day.estimated_cost}</p>
                        )}
                      </div>
                    </div>
                    {day.description && (
                      <p className="text-gray-300 text-sm leading-relaxed">{day.description}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {day.places?.map((place, placeIdx) => {
                      const itemId = `${destination}-day${day.day}-${place.name}`.replace(/\s+/g, '_').toLowerCase()
                      const isSaved = savedItems.has(itemId)
                      return (
                        <div key={placeIdx} className="glass-card-hover p-5">
                          <div className="flex items-start gap-4">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color.bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md`}>
                              {placeIdx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-3 mb-1">
                                <h3 className="text-white font-semibold text-lg">{place.name}</h3>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {place.duration && (
                                    <span className="text-gray-500 text-xs">⏱ {place.duration}</span>
                                  )}
                                  <button
                                    onClick={() => handleSavePlace(place, day.day)}
                                    title={isSaved ? 'Saved to wishlist' : 'Save to wishlist'}
                                    className={`text-lg transition-all ${isSaved ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-100'}`}
                                  >
                                    {isSaved ? '❤️' : '🤍'}
                                  </button>
                                </div>
                              </div>
                              <p className="text-gray-400 text-sm leading-relaxed mb-3">{place.description}</p>

                              {place.category && place.category.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {place.category.map((cat) => (
                                    <span key={cat} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-500 text-xs">
                                      {cat}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center gap-4 flex-wrap">
                                {place.estimated_cost && (
                                  <span className="text-emerald-400 text-xs font-medium">💰 {place.estimated_cost}</span>
                                )}
                                {place.tips && (
                                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-400/20 w-full mt-1">
                                    <span className="text-amber-400 text-sm">💡</span>
                                    <p className="text-amber-300/80 text-xs leading-relaxed">{place.tips}</p>
                                  </div>
                                )}
                              </div>

                              {place.coordinates?.lat && (
                                <p className="text-gray-600 text-xs mt-2">
                                  📍 {place.coordinates.lat.toFixed(4)}, {place.coordinates.lng.toFixed(4)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
