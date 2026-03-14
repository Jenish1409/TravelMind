import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/api'
import { useAuth } from '../context/AuthContext'

const TRAVEL_STYLES = ['adventurous', 'relaxed', 'cultural', 'luxury', 'budget']

export default function Register() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        travel_style: 'relaxed',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const data = await registerUser(form)
            login(data.user)
            navigate('/onboarding')
        } catch (err) {
            setError(err?.response?.data?.errors?.[0]?.msg || err?.response?.data?.error || 'Registration failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 pt-20 pb-16">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="text-5xl mb-4">🌍</div>
                    <h1 className="text-3xl font-black text-white mb-2">Create Account</h1>
                    <p className="text-gray-400">Start planning your perfect trip</p>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder="Arjun Sharma"
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                placeholder="you@example.com"
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password <span className="text-gray-500 font-normal">(min. 6 chars)</span></label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                placeholder="••••••••"
                                className="input-field"
                                required
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Travel Style</label>
                            <div className="flex flex-wrap gap-2">
                                {TRAVEL_STYLES.map((s) => (
                                    <button
                                        type="button"
                                        key={s}
                                        onClick={() => setForm((f) => ({ ...f, travel_style: s }))}
                                        className={`py-1.5 px-3 rounded-lg text-xs font-medium capitalize border transition-all ${form.travel_style === s
                                                ? 'bg-brand-500/20 border-brand-400/50 text-brand-200'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-400/30 text-red-300 text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating account…
                                </>
                            ) : '🚀 Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-gray-500 text-sm mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
                            Sign in →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
