import { useState } from 'react'

/** Figma: Chip (Tone = Green | Orange | Gray) — 상태 표시용 */
export function Chip({ tone = 'green', children }: { tone?: 'green' | 'orange' | 'gray'; children: string }) {
  return <span className={`chip chip--${tone}`}>{children}</span>
}

/** 여러 개 고를 수 있는 칩 묶음 */
export function ToggleChipGroup({
  label,
  options,
  defaultSelected = [],
  onChange,
}: {
  label?: string
  options: string[]
  defaultSelected?: string[]
  /** 선택이 바뀔 때마다 현재 선택 목록을 알려줘요 */
  onChange?: (selected: string[]) => void
}) {
  const [selected, setSelected] = useState<string[]>(defaultSelected)
  const toggle = (o: string) => {
    const next = selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o]
    setSelected(next)
    onChange?.(next)
  }
  return (
    <div className="field" style={{ gap: 8 }}>
      {label && <span className="t-label">{label}</span>}
      <div className="chip-group">
        {options.map((o) => {
          const on = selected.includes(o)
          return (
            <button
              key={o}
              type="button"
              className={`toggle-chip ${on ? 'toggle-chip--on' : ''}`}
              aria-pressed={on}
              onClick={() => toggle(o)}
            >
              {o}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** 하나만 고르는 필터 칩 (목록 상단) */
export function FilterChips({
  options,
  defaultValue,
  onChange,
}: {
  options: string[]
  defaultValue?: string
  onChange?: (value: string) => void
}) {
  const [value, setValueState] = useState(defaultValue ?? options[0])
  const setValue = (v: string) => {
    setValueState(v)
    onChange?.(v)
  }
  return (
    <div className="chip-group" style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className={`filter-chip ${value === o ? 'filter-chip--on' : ''}`}
          aria-pressed={value === o}
          onClick={() => setValue(o)}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

/** 하나만 고르는 칩 묶음 (시안의 만나는 곳·성별·인원 선택) */
export function ChoiceChips({
  label,
  options,
  value,
  onChange,
  hint,
  stretch,
}: {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  hint?: string
  /** 칩을 가로로 꽉 채워요 (나 / 가족) */
  stretch?: boolean
}) {
  return (
    <fieldset className="field" style={{ margin: 0, padding: 0, border: 0 }}>
      <legend className="t-label" style={{ padding: 0, marginBottom: 8 }}>
        {label}
      </legend>
      <div className="chip-group">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            className={`toggle-chip ${value === o.value ? 'toggle-chip--on' : ''}`}
            style={stretch ? { flex: 1, justifyContent: 'center' } : undefined}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      {hint && (
        <p className="t-caption" style={{ margin: '8px 0 0' }}>
          {hint}
        </p>
      )}
    </fieldset>
  )
}
