import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authStorageKey, UNAUTHORIZED_EVENT } from '../api/client'
import { userApi } from '../api/services'
import type { LoginResult, Mode } from '../api/types'

/**
 * 계정 하나 + 모드.
 * - mode: 지금 쓰는 모드 (로그인하면 마지막에 쓴 모드로 열려요)
 * - modes: 첫 진입 약관에 동의한 모드들
 * 서버의 role 은 BE 가 바뀌기 전까지 남아 있지만, 화면 권한 판단에는 쓰지 않아요.
 */
export type Session = LoginResult & { mode: Mode | null; modes: Mode[] }

type AuthValue = {
  session: Session | null
  login: (s: LoginResult) => Session
  logout: () => void
  /** 프로필 완성 여부만 갱신 */
  setProfileCompleted: (v: boolean) => void
  /** 지금 모드를 바꿔요 (첫 진입 약관을 마친 모드만) */
  setMode: (mode: Mode) => void
  /** 모드 첫 진입 약관을 마쳤어요 */
  enterMode: (mode: Mode) => void
}

const AuthContext = createContext<AuthValue | null>(null)

const modesKey = (userId: number) => `hospital-companion.modes.${userId}`

type SavedModes = { mode: Mode | null; modes: Mode[] }

function loadModes(userId: number): SavedModes {
  try {
    const raw = localStorage.getItem(modesKey(userId))
    return raw ? (JSON.parse(raw) as SavedModes) : { mode: null, modes: [] }
  } catch {
    return { mode: null, modes: [] }
  }
}

function persist(s: Session | null) {
  try {
    if (!s) return localStorage.removeItem(authStorageKey)
    localStorage.setItem(authStorageKey, JSON.stringify(s))
    localStorage.setItem(modesKey(s.userId), JSON.stringify({ mode: s.mode, modes: s.modes }))
  } catch {
    /* 저장소를 못 쓰는 환경에서도 화면은 그대로 동작해요 */
  }
}

function load(): Session | null {
  try {
    const raw = localStorage.getItem(authStorageKey)
    if (!raw) return null
    const s = JSON.parse(raw) as Partial<Session> & LoginResult
    return { ...s, mode: s.mode ?? null, modes: s.modes ?? [] }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(load)

  const update = useCallback((fn: (prev: Session) => Session) => {
    setSession((prev) => {
      if (!prev) return prev
      const next = fn(prev)
      persist(next)
      return next
    })
  }, [])

  const login = useCallback((r: LoginResult) => {
    const saved = loadModes(r.userId)
    const s: Session = { ...r, mode: saved.mode, modes: saved.modes }
    persist(s)
    setSession(s)
    return s
  }, [])
  const logout = useCallback(() => {
    persist(null)
    setSession(null)
  }, [])
  const setProfileCompleted = useCallback((v: boolean) => update((p) => ({ ...p, profileCompleted: v })), [update])
  const setMode = useCallback((mode: Mode) => update((p) => ({ ...p, mode })), [update])
  const enterMode = useCallback(
    (mode: Mode) => update((p) => ({ ...p, mode, modes: p.modes.includes(mode) ? p.modes : [...p.modes, mode] })),
    [update],
  )

  // 새로고침하면 GET /users/me 로 이름·프로필 완성 여부를 다시 맞춰요 (처음 한 번)
  useEffect(() => {
    if (!load()) return
    userApi
      .me()
      .then((me) => update((p) => ({ ...p, name: me?.name ?? p.name, profileCompleted: me?.profileCompleted ?? p.profileCompleted })))
      .catch(() => undefined)
  }, [update])

  // 토큰이 만료되면(401) 자동 로그아웃
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout)
  }, [logout])

  const value = useMemo(
    () => ({ session, login, logout, setProfileCompleted, setMode, enterMode }),
    [session, login, logout, setProfileCompleted, setMode, enterMode],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 는 AuthProvider 안에서만 쓸 수 있어요')
  return ctx
}

/** 모드 → 화면 경로 앞부분 (경로 이름은 기존 화면을 그대로 써요) */
export const MODE_PATH: Record<Mode, 'guardian' | 'volunteer'> = { REQUEST: 'guardian', VOLUNTEER: 'volunteer' }
export const PATH_MODE: Record<'guardian' | 'volunteer', Mode> = { guardian: 'REQUEST', volunteer: 'VOLUNTEER' }

export function modeHome(mode: Mode): string {
  return `/${MODE_PATH[mode]}/home`
}

/** 로그인 직후 보낼 경로: 마지막에 쓴 모드, 처음이면 모드 선택 */
export function homePath(s: Session): string {
  if (s.mode && s.modes.includes(s.mode)) return modeHome(s.mode)
  return '/mode'
}

/** 다른 모드로 바꿀 때 갈 곳: 이미 들어가 본 모드면 홈, 처음이면 첫 진입 약관 */
export function switchPath(s: Session, mode: Mode): string {
  return s.modes.includes(mode) ? modeHome(mode) : `/mode/terms?mode=${mode}`
}
