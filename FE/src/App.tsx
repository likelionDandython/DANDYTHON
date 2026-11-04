import { useEffect, type ReactElement } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { allRoutes, legacyRedirects, sections, type ScreenRoute } from './routes'
import { AuthProvider, PATH_MODE, useAuth } from './auth/AuthContext'

/** 개발용: 전체 화면 목록 */
function Gallery() {
  return (
    <div className="gallery">
      <h1>같이가요 · 화면 목록</h1>
      <p className="t-sub">계정 하나로 동행 요청 모드와 동행하기 모드를 오가는 구조예요. 버튼을 누르면 다음 화면으로 이어져요.</p>
      {sections.map((s) => {
        const groups = [...new Set(s.routes.map((r) => r.group))]
        return (
          <section key={s.key}>
            <h2>{s.title}</h2>
            {groups.map((g) => (
              <div key={g}>
                <h3>{g}</h3>
                <div className="gallery__grid">
                  {s.routes
                    .filter((r) => r.group === g)
                    .map((r) => (
                      <Link key={r.path} to={r.path} className="gallery__link">
                        <span className="gallery__code">{r.code}</span>
                        {r.name}
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </section>
        )
      })}
    </div>
  )
}

/** 데스크톱에서는 화면 위에 이름과 '목록으로' 링크를 보여줘요 */
function ScreenShell({ route, children }: { route: ScreenRoute; children: ReactElement }) {
  return (
    <div className="screen-shell">
      <div className="screen-shell__nav">
        <Link to="/">← 화면 목록</Link>
        <span>
          {route.code} {route.name}
        </span>
      </div>
      {children}
    </div>
  )
}

/** 로그인해야 볼 수 있는 화면: 두 모드의 화면 */
function isProtected(path: string) {
  return /^\/(volunteer|guardian|request)\//.test(path)
}

/**
 * 역할이 아니라 모드로 들어가요.
 * - 로그인 전이면 로그인으로
 * - 그 모드의 첫 진입 약관을 아직 안 했으면 약관으로
 * - 다른 모드 화면에 들어오면 지금 모드를 그쪽으로 바꿔요
 */
function Guard({ path, children }: { path: string; children: ReactElement }) {
  const { session, setMode } = useAuth()
  const section = path.split('/')[1]
  const mode = section === 'volunteer' ? PATH_MODE.volunteer : PATH_MODE.guardian
  const entered = !!session?.modes.includes(mode)
  useEffect(() => {
    if (session && entered && session.mode !== mode) setMode(mode)
  }, [session, entered, mode, setMode])
  if (!session) return <Navigate to="/login" replace />
  if (!entered) return <Navigate to={`/mode/terms?mode=${mode}`} replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gallery />} />
        {allRoutes.map((r) => (
          <Route key={r.path} path={r.path} element={<ScreenShell route={r}>{isProtected(r.path) ? <Guard path={r.path}>{r.element}</Guard> : r.element}</ScreenShell>} />
        ))}
        {Object.entries(legacyRedirects).map(([from, to]) => (
          <Route key={from} path={from} element={<Navigate to={to} replace />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
