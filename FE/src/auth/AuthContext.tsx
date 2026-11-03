import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authStorageKey, UNAUTHORIZED_EVENT } from '../api/client'
import type { LoginResult, Role } from '../api/types'

export type Session = LoginResult

type AuthValue = {
  session: Session | null
  login: (s: Session) => void
  logout: () => void
  /** 프로필 완성 여부만 갱신 */
  setProfileCompleted: (v: boolean) => void
}

const AuthContext = createContext<AuthValue | null>(null)

function load(): Session | null {
  try {
    const raw = localStorage.getItem(authStorageKey)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(load)

  const login = useCallback((s: Session) => {
    localStorage.setItem(authStorageKey, JSON.stringify(s))
    setSession(s)
  }, [])
  const logout = useCallback(() => {
    localStorage.removeItem(authStorageKey)
    setSession(null)
  }, [])
  const setProfileCompleted = useCallback((v: boolean) => {
    setSession((prev) => {
      if (!prev) return prev
      const next = { ...prev, profileCompleted: v }
      localStorage.setItem(authStorageKey, JSON.stringify(next))
      return next
    })
  }, [])

  // 토큰이 만료되면(401) 자동 로그아웃
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout)
  }, [logout])

  const value = useMemo(() => ({ session, login, logout, setProfileCompleted }), [session, login, logout, setProfileCompleted])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 는 AuthProvider 안에서만 쓸 수 있어요')
  return ctx
}

export const ROLE_PATH: Record<Role, 'guardian' | 'volunteer'> = { GUARDIAN: 'guardian', VOLUNTEER: 'volunteer' }

/** 로그인 직후 보낼 경로 */
export function homePath(s: Session): string {
  return `/${ROLE_PATH[s.role]}/home`
}
