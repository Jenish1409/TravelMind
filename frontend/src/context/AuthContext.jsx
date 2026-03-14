/**
 * A light AuthContext — stores user from localStorage
 * so components can read current user anywhere.
 */
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Restore from localStorage on page load
        const stored = localStorage.getItem('tm_token')
        const storedUser = localStorage.getItem('tm_user')
        if (stored && storedUser) {
            setToken(stored)
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    const login = (tokenStr, userData) => {
        localStorage.setItem('tm_token', tokenStr)
        localStorage.setItem('tm_user', JSON.stringify(userData))
        setToken(tokenStr)
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem('tm_token')
        localStorage.removeItem('tm_user')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, isLoggedIn: !!user }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
