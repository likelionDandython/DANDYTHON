/** 감사 메시지(VOL-03) 한 번에 고르기. 누르면 입력칸에 그대로 들어가고, 입력칸에서 고칠 수 있어요. */
export const THANKS_PRESETS = [
  '덕분에 마음 편히 일했어요, 고맙습니다',
  '가족처럼 따뜻하게 챙겨주셔서 감사해요',
  '진료 내용을 자세히 적어주셔서 큰 도움이 됐어요',
] as const

export function ThanksPresets({ value, onPick }: { value: string; onPick: (text: string) => void }) {
  return (
    <div className="col" style={{ gap: 8 }} role="group" aria-label="자주 쓰는 감사 메시지">
      <span className="t-caption" style={{ fontSize: 14 }}>
        눌러서 바로 보낼 수 있어요
      </span>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        {THANKS_PRESETS.map((t) => {
          const on = value === t
          return (
            <button
              key={t}
              type="button"
              aria-pressed={on}
              onClick={() => onPick(on ? '' : t)}
              style={{
                minHeight: 44,
                padding: '8px 14px',
                borderRadius: 22,
                border: on ? '1.5px solid var(--brand-primary)' : '1.5px solid var(--line-default)',
                background: on ? 'var(--brand-primary-soft)' : 'var(--bg-surface)',
                color: on ? 'var(--primary-ink)' : 'var(--text-primary)',
                font: 'inherit',
                fontSize: 15,
                fontWeight: on ? 700 : 500,
                lineHeight: 1.4,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          )
        })}
      </div>
    </div>
  )
}
