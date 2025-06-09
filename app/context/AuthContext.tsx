import React, { createContext, useContext, useState, useEffect } from 'react'
import { validateAccessToken, logoutUser } from '../routes/api/auth'
import { useNavigate } from '@tanstack/react-router'

type User = {
  id: string
  name: string
  email: string
  verified: boolean
  profile_image_url: string | null
  resources?: string[]
  primaryResource?: string[]
  is_admin: boolean
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  error: string | null
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const checkAuth = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await validateAccessToken()
      if (result.success && result.user) {
        setUser(result.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      setError('Failed to validate authentication')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const result = await logoutUser()
      if (result.success) {
        setUser(null)
        navigate({ to: '/' })
      }
    } catch (err) {
      setError('Failed to logout')
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, error, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 