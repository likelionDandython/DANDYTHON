import type { CSSProperties, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'

/** Figma: StatusBar */
export function StatusBar() {
  return (
    <div className="status-bar" aria-hidden="true">
      <span>9:41</span>
      <span className="status-bar__battery" />
    </div>
  )
}

type ScreenProps = {
  children: ReactNode
  /** 화면 아래에 붙는 탭바 등 */
  footer?: ReactNode
  variant?: 'default' | 'elder'
  bodyStyle?: CSSProperties
}

/** 390×844 모바일 프레임. 모바일 폭에서는 화면 전체를 채워요. */
export function Screen({ children, footer, variant = 'default', bodyStyle }: ScreenProps) {
  return (
    <div className={`screen ${variant === 'elder' ? 'elder' : ''}`}>
      <StatusBar />
      <main className="screen__body" style={bodyStyle}>
        {children}
      </main>
      {footer}
    </div>
  )
}

export function Spacer() {
  return <div className="spacer" />
}

/** 뒤로가기 + 제목 (+ 오른쪽 요소) */
export function TopBar({ title, right }: { title?: string; right?: ReactNode }) {
  const navigate = useNavigate()
  return (
    <div className="top-bar">
      <button className="top-bar__back" onClick={() => navigate(-1)} aria-label="뒤로">
        <Icon name="back" size={28} />
      </button>
      {title && <span>{title}</span>}
      {right && (
        <>
          <span className="spacer" />
          {right}
        </>
      )}
    </div>
  )
}

/** 단계 진행 막대 (n / total) */
export function Progress({ step, total = 3, large }: { step: number; total?: number; large?: boolean }) {
  return (
    <div className={`progress ${large ? 'e-progress' : ''}`} role="progressbar" aria-valuenow={step} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`progress__seg ${i < step ? 'progress__seg--on' : ''}`} />
      ))}
    </div>
  )
}

/** 단계형 폼 상단: 뒤로 + 제목 + n/3 + 진행 막대 */
export function StepHeader({ title, step, total = 3 }: { title: string; step: number; total?: number }) {
  return (
    <>
      <TopBar
        title={title}
        right={
          <span className="t-primary" style={{ fontSize: 15 }}>
            {step} / {total}
          </span>
        }
      />
      <Progress step={step} total={total} />
    </>
  )
}

export function Avatar({ size, icon = 'user' as const }: { size: number; icon?: 'user' }) {
  return (
    <div className="avatar" style={{ width: size, height: size }}>
      <Icon name={icon} size={size * 0.5} color="var(--brand-primary)" strokeWidth={1.8} />
    </div>
  )
}
