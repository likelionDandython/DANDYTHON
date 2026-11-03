import { useNavigate } from 'react-router-dom'
import { Chip } from '../common/Chip'
import { Icon } from '../common/Icon'
import { NEED_LABEL } from '../../api/labels'
import type { BoardItem } from '../../api/types'
import { dDay, formatDateTime } from '../../lib/format'

/** Figma: RequestCard — 봉사자에게 보이는 동행 요청 카드 */
export function RequestCard({ request }: { request: BoardItem }) {
  const navigate = useNavigate()
  const needs = request.needs.map((n) => NEED_LABEL[n]).join(' · ')
  return (
    <button type="button" className="request-card" onClick={() => navigate(`/volunteer/request-detail?requestId=${request.requestId}`)}>
      <div className="row row--between" style={{ width: '100%' }}>
        <span className="row" style={{ gap: 6 }}>
          <Chip tone={request.urgent ? 'orange' : 'green'}>{request.urgent ? `급해요 ${dDay(request.date)}` : dDay(request.date)}</Chip>
          {request.applied && <Chip tone="gray">신청함</Chip>}
        </span>
        <span className="t-sub t-medium">{formatDateTime(request.date, request.meetTime)}</span>
      </div>
      <span style={{ fontSize: 18, fontWeight: 700 }}>
        {request.hospitalName} · {request.department}
      </span>
      <span className="request-card__meta">
        <Icon name="pin" size={18} color="var(--text-secondary)" />
        출발 · {request.region}
      </span>
      <span className="request-card__meta">
        <Icon name="user" size={18} color="var(--text-secondary)" />
        {needs} · 약 {request.expectedHours}시간{request.twoRecommended ? ' · 2인 권장' : ''}
      </span>
    </button>
  )
}
