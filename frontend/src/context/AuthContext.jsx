/**
 * A secure AuthContext — derives user state securely via HttpOnly cookies 
 * using the backend profile endpoint.
 */
import { createContext, useContext, useState, useEffect } from 'react'
import { getProfile, logoutUser } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { user: profileData } = await getProfile();
                setUser(profileData);
            } catch (err) {
                // If 401 or no valid HttpOnly cookie, keep user null
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [])

    const login = (userData) => {
        setUser(userData)
    }

    const logout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error('Logout failed:', error);
        }
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isLoggedIn: !!user }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
