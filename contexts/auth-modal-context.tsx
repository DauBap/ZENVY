'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useHeartbeat } from '@/hooks/use-heartbeat'

type AuthTab = 'login' | 'register'

export interface AuthUser {
  id: number
  email: string
  name: string
  role: string
  avatar: string | null
  readerStatus?: string | null
}

interface AuthModalContextValue {
  // Modal state
  isOpen: boolean
  tab: AuthTab
  openLogin: (prefillEmail?: string) => void
  openRegister: () => void
  close: () => void
  switchTab: (tab: AuthTab) => void
  prefillEmail: string
  // Auth state
  user: AuthUser | null
  isLoadingUser: boolean
  setUser: (user: AuthUser | null) => void
  logout: () => Promise<void>
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null)

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState<AuthTab>('login')
  const [prefillEmail, setPrefillEmail] = useState('')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  // Khôi phục session khi load trang
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => { if (data.user) setUser(data.user) })
      .catch(() => {})
      .finally(() => setIsLoadingUser(false))
  }, [])

  useHeartbeat(user?.role === 'READER' && user?.readerStatus === 'ACTIVE')

  const openLogin = useCallback((email = '') => {
    setPrefillEmail(email)
    setTab('login')
    setIsOpen(true)
  }, [])

  const openRegister = useCallback(() => {
    setPrefillEmail('')
    setTab('register')
    setIsOpen(true)
  }, [])

  const close = useCallback(() => setIsOpen(false), [])

  const switchTab = useCallback((t: AuthTab) => setTab(t), [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }, [])

  return (
    <AuthModalContext.Provider value={{
      isOpen, tab, openLogin, openRegister, close, switchTab, prefillEmail,
      user, isLoadingUser, setUser, logout,
    }}>
      {children}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext)
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider')
  return ctx
}
