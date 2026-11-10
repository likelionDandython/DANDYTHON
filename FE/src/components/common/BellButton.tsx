import { useNavigate } from 'react-router-dom'
import { notificationApi } from '../../design/notificationsApi'
import { useApi } from '../../hooks/useApi'
import { Icon } from './Icon'
import '../../design/styles'

/**
 * 홈 상단 벨 아이콘. 읽지 않은 알림이 있으면 빨간 점이 떠요 (unreadCount > 0).
 * 서버 호출이 실패해도 벨은 그대로 눌러서 목록으로 갈 수 있어요.
 *   <BellButton />   // 요청자(동행 요청 모드) 홈 상단 오른쪽에 넣어 쓰세요
 */
export function BellButton({ to = '/guardian/notifications' }: { to?: string }) {
  const navigate = useNavigate()
  const list = useApi(() => notificationApi.list(), [])
  const unread = list.data?.unreadCount ?? 0
  return (
    <button
      type="button"
      className="bell"
      aria-label={unread > 0 ? `알림, 안 읽은 알림 ${unread}개` : '알림'}
      onClick={() => navigate(to)}
    >
      <Icon name="bell" size={26} />
      {unread > 0 && <span className="bell__dot" aria-hidden="true" />}
    </button>
  )
}
