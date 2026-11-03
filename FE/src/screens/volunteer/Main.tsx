import { Link } from 'react-router-dom'
import { Button } from '../../components/common/Button'
import { Chip, FilterChips } from '../../components/common/Chip'
import { Icon, type IconName } from '../../components/common/Icon'
import { Avatar, Screen, Spacer, TopBar } from '../../components/common/Layout'
import { TabBar, VOLUNTEER_TABS } from '../../components/common/TabBar'
import { RequestCard } from '../../components/volunteer/RequestCard'
import { requests } from '../../data/mock'

const tabs = <TabBar tabs={VOLUNTEER_TABS} />

/** 03 홈 */
export function VolunteerHome() {
  return (
    <Screen footer={tabs} bodyStyle={{ gap: 18 }}>
      <div className="row row--between">
        <div className="col" style={{ gap: 2 }}>
          <span className="t-sub t-medium">안녕하세요, 지인님</span>
          <span className="t-h1">오늘도 함께 걸어요</span>
        </div>
        <Icon name="bell" size={26} />
      </div>

      <section
        className="col"
        style={{ gap: 10, padding: 20, borderRadius: 20, background: 'var(--brand-primary)', color: 'var(--text-on-primary)' }}
      >
        <div className="row row--between" style={{ fontSize: 14 }}>
          <span className="t-bold">오늘의 동행</span>
          <span className="t-medium">오전 9:30 픽업</span>
        </div>
        <span style={{ fontSize: 19, fontWeight: 700 }}>칠곡경북대학교병원 · 정형외과</span>
        <span style={{ fontSize: 14 }}>박○○ 어르신 · 칠곡군 왜관읍 출발</span>
        <Button variant="secondary" size="sm" to="/volunteer/progress">
          동행 시작하기
        </Button>
      </section>

      <div className="row row--between" style={{ paddingTop: 4 }}>
        <span className="t-h2">새 동행 요청 3건</span>
        <Link className="t-sub t-medium" to="/volunteer/requests">
          전체보기
        </Link>
      </div>
      {requests.slice(0, 2).map((r, i) => (
        <RequestCard key={r.id} request={r} urgent={i === 0} />
      ))}
    </Screen>
  )
}

/** 04 동행 요청 목록 */
export function VolunteerRequests() {
  return (
    <Screen footer={tabs} bodyStyle={{ gap: 14 }}>
      <div className="row row--between">
        <span className="t-h1">동행 요청</span>
        <Icon name="filter" />
      </div>
      <FilterChips options={['전체', '이번 주', '가까운 순', '휠체어 가능']} />
      <p className="t-caption">내 활동 지역(대구·칠곡·경산) 기준 요청이에요</p>
      {requests.map((r, i) => (
        <RequestCard key={r.id} request={r} urgent={i === 0} />
      ))}
    </Screen>
  )
}

function InfoRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
      <Icon name={icon} size={20} color="var(--brand-primary)" />
      <div className="col" style={{ gap: 2 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</span>
        <span className="t-body t-medium">{value}</span>
      </div>
    </div>
  )
}

/** 05 요청 상세 */
export function VolunteerRequestDetail() {
  return (
    <Screen>
      <TopBar title="동행 요청 상세" />
      <div className="col" style={{ gap: 8, paddingTop: 4 }}>
        <div className="row" style={{ gap: 6 }}>
          <Chip tone="orange">D-2</Chip>
          <Chip tone="gray">약 4시간</Chip>
        </div>
        <h1 className="t-h1">경북대학교병원 · 내과</h1>
      </div>
      <div className="card" style={{ gap: 14 }}>
        <InfoRow icon="calendar" label="일시" value="11월 5일(목) 오전 9:30 진료 · 7:40 픽업" />
        <InfoRow icon="pin" label="출발지" value="경북 군위군 효령면 자택" />
        <InfoRow icon="hospital" label="병원" value="경북대학교병원 본관 1층 내과" />
      </div>
      <div className="card" style={{ gap: 14 }}>
        <span style={{ fontSize: 16, fontWeight: 700 }}>김○○ 어르신 (82세)</span>
        <div className="row" style={{ gap: 6 }}>
          <Chip>보행 보조</Chip>
          <Chip>보호자 연락 가능</Chip>
        </div>
        <p className="t-sub">
          “무릎이 안 좋으셔서 계단이 있는 곳은 천천히 부탁드려요. 수납과 약 처방까지 함께해 주세요.” — 보호자 요청
        </p>
      </div>
      <div className="notice">
        <Icon name="clock" size={20} />
        봉사시간 4시간 인정 · 교통비 지원
      </div>
      <Spacer />
      <Button to="/volunteer/accepted">이 동행 맡을게요</Button>
    </Screen>
  )
}

