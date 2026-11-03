import { useNavigate } from 'react-router-dom'
import { Chip } from '../common/Chip'
import { Icon } from '../common/Icon'
import type { CompanionRequest } from '../../data/mock'

/** Figma: RequestCard — 봉사자에게 보이는 동행 요청 카드 */
export function RequestCard({ request, urgent }: { request: CompanionRequest; urgent?: boolean }) {
  const navigate = useNavigate()
  return (
    <button type="button" className="request-card" onClick={() => navigate('/volunteer/request-detail')}>
      <div className="row row--between" style={{ width: '100%' }}>
        <Chip tone={urgent ? 'orange' : 'green'}>{request.dDay}</Chip>
        <span className="t-sub t-medium">{request.date}</span>
      </div>
      <span style={{ fontSize: 18, fontWeight: 700 }}>{request.hospital}</span>
      <span className="request-card__meta">
        <Icon name="pin" size={18} color="var(--text-secondary)" />
        {request.from}
      </span>
      <span className="request-card__meta">
        <Icon name="user" size={18} color="var(--text-secondary)" />
        {request.elder}
      </span>
    </button>
  )
}
