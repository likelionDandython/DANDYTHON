import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'

type BaseProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  children: ReactNode
  /** 누르면 이동할 경로 */
  to?: string
}

function useTo(to?: string, onClick?: BaseProps['onClick']): BaseProps['onClick'] {
  const navigate = useNavigate()
  if (!to) return onClick
  return (e) => {
    onClick?.(e)
    navigate(to)
  }
}

/** Figma: Button (Type = Primary | Secondary | Ghost) */
export function Button({
  variant = 'primary',
  size,
  to,
  onClick,
  className = '',
  children,
  ...rest
}: BaseProps & { variant?: 'primary' | 'secondary' | 'ghost'; size?: 'sm' }) {
  const handle = useTo(to, onClick)
  return (
    <button
      type="button"
      className={`btn btn--${variant} ${size ? `btn--${size}` : ''} ${className}`}
      onClick={handle}
      {...rest}
    >
      {children}
    </button>
  )
}

/** Figma: BigButton (어르신용, Type = Primary | Call | Ghost) */
export function BigButton({
  variant = 'primary',
  to,
  onClick,
  children,
  ...rest
}: BaseProps & { variant?: 'primary' | 'call' | 'ghost' }) {
  const handle = useTo(to, onClick)
  return (
    <button type="button" className={`big-btn big-btn--${variant}`} onClick={handle} {...rest}>
      {variant === 'call' && <Icon name="phone" size={26} strokeWidth={2.2} />}
      {children}
    </button>
  )
}
