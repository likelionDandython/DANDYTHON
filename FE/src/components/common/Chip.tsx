import { useState } from 'react'
import { Icon } from './Icon'

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
              {on && <Icon name="check" size={15} strokeWidth={2.6} />}
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
