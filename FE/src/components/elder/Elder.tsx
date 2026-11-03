import { useEffect, useRef, useState, type InputHTMLAttributes } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, type IconName } from '../common/Icon'
import { Progress } from '../common/Layout'

/** 어르신용 상단: 큰 '뒤로' + n/3 + 진행 막대 + 큰 제목 */
export function ElderStepHeader({ step, total = 3, title }: { step: number; total?: number; title: string }) {
  const navigate = useNavigate()
  return (
    <>
      <div className="e-top-bar">
        <button className="top-bar__back" onClick={() => navigate(-1)}>
          <Icon name="back" size={30} strokeWidth={2.4} />
          뒤로
        </button>
        <span className="spacer" />
        <span className="t-primary t-bold">
          {step} / {total}
        </span>
      </div>
      <Progress step={step} total={total} large />
      <h1 className="e-title" style={{ whiteSpace: 'pre-line' }}>
        {title}
      </h1>
    </>
  )
}

export function ElderBack() {
  const navigate = useNavigate()
  return (
    <div className="e-top-bar">
      <button className="top-bar__back" onClick={() => navigate(-1)}>
        <Icon name="back" size={30} strokeWidth={2.4} />
        뒤로
      </button>
    </div>
  )
}

type ChoiceProps = {
  title: string
  sub?: string
  selected: boolean
  onSelect: () => void
}

/** Figma: ChoiceRow (Selected = Yes | No) */
export function ChoiceRow({ title, sub, selected, onSelect }: ChoiceProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      className={`choice ${selected ? 'choice--on' : ''}`}
      onClick={onSelect}
    >
      <span className="col fill" style={{ gap: 2 }}>
        <span className="choice__title">{title}</span>
        {sub && <span className="choice__sub">{sub}</span>}
      </span>
      <span className="choice__radio">
        {selected && <Icon name="check" size={20} color="#fff" strokeWidth={3} />}
      </span>
    </button>
  )
}

/**
 * Figma: ChoiceRow/기타
 * 선택하면 '기타' 옆에 직접 적는 칸이 열려요.
 */
export function ChoiceRowOther({
  selected,
  onSelect,
  value,
  onChange,
}: {
  selected: boolean
  onSelect: () => void
  value: string
  onChange: (v: string) => void
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const wasSelected = useRef(selected)
  // 사용자가 '기타'를 새로 고른 순간에만 입력칸에 포커스
  useEffect(() => {
    if (selected && !wasSelected.current) inputRef.current?.focus()
    wasSelected.current = selected
  }, [selected])
  return (
    <div
      className={`choice choice--other ${selected ? 'choice--on' : ''}`}
      role="checkbox"
      aria-checked={selected}
      tabIndex={selected ? -1 : 0}
      onClick={() => !selected && onSelect()}
      onKeyDown={(e) => {
        if (!selected && (e.key === 'Enter' || e.key === ' ')) onSelect()
      }}
      style={{ cursor: selected ? 'default' : 'pointer' }}
    >
      <span className="choice__title" style={{ flex: selected ? '0 0 auto' : 1 }}>
        기타
      </span>
      {selected && (
        <textarea
          ref={inputRef}
          className="choice__other-input"
          placeholder="직접 적어주세요"
          value={value}
          rows={2}
          onChange={(e) => onChange(e.target.value)}
          aria-label="기타 내용"
        />
      )}
      <button
        type="button"
        className="choice__radio"
        aria-label={selected ? '기타 선택 해제' : '기타 선택'}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
      >
        {selected && <Icon name="check" size={20} color="#fff" strokeWidth={3} />}
      </button>
    </div>
  )
}

/** 여러 개 고르는 ChoiceRow 묶음 (+ 선택적으로 '기타') */
export function ChoiceList({
  options,
  defaultSelected = [],
  withOther,
  defaultOther,
}: {
  options: { title: string; sub?: string }[]
  defaultSelected?: string[]
  withOther?: boolean
  defaultOther?: string
}) {
  const [selected, setSelected] = useState<string[]>(defaultSelected)
  const [otherOn, setOtherOn] = useState(defaultOther !== undefined)
  const [other, setOther] = useState(defaultOther ?? '')
  const toggle = (t: string) => setSelected((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))
  return (
    <>
      {options.map((o) => (
        <ChoiceRow key={o.title} {...o} selected={selected.includes(o.title)} onSelect={() => toggle(o.title)} />
      ))}
      {withOther && (
        <ChoiceRowOther selected={otherOn} onSelect={() => setOtherOn(!otherOn)} value={other} onChange={setOther} />
      )}
    </>
  )
}

/** 하나만 고르는 ChoiceRow 묶음 */
export function SingleChoice({ options, defaultIndex = 0 }: { options: { title: string; sub?: string }[]; defaultIndex?: number }) {
  const [index, setIndex] = useState(defaultIndex)
  return (
    <>
      {options.map((o, i) => (
        <ChoiceRow key={o.title} {...o} selected={i === index} onSelect={() => setIndex(i)} />
      ))}
    </>
  )
}

/** 어르신용 큰 입력칸 */
export function ElderField({
  label,
  icon,
  ...input
}: InputHTMLAttributes<HTMLInputElement> & { label: string; icon?: IconName }) {
  return (
    <label className="e-field">
      <span className="e-label">{label}</span>
      <span className="e-field__box">
        {icon && <Icon name={icon} size={26} color="var(--brand-primary)" />}
        <input className="e-field__input" {...input} />
      </span>
    </label>
  )
}
