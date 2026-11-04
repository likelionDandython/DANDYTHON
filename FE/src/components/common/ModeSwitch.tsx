import { useNavigate } from 'react-router-dom'
import { userApi } from '../../api/services'
import { MODE_LABEL } from '../../api/labels'
import type { Mode } from '../../api/types'
import { switchPath, useAuth } from '../../auth/AuthContext'
import { Icon } from './Icon'

const OTHER: Record<Mode, Mode> = { REQUEST: 'VOLUNTEER', VOLUNTEER: 'REQUEST' }
const SHORT: Record<Mode, string> = { REQUEST: '요청', VOLUNTEER: '동행' }

/** 다른 모드로 바꿔요. 처음 가는 모드면 첫 진입 약관으로 보내요 */
function useSwitchTo() {
  const navigate = useNavigate()
  const { session, setMode } = useAuth()
  return (target: Mode) => {
    if (!session) return navigate('/login')
    if (session.modes.includes(target)) {
      setMode(target)
      // 서버에 마지막 모드 저장 (BE 준비 전에는 실패해도 화면은 그대로 바뀌어요)
      userApi.setMode(target).catch(() => undefined)
    }
    navigate(switchPath(session, target))
  }
}

/** 홈 상단의 작은 전환 버튼: ⇄ 요청 / ⇄ 동행 */
export function ModeSwitchButton({ current }: { current: Mode }) {
  const switchTo = useSwitchTo()
  const target = OTHER[current]
  const tone = target === 'REQUEST' ? { bg: 'var(--brand-accent-soft)', fg: 'var(--accent-ink)' } : { bg: 'var(--brand-primary-soft)', fg: 'var(--primary-ink)' }
  return (
    <button
      type="button"
      aria-label={`${MODE_LABEL[target]}로 전환`}
      onClick={() => switchTo(target)}
      className="row"
      style={{ gap: 6, height: 40, padding: '0 14px', borderRadius: 999, background: tone.bg, color: tone.fg, fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 7h12l-3-3" />
        <path d="M17 17H5l3 3" />
      </svg>
      {SHORT[target]}
    </button>
  )
}

/** MY 화면의 모드 카드: 지금 모드 + 다른 모드로 바꾸기 */
export function ModeSwitchCard({ current }: { current: Mode }) {
  const switchTo = useSwitchTo()
  const target = OTHER[current]
  return (
    <div className="card" style={{ gap: 12, padding: 16 }}>
      <span className="t-body t-bold">지금은 {MODE_LABEL[current]}예요</span>
      <button type="button" className="btn btn--secondary" onClick={() => switchTo(target)} style={{ gap: 8 }}>
        <Icon name="chev" size={18} />
        {MODE_LABEL[target]}로 바꾸기
      </button>
    </div>
  )
}
