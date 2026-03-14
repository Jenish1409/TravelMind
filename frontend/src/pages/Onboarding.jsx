import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { saveUserPreferences } from '../services/api'

const STEPS = ['Destination', 'Budget', 'Duration', 'Interests', 'Companions']

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

const COMPANION_OPTIONS = ['Solo', 'Couple', 'Family with Kids', 'Group of Friends', 'Corporate']

export default function Onboarding() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [step, setStep] = useState(0)
    const [saving, setSaving] = useState(false)

    const [data, setData] = useState({
        destination: '',
        budget: '',
        duration: '3',
        interests: [],
        companions: 'Solo',
    })

    const toggleInterest = (val) => {
        setData((d) => ({
            ...d,
            interests: d.interests.includes(val)
                ? d.interests.filter((i) => i !== val)
                : [...d.interests, val],
        }))
    }

    const handleFinish = async () => {
        setSaving(true)
        try {
            if (user) {
                await saveUserPreferences({
                    userId: user.user_id,
                    name: user.name,
                    email: user.email,
                    preferred_activities: data.interests,
                })
            }
            // Navigate to planner with pre-filled destination
            const query = data.destination ? `?dest=${encodeURIComponent(data.destination)}` : ''
            navigate(`/plan${query}`)
        } catch {
            navigate('/plan')
        } finally {
            setSaving(false)
        }
    }

    const canProceed = () => {
        if (step === 0) return data.destination.trim().length > 0
        if (step === 2) return data.duration > 0
        return true
    }

    const progress = ((step) / STEPS.length) * 100

    return (
        <div className="min-h-screen flex items-center justify-center px-6 pt-20 pb-16">
            <div className="w-full max-w-xl">
                {/* Progress bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Step {step + 1} of {STEPS.length}</span>
                        <span>{STEPS[step]}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress + 20}%` }}
                        />
                    </div>
                </div>

                <div className="glass-card p-8">
                    {/* Step 0: Destination */}
                    {step === 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Where do you want to go? 🗺️</h2>
                            <p className="text-gray-400 mb-6">Enter your dream destination</p>
                            <input
                                type="text"
                                value={data.destination}
                                onChange={(e) => setData((d) => ({ ...d, destination: e.target.value }))}
                                placeholder="e.g. Goa, Jaipur, Manali, Paris..."
                                className="input-field text-lg"
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Step 1: Budget */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">What's your budget? 💰</h2>
                            <p className="text-gray-400 mb-6">Set a total budget for this trip</p>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                                <input
                                    type="number"
                                    value={data.budget}
                                    onChange={(e) => setData((d) => ({ ...d, budget: e.target.value }))}
                                    placeholder="e.g. 25000"
                                    className="input-field pl-9"
                                />
                            </div>
                            <p className="text-gray-600 text-xs mt-2">Leave blank for flexible budget</p>
                        </div>
                    )}

                    {/* Step 2: Duration */}
                    {step === 2 && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">How many days? 📅</h2>
                            <p className="text-gray-400 mb-6">
                                Duration: <span className="text-brand-400 font-bold">{data.duration} days</span>
                            </p>
                            <input
                                type="range"
                                min={1}
                                max={14}
                                value={data.duration}
                                onChange={(e) => setData((d) => ({ ...d, duration: e.target.value }))}
                                className="w-full accent-brand-500"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>1 day</span>
                                <span>14 days</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2 mt-4">
                                {[3, 5, 7, 10].map((n) => (
                                    <button
                                        type="button"
                                        key={n}
                                        onClick={() => setData((d) => ({ ...d, duration: String(n) }))}
                                        className={`py-2 rounded-xl text-sm font-medium border transition-all ${data.duration === String(n)
                                                ? 'bg-brand-500/20 border-brand-400/50 text-brand-200'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                    >
                                        {n}d
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Interests */}
                    {step === 3 && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">What do you love? ❤️</h2>
                            <p className="text-gray-400 mb-6">Select your travel interests ({data.interests.length} selected)</p>
                            <div className="flex flex-wrap gap-2">
                                {INTEREST_OPTIONS.map((opt) => (
                                    <button
                                        type="button"
                                        key={opt.value}
                                        onClick={() => toggleInterest(opt.value)}
                                        className={data.interests.includes(opt.value) ? 'tag-chip-active' : 'tag-chip-inactive'}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Companions */}
                    {step === 4 && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Who's joining? 👥</h2>
                            <p className="text-gray-400 mb-6">Tell us who you're traveling with</p>
                            <div className="grid grid-cols-1 gap-3">
                                {COMPANION_OPTIONS.map((opt) => (
                                    <button
                                        type="button"
                                        key={opt}
                                        onClick={() => setData((d) => ({ ...d, companions: opt }))}
                                        className={`py-3 px-4 rounded-xl text-sm font-medium text-left border transition-all ${data.companions === opt
                                                ? 'bg-brand-500/20 border-brand-400/50 text-brand-200'
                                                : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30'
                                            }`}
                                    >
                                        {opt === 'Solo' && '🧳'} {opt === 'Couple' && '💑'} {opt === 'Family with Kids' && '👨‍👩‍👧'} {opt === 'Group of Friends' && '👫'} {opt === 'Corporate' && '💼'} {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-3 mt-8">
                        {step > 0 && (
                            <button
                                type="button"
                                onClick={() => setStep((s) => s - 1)}
                                className="btn-ghost flex-1 py-3"
                            >
                                ← Back
                            </button>
                        )}
                        {step < STEPS.length - 1 ? (
                            <button
                                type="button"
                                onClick={() => setStep((s) => s + 1)}
                                disabled={!canProceed()}
                                className="btn-primary flex-1 py-3 disabled:opacity-50"
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleFinish}
                                disabled={saving}
                                className="btn-primary flex-1 py-3 disabled:opacity-50"
                            >
                                {saving ? 'Saving…' : '✨ Start Planning!'}
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/plan')}
                        className="w-full text-center text-gray-600 text-xs mt-4 hover:text-gray-400 transition-colors"
                    >
                        Skip questionnaire
                    </button>
                </div>
            </div>
        </div>
    )
}
