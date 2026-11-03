import type { ReactElement } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { allRoutes, sections, type ScreenRoute } from './routes'

/** 개발용: 전체 화면 목록 */
function Gallery() {
  return (
    <div className="gallery">
      <h1>경북대구병원동행 · 화면 목록</h1>
      <p className="t-sub">Figma 「병원동행 봉사자 앱」 파일의 화면을 React로 옮긴 프로토타입이에요. 버튼을 누르면 다음 화면으로 이어져요.</p>
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gallery />} />
        {allRoutes.map((r) => (
          <Route key={r.path} path={r.path} element={<ScreenShell route={r}>{r.element}</ScreenShell>} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
