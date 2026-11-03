import { NavLink } from 'react-router-dom'
import { Icon, type IconName } from './Icon'

export type Tab = { label: string; icon: IconName; to: string }

/** Figma: TabBar (봉사자) / TabBar/보호자 */
export function TabBar({ tabs }: { tabs: Tab[] }) {
  return (
    <nav className="tab-bar">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) => `tab-bar__item ${isActive ? 'tab-bar__item--active' : ''}`}
        >
          {({ isActive }) => (
            <>
              <Icon name={t.icon} size={24} color={isActive ? 'var(--brand-primary)' : 'var(--icon-muted)'} />
              {t.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export const VOLUNTEER_TABS: Tab[] = [
  { label: '홈', icon: 'home', to: '/volunteer/home' },
  { label: '요청', icon: 'list', to: '/volunteer/requests' },
  { label: '활동', icon: 'clock', to: '/volunteer/progress' },
  { label: 'MY', icon: 'user', to: '/volunteer/my' },
]

export const GUARDIAN_TABS: Tab[] = [
  { label: '홈', icon: 'home', to: '/guardian/home' },
  { label: '일정', icon: 'calendar', to: '/guardian/live' },
  { label: '기록', icon: 'doc', to: '/guardian/records' },
  { label: 'MY', icon: 'user', to: '/guardian/my' },
]
