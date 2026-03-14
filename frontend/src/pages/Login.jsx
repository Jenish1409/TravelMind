import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const data = await loginUser(form)
            login(data.user)
            navigate('/dashboard')
        } catch (err) {
            setError(err?.response?.data?.error || 'Login failed. Check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 pt-20">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="text-5xl mb-4">✈️</div>
                    <h1 className="text-3xl font-black text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-400">Sign in to your TravelMind account</p>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
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
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                placeholder="••••••••"
                                className="input-field"
                                required
                            />
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
                                    Signing in…
                                </>
                            ) : '🔑 Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-gray-500 text-sm mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
                            Create one →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
