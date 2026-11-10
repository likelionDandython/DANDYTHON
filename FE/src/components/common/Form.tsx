import { useEffect, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import { Icon, type IconName } from './Icon'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  icon?: IconName
  suffix?: ReactNode
  /** 오른쪽 화살표 (선택형 필드) */
  chevron?: boolean
}

/** 라벨 + 입력칸 */
export function Field({ label, icon, suffix, chevron, ...input }: FieldProps) {
  return (
    <label className="field">
      <span className="t-label">{label}</span>
      <span className="field__box">
        {icon && <Icon name={icon} size={20} color="var(--brand-primary)" />}
        <input className="field__input" {...input} />
        {suffix}
        {chevron && <Icon name="chev" size={18} color="var(--icon-muted)" />}
      </span>
    </label>
  )
}

/** 라벨 + 선택 상자 (Field 와 같은 모양) */
export function SelectField({
  label,
  icon,
  options,
  placeholder,
  ...select
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  icon?: IconName
  options: { value: string | number; label: string }[]
  placeholder?: string
}) {
  return (
    <label className="field">
      <span className="t-label">{label}</span>
      <span className="field__box">
        {icon && <Icon name={icon} size={20} color="var(--brand-primary)" />}
        <select className="field__input" {...select}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  )
}

/** API 오류·안내 문구 */
export function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) return null
  return (
    <p role="alert" className="t-caption" style={{ color: '#C0392B', margin: 0 }}>
      {children}
    </p>
  )
}

export function Checkbox({
  children,
  defaultChecked = false,
  strong,
}: {
  children: ReactNode
  defaultChecked?: boolean
  strong?: boolean
}) {
  const [on, setOn] = useState(defaultChecked)
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      className={`check ${strong ? 'check--strong' : ''}`}
      onClick={() => setOn(!on)}
    >
      <span className={`check__box ${on ? 'check__box--on' : ''}`}>
        {on && <Icon name="check" size={14} color="#fff" strokeWidth={3} />}
      </span>
      {children}
    </button>
  )
}

function Box({ on }: { on: boolean }) {
  return (
    <span className={`check__box ${on ? 'check__box--on' : ''}`}>
      {on && <Icon name="check" size={14} color="#fff" strokeWidth={3} />}
    </span>
  )
}

/** 약관 동의 묶음: '전체 동의'를 누르면 전부 켜지고 꺼져요 */
export function Agreements({ items, onChange }: { items: string[]; onChange?: (checked: boolean[]) => void }) {
  const [checked, setCheckedState] = useState<boolean[]>(items.map(() => true))
  const setChecked = (next: boolean[] | ((c: boolean[]) => boolean[])) => {
    const value = typeof next === 'function' ? next(checked) : next
    setCheckedState(value)
    onChange?.(value)
  }
  // 처음 상태(전부 동의)를 부모가 알 수 있게 한 번 알려줘요
  useEffect(() => {
    onChange?.(checked)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const all = checked.every(Boolean)
  return (
    <div className="card" style={{ padding: 16, gap: 0 }}>
      <button
        type="button"
        role="checkbox"
        aria-checked={all}
        className="check check--strong"
        onClick={() => setChecked(items.map(() => !all))}
      >
        <Box on={all} />
        전체 동의
      </button>
      {items.map((label, i) => (
        <button
          key={label}
          type="button"
          role="checkbox"
          aria-checked={checked[i]}
          className="check"
          onClick={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
        >
          <Box on={checked[i]} />
          {label}
        </button>
      ))}
    </div>
  )
}

export function Switch({ defaultOn = false, label }: { defaultOn?: boolean; label: string }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`switch ${on ? 'switch--on' : ''}`}
      onClick={() => setOn(!on)}
    />
  )
}

/** 하나만 고르는 설명형 선택 카드 */
export function OptionCards({
  options,
  defaultIndex = 0,
}: {
  options: { title: string; sub: string }[]
  defaultIndex?: number
}) {
  const [index, setIndex] = useState(defaultIndex)
  return (
    <div className="col" role="radiogroup" style={{ gap: 10 }}>
      {options.map((o, i) => {
        const on = i === index
        return (
          <button
            key={o.title}
            type="button"
            role="radio"
            aria-checked={on}
            className={`option-card ${on ? 'option-card--on' : ''}`}
            onClick={() => setIndex(i)}
          >
            <span className="col fill" style={{ gap: 2 }}>
              <span className="t-body t-bold">{o.title}</span>
              <span className="t-caption">{o.sub}</span>
            </span>
            <span className={`radio-dot ${on ? 'radio-dot--on' : ''}`}>
              {on && <Icon name="check" size={14} color="#fff" strokeWidth={3} />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
