import { Icon } from './Icon'

/**
 * 고향 연결 배지: 봉사자 고향이 동행받는 분 거주 시·군과 같을 때만 보여요.
 * 따뜻한 코랄 톤이라 청록의 '재학 인증' 배지와 구분돼요.
 */
export function HometownBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <span
      className="row"
      style={{
        gap: 4,
        padding: size === 'sm' ? '3px 9px 3px 7px' : '4px 10px',
        borderRadius: 999,
        background: 'var(--brand-accent-soft)',
        color: 'var(--accent-ink)',
        fontSize: size === 'sm' ? 12 : 13,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon name="home" size={size === 'sm' ? 13 : 14} />
      고향 연결
    </span>
  )
}