/** 06 수락 완료 */
export function VolunteerAccepted() {
  const rows = [
    ['일시', '11월 5일(목) 7:40 픽업'],
    ['어르신', '김○○ 어르신'],
    ['병원', '경북대학교병원 내과'],
    ['보호자 연락처', '010-****-2381'],
  ]
  return (
    <Screen bodyStyle={{ paddingTop: 88, alignItems: 'center', gap: 14 }}>
      <div className="circle-icon" style={{ width: 96, height: 96, background: 'var(--brand-primary)' }}>
        <Icon name="check" size={48} color="#fff" strokeWidth={2.6} />
      </div>
      <div style={{ height: 8 }} />
      <h1 className="t-h1 center" style={{ fontSize: 24 }}>
        동행이 확정됐어요
      </h1>
      <p className="t-body center" style={{ color: 'var(--text-secondary)' }}>
        보호자에게 봉사자 정보가 전달됐어요.
        <br />
        하루 전날 오후 6시에 일정을 다시 알려드릴게요.
      </p>
      <div className="card" style={{ width: '100%', gap: 10 }}>
        {rows.map(([k, v]) => (
          <div key={k} className="row row--between" style={{ fontSize: 14 }}>
            <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
            <span className="t-bold">{v}</span>
          </div>
        ))}
      </div>
      <Spacer />
      <Button to="/volunteer/home">일정 확인하기</Button>
      <Button variant="ghost" to="/volunteer/home">
        홈으로
      </Button>
    </Screen>
  )
}

const STEPS: { label: string; sub?: string; state: 'done' | 'now' | 'todo' }[] = [
  { label: '픽업 완료', sub: '7:42 · 효령면 자택', state: 'done' },
  { label: '병원 도착', sub: '8:58 · 본관 정문', state: 'done' },
  { label: '접수 · 진료', sub: '진료 대기 3번째', state: 'now' },
  { label: '수납 · 약 처방', state: 'todo' },
  { label: '귀가 완료', state: 'todo' },
]

export function MapPlaceholder({ height, dashed = true }: { height: number; dashed?: boolean }) {
  // 실제 지도 SDK(카카오맵 등)로 교체할 자리표시
  return (
    <svg width="100%" height={height} viewBox={`0 0 390 ${height}`} preserveAspectRatio="xMidYMid slice" style={{ display: 'block', background: '#dee8e0' }}>
      <path d={`M0 ${height * 0.23} L390 ${height * 0.13} M0 ${height * 0.7} L390 ${height * 0.83} M120 0 L150 ${height} M290 0 L260 ${height}`} stroke="#fff" strokeWidth="10" />
      <path
        d={`M70 ${height * 0.8} C140 ${height * 0.77} 150 ${height * 0.53} 210 ${height * 0.47} S300 ${height * 0.3} 320 ${height * 0.2}`}
        stroke="#14735E"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={dashed ? '2 10' : undefined}
        fill="none"
      />
      <circle cx="70" cy={height * 0.8} r="9" fill="#fff" stroke="#14735E" strokeWidth="4" />
      {dashed ? (
        <>
          <circle cx="320" cy={height * 0.2} r="12" fill="#E8963A" />
          <circle cx="210" cy={height * 0.47} r="14" fill="#14735E" stroke="#fff" strokeWidth="4" />
        </>
      ) : (
        <circle cx="320" cy={height * 0.2} r="15" fill="#14735E" stroke="#fff" strokeWidth="4" />
      )}
    </svg>
  )
}

