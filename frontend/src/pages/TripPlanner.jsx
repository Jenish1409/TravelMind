import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { generateItinerary, saveTrip, getUserPreferences } from '../services/api'
import { useAuth } from '../context/AuthContext'

const INTEREST_OPTIONS = [
  { label: '🏖️ Beaches', value: 'beaches' },
  { label: '🎉 Nightlife', value: 'nightlife' },
  { label: '🏰 Heritage', value: 'heritage' },
  { label: '🧭 Adventure', value: 'adventure' },
  { label: '🌿 Nature', value: 'nature' },
  { label: '🍜 Food', value: 'food' },
  { label: '☕ Cafes', value: 'cafes' },
  { label: '🛍️ Shopping', value: 'shopping' },
  { label: '🎭 Culture', value: 'culture' },
  { label: '🧘 Wellness', value: 'wellness' },
  { label: '🐾 Wildlife', value: 'wildlife' },
  { label: '😌 Relaxation', value: 'relaxation' },
]

const DESTINATIONS = ['Goa', 'Jaipur', 'Manali', 'Delhi', 'Mumbai', 'Agra', 'Kerala', 'Rajasthan']

export default function TripPlanner() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  const [form, setForm] = useState({
    destination: location.state?.destination || searchParams.get('dest') || '',
    days: location.state?.days || 3,
    interests: location.state?.interests || [],
    budget: location.state?.budget || '',
    prompt: '',
    userId: user?.user_id || 'guest',
    tripIdToUpdate: location.state?.tripId || null
  })

  // Sync userId when auth state loads
  useEffect(() => {
    if (user?.user_id) {
      setForm((f) => ({ ...f, userId: user.user_id }))
    }
  }, [user])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [personalization, setPersonalization] = useState(null)
  const [activeTab, setActiveTab] = useState('form') // 'form' | 'prompt'

  // Fetch existing preferences for personalization message
  useEffect(() => {
    getUserPreferences(form.userId)
      .then((data) => {
        if (!data.isNewUser) setPersonalization(data)
      })
      .catch(() => { })
  }, [form.userId])

  const toggleInterest = (value) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(value)
        ? f.interests.filter((i) => i !== value)
        : [...f.interests, value],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const payload =
      activeTab === 'prompt'
        ? { userId: form.userId, prompt: form.prompt }
        : {
          userId: form.userId,
          destination: form.destination,
          days: Number(form.days),
          interests: form.interests,
          budget: form.budget ? Number(form.budget) : undefined,
          tripIdToUpdate: form.tripIdToUpdate
        }

    try {
      const data = await generateItinerary(payload)

      // Auto-save to DB
      await saveTrip({
        userId: form.userId,
        destination: data.destination,
        days: data.days,
        interests: form.interests,
        budget: payload.budget,
        itinerary: data.itinerary,
        personalized: data.meta?.personalization?.isPersonalized || false,
        trip_id: form.tripIdToUpdate, // Pass along to trigger backend update
      }).then((res) => {
        // Just in case it was a new save (though it shouldn't be if tripIdToUpdate existed)
        data.tripId = res.trip_id;
        data.shareToken = res.shareToken;
      }).catch(() => { }) // don't block on save failure

      // Pass itinerary to next page via sessionStorage
      sessionStorage.setItem('currentItinerary', JSON.stringify(data))
      navigate('/itinerary')
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to generate itinerary.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-3">Plan Your Trip</h1>
          <p className="text-gray-400 text-lg">Tell us where you want to go and we'll create your perfect itinerary.</p>
        </div>

        {/* Personalization Banner */}
        {personalization && (
          <div className="glass-card p-4 mb-6 border-brand-400/30 bg-brand-500/5 flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-brand-300 font-semibold text-sm">Personalized mode active</p>
              <p className="text-gray-400 text-sm mt-0.5">
                Welcome back! Your preferences from past trips will be applied to this itinerary.
                {personalization.preferences?.preferred_activities?.length > 0 &&
                  ` You enjoy: ${personalization.preferences.preferred_activities.slice(0, 3).join(', ')}.`}
              </p>
            </div>
          </div>
        )}

        {/* Tab selector */}
        <div className="flex gap-2 mb-8 p-1 glass-card rounded-xl">
          {[
            { key: 'form', label: '📋 Fill Form' },
            { key: 'prompt', label: '💬 Natural Language' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === t.key
                ? 'bg-brand-500/20 text-brand-200 border border-brand-400/30'
                : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === 'form' ? (
            <div className="space-y-6">
              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Destination *</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {DESTINATIONS.map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setForm((f) => ({ ...f, destination: d }))}
                      className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all duration-200 ${form.destination === d
                        ? 'bg-brand-500/20 border-brand-400/50 text-brand-200'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200'
                        }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={form.destination}
                  onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                  placeholder="Or type a destination..."
                  className="input-field"
                />
              </div>

              {/* Days */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Number of Days: <span className="text-brand-400 font-bold">{form.days}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={7}
                  value={form.days}
                  onChange={(e) => setForm((f) => ({ ...f, days: e.target.value }))}
                  className="w-full accent-brand-500 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 day</span><span>7 days</span>
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Budget (₹) – Optional</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                  <input
                    type="number"
                    value={form.budget}
                    onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                    placeholder="e.g. 15000"
                    className="input-field pl-9"
                  />
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Interests
                  <span className="text-gray-500 font-normal ml-2">({form.interests.length} selected)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => toggleInterest(opt.value)}
                      className={form.interests.includes(opt.value) ? 'tag-chip-active' : 'tag-chip-inactive'}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Describe your trip</label>
              <textarea
                value={form.prompt}
                onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
                placeholder={`E.g. "Plan a 3 day Goa trip with beaches and nightlife under ₹15000"`}
                className="input-field resize-none h-36 text-base"
                required={activeTab === 'prompt'}
              />
              <p className="text-gray-500 text-xs mt-2">
                AI will extract destination, duration, interests, and budget from your message.
              </p>
            </div>
          )}

          {/* User info / sign-in nudge */}
          <div className="mt-6">
            {user ? (
              <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-400/20 flex items-center gap-2 text-sm">
                <span className="text-brand-400">🎯</span>
                <span className="text-gray-300">Personalized for <span className="text-brand-300 font-medium">{user.name}</span></span>
              </div>
            ) : (
              <p className="text-gray-600 text-xs">
                <a href="/login" className="text-brand-400 hover:underline">Sign in</a> for a personalized experience based on your past trips.
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-400/30 text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || (activeTab === 'form' && !form.destination)}
            className="btn-primary w-full mt-8 py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating with AI…
              </>
            ) : (
              '✨ Generate My Itinerary'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
