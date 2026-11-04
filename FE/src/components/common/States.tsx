import type { ReactNode } from 'react'
import { Button } from './Button'
import { Character, CharacterPair } from './Character'

/** 불러오는 중: 회색 카드 자리 (화면이 덜컹거리지 않게) */
export function LoadingState({ rows = 2 }: { rows?: number }) {
  return (
    <div className="col" style={{ gap: 10 }} aria-busy="true" aria-label="불러오는 중">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton" style={{ height: i === 0 ? 88 : 64 }} />
      ))}
    </div>
  )
}

/** 빈 화면: 캐릭터 + 한 줄 안내 + (선택) 버튼 */
export function EmptyState({ title, desc, action, waiting = false }: { title: string; desc?: ReactNode; action?: { label: string; to: string }; waiting?: boolean }) {
  return (
    <div className="col" style={{ alignItems: 'center', gap: 8, padding: '12px 0', textAlign: 'center' }}>
      <CharacterPair width={180} waiting={waiting} />
      <span className="t-h2">{title}</span>
      {desc && <span className="t-sub">{desc}</span>}
      {action && (
        <Button variant="secondary" size="sm" to={action.to}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

/** 오류: 난처한 캐릭터 + 문구 + 다시 시도 */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="col" style={{ alignItems: 'center', gap: 8, padding: '12px 0', textAlign: 'center' }}>
      <Character who="elder" size={72} title="난처한 표정의 동행받는 분 캐릭터" />
      <span className="t-body t-bold">{message}</span>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          다시 시도하기
        </Button>
      )}
    </div>
  )
}

/** 화면에서 쓰는 한 줄 상태: 불러오는 중 / 오류 */
export function Status({ loading, error, onRetry }: { loading: boolean; error: string | null; onRetry?: () => void }) {
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={onRetry ?? (() => window.location.reload())} />
  return null
}