/** 07 진행 현황 · 실시간 위치 */
export function VolunteerProgress() {
  return (
    <Screen bodyStyle={{ padding: 0, gap: 0 }}>
      <div style={{ position: 'relative' }}>
        <MapPlaceholder height={300} />
        <div
          className="row"
          style={{ position: 'absolute', top: 16, left: 16, gap: 6, padding: '8px 12px', borderRadius: 999, background: '#fff', fontSize: 13, fontWeight: 700 }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--brand-accent)' }} />
          보호자에게 실시간 위치 공유 중
        </div>
      </div>
      <div className="col" style={{ flex: 1, gap: 16, padding: '24px 24px 24px', marginTop: -24, borderRadius: '24px 24px 0 0', background: 'var(--bg-canvas)' }}>
        <div className="row row--between">
          <div className="col" style={{ gap: 2 }}>
            <span style={{ fontSize: 19, fontWeight: 700 }}>김○○ 어르신 동행 중</span>
            <span className="t-sub">경북대학교병원 · 내과</span>
          </div>
          <Chip>진료 대기</Chip>
        </div>
        <ol className="card" style={{ gap: 0, margin: 0, listStyle: 'none' }}>
          {STEPS.map((s, i) => (
            <li key={s.label} className="row" style={{ gap: 14, alignItems: 'stretch' }}>
              <div className="col" style={{ alignItems: 'center' }}>
                <span
                  className="circle-icon"
                  style={{
                    width: 24,
                    height: 24,
                    background: s.state === 'todo' ? 'var(--line-default)' : s.state === 'now' ? 'var(--brand-accent)' : 'var(--brand-primary)',
                  }}
                >
                  {s.state === 'done' && <Icon name="check" size={14} color="#fff" strokeWidth={3} />}
                </span>
                {i < STEPS.length - 1 && (
                  <span style={{ width: 2, flex: 1, minHeight: 26, background: s.state === 'done' ? 'var(--brand-primary)' : 'var(--line-default)' }} />
                )}
              </div>
              <div className="col" style={{ paddingBottom: i < STEPS.length - 1 ? 8 : 0 }}>
                <span className="t-body" style={{ fontWeight: s.state === 'todo' ? 500 : 700, color: s.state === 'todo' ? 'var(--text-secondary)' : undefined }}>
                  {s.label}
                </span>
                {s.sub && <span style={{ fontSize: 12, color: s.state === 'now' ? 'var(--brand-accent)' : 'var(--text-secondary)' }}>{s.sub}</span>}
              </div>
            </li>
          ))}
        </ol>
        <Spacer />
        <div className="row" style={{ gap: 10 }}>
          <Button variant="ghost" style={{ width: 120 }}>
            보호자 연락
          </Button>
          <Button className="fill">진료 완료로 넘기기</Button>
        </div>
      </div>
    </Screen>
  )
}

/** 08 마이페이지 · 활동 내역 */
export function VolunteerMyPage() {
  const history: [string, string, string, string, 'green' | 'gray'][] = [
    ['10월 28일', '칠곡경북대병원 · 정형외과', '4시간', '완료', 'green'],
    ['10월 21일', '경북대학교병원 · 내과', '3.5시간', '완료', 'green'],
    ['10월 15일', '대구파티마병원 · 안과', '—', '취소됨', 'gray'],
  ]
  return (
    <Screen footer={tabs}>
      <div className="row" style={{ gap: 14 }}>
        <Avatar size={60} />
        <div className="col fill" style={{ gap: 2 }}>
          <span style={{ fontSize: 19, fontWeight: 700 }}>최지인 봉사자</span>
          <span className="t-caption">인증 봉사자 · 대구 북구</span>
        </div>
        <Icon name="gear" color="var(--text-secondary)" />
      </div>
      <div className="row" style={{ gap: 10 }}>
        {[
          ['12회', '누적 동행'],
          ['46시간', '봉사시간'],
          ['9개', '감사 메시지'],
        ].map(([v, l]) => (
          <div key={l} className="card fill" style={{ alignItems: 'center', gap: 2, padding: '14px 0', borderRadius: 16 }}>
            <span style={{ fontSize: 19, fontWeight: 700, color: 'var(--brand-primary)' }}>{v}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{l}</span>
          </div>
        ))}
      </div>
      <div className="row row--between">
        <span className="t-h2">활동 내역</span>
        <span className="t-sub t-medium">전체보기</span>
      </div>
      <div className="card card--list">
        {history.map(([d, h, t, s, tone]) => (
          <div key={d} className="list-item">
            <div className="col fill" style={{ gap: 2 }}>
              <span className="t-body t-bold">{h}</span>
              <span className="t-caption">
                {d} · {t}
              </span>
            </div>
            <Chip tone={tone}>{s}</Chip>
          </div>
        ))}
      </div>
      <div className="card card--list">
        {['봉사시간 확인서 발급', '알림 설정', '자주 묻는 질문'].map((m) => (
          <button key={m} type="button" className="list-item row--between" style={{ width: '100%', paddingRight: 10 }}>
            <span className="t-body t-medium">{m}</span>
            <Icon name="chev" size={20} color="var(--icon-muted)" />
          </button>
        ))}
      </div>
    </Screen>
  )
}
