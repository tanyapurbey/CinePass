import { createContext, useContext, useState, useEffect } from 'react'
import { TOKEN_KEY, USER_KEY, ROLES } from '../utils/constants'

const AuthContext = createContext(null)

function loadStoredUser() {
  try {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  const login = (authResponse) => {
    const userData = {
      id: authResponse.id,
      email: authResponse.email,
      role: authResponse.role,
    }
    localStorage.setItem(TOKEN_KEY, authResponse.token)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setToken(authResponse.token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  const updateStoredUser = (userData) => {
    const updated = { ...user, ...userData }
    localStorage.setItem(USER_KEY, JSON.stringify(updated))
    setUser(updated)
  }

  const isAuthenticated = !!token
  const isAdmin = user?.role === ROLES.ADMIN

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateStoredUser,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
