import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiRequest, logoutRequest } from '@/lib/api'
import { clearAuth, isAuthenticated, saveTokens } from '@/lib/auth'
import type { AuthResponse, User } from '@/types/api'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function bootstrap() {
      if (!isAuthenticated()) {
        setLoading(false)
        return
      }

      try {
        const currentUser = await apiRequest<User>('/api/users/me')
        setUser(currentUser)
      } catch {
        clearAuth()
      } finally {
        setLoading(false)
      }
    }

    void bootstrap()
  }, [])

  async function applyAuthResponse(response: AuthResponse) {
    saveTokens(response.accessToken, response.refreshToken)
    setUser(response.user)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email: string, password: string) {
        const response = await apiRequest<AuthResponse>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        await applyAuthResponse(response)
      },
      async register(email: string, password: string, name: string) {
        const response = await apiRequest<AuthResponse>('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password, name }),
        })
        await applyAuthResponse(response)
      },
      async logout() {
        await logoutRequest()
        setUser(null)
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
