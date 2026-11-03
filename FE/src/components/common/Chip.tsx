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
}: {
  label?: string
  options: string[]
  defaultSelected?: string[]
}) {
  const [selected, setSelected] = useState<string[]>(defaultSelected)
  const toggle = (o: string) =>
    setSelected((prev) => (prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]))
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
export function FilterChips({ options, defaultValue }: { options: string[]; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? options[0])
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
