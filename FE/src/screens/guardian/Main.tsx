import { Link } from 'react-router-dom'
import { Button } from '../../components/common/Button'
import { Chip, FilterChips, ToggleChipGroup } from '../../components/common/Chip'
import { Field, Switch } from '../../components/common/Form'
import { Icon, type IconName } from '../../components/common/Icon'
import { Avatar, Screen, Spacer, TopBar } from '../../components/common/Layout'
import { GUARDIAN_TABS, TabBar } from '../../components/common/TabBar'
import { MapPlaceholder } from '../volunteer/Main'

const tabs = <TabBar tabs={GUARDIAN_TABS} />

/** G01 홈 */
export function GuardianHome() {
  const progress = [1, 1, 0.5, 0, 0]
  return (
    <Screen footer={tabs}>
      <div className="row row--between">
        <button type="button" className="row" style={{ gap: 6, padding: '8px 10px 8px 12px', borderRadius: 999, background: '#fff', boxShadow: 'inset 0 0 0 1px var(--line-default)', fontSize: 15, fontWeight: 700 }}>
          어머니 · 김○○
          <Icon name="chevDown" size={18} color="var(--text-secondary)" />
        </button>
        <Icon name="bell" size={26} />
      </div>

      <section className="col" style={{ gap: 12, padding: 20, borderRadius: 20, background: 'var(--brand-primary)', color: '#fff' }}>
        <div className="row row--between" style={{ fontSize: 14 }}>
          <span className="row t-bold" style={{ gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--brand-accent)' }} />
            지금 동행 중
          </span>
          <span style={{ fontSize: 13 }}>오전 9:12 업데이트</span>
        </div>
        <span style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.4 }}>
          경북대학교병원에서
          <br />
          진료를 기다리고 있어요
        </span>
        <div className="row" style={{ gap: 4 }}>
          {progress.map((v, i) => (
            <span
              key={i}
              style={{ flex: 1, height: 6, borderRadius: 3, background: v === 1 ? '#fff' : v === 0.5 ? 'var(--brand-accent)' : 'rgba(255,255,255,0.3)' }}
            />
          ))}
        </div>
        <div className="row row--between" style={{ fontSize: 12, fontWeight: 500 }}>
          {['픽업', '도착', '진료', '수납', '귀가'].map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
        <Button variant="secondary" size="sm" to="/guardian/live">
          실시간으로 보기
        </Button>
      </section>

      <div className="row row--between">
        <span className="t-h2">다가오는 일정</span>
        <span className="t-sub t-medium">전체보기</span>
      </div>
      <div className="card card--list">
        {(
          [
            ['11.19', '화', '칠곡경북대병원 · 정형외과', '봉사자 찾는 중', 'orange'],
            ['12.3', '수', '경북대학교병원 · 내과', '신청 예정', 'gray'],
          ] as const
        ).map(([d, w, h, s, tone]) => (
          <div key={d} className="list-item" style={{ gap: 14 }}>
            <div className="col" style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--bg-canvas)', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{d}</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>{w}</span>
            </div>
            <div className="col fill" style={{ gap: 4, alignItems: 'flex-start' }}>
              <span className="t-body t-bold">{h}</span>
              <Chip tone={tone}>{s}</Chip>
            </div>
          </div>
        ))}
      </div>
      <Spacer />
      <Button to="/guardian/apply">새 동행 신청하기</Button>
    </Screen>
  )
}

/** G02 동행 대신 신청 */
export function GuardianApply() {
  return (
    <Screen>
      <TopBar title="동행 신청" />
      <Field label="누구와 동행하나요" icon="user" defaultValue="어머니 · 김○○ (82세)" readOnly chevron />
      <Field label="병원" icon="hospital" defaultValue="칠곡경북대학교병원 · 정형외과" readOnly chevron />
      <Field label="날짜·진료 시간" icon="calendar" defaultValue="11월 19일(화) 오전 10:00" readOnly chevron />
      <Field label="출발 주소" icon="pin" defaultValue="경북 칠곡군 왜관읍 ○○로 12" readOnly chevron />
      <ToggleChipGroup
        label="필요한 도움"
        options={['보행 보조', '휠체어', '수납·약 수령', '진료 내용 기록']}
        defaultSelected={['보행 보조', '수납·약 수령', '진료 내용 기록']}
      />
      <label className="field">
        <span className="t-label">봉사자에게 전할 말</span>
        <textarea className="textarea" defaultValue="귀가 어두우셔서 크게 천천히 말씀해 주세요." />
      </label>
      <Spacer />
      <Button to="/guardian/confirmed">신청하기</Button>
    </Screen>
  )
}

/** G03 봉사자 확정 */
export function GuardianConfirmed() {
  return (
    <Screen>
      <TopBar title="동행 확정" />
      <div className="col" style={{ gap: 4 }}>
        <h1 className="t-h1">
          어머니와 함께할
          <br />
          봉사자가 정해졌어요
        </h1>
        <p className="t-sub">11월 19일(화) 오전 9:10 댁 앞으로 찾아가요</p>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div className="row" style={{ gap: 14 }}>
          <Avatar size={64} />
          <div className="col" style={{ gap: 2 }}>
            <span style={{ fontSize: 19, fontWeight: 700 }}>최지인 봉사자</span>
            <span className="t-sub">경북대학교 · 동행 12회</span>
          </div>
        </div>
        <div className="col" style={{ gap: 10, paddingTop: 4 }}>
          {['신원 확인 완료', '동행 봉사 교육 이수', '지난 동행 만족 12 / 12'].map((s) => (
            <span key={s} className="row t-body t-medium" style={{ gap: 8 }}>
              <Icon name="shield" size={20} color="var(--brand-primary)" />
              {s}
            </span>
          ))}
        </div>
        <div className="col" style={{ gap: 6, padding: '14px 16px', borderRadius: 14, background: 'var(--bg-canvas)' }}>
          <span className="t-sub" style={{ color: 'var(--text-primary)' }}>
            “진료 내용을 꼼꼼히 적어 보내주셔서 멀리 있어도 안심됐어요.”
          </span>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>10월 · 다른 보호자 후기</span>
        </div>
      </div>
      <div className="notice">
        <Icon name="bell" size={20} />
        픽업·병원 도착·진료 완료 때마다 알려드려요
      </div>
      <Spacer />
      <div className="row" style={{ gap: 10 }}>
        <Button variant="ghost" style={{ width: 120 }}>
          메시지
        </Button>
        <Button className="fill" to="/guardian/home">
          일정 확인하기
        </Button>
      </div>
    </Screen>
  )
}

/** G04 실시간 동행 현황 */
export function GuardianLive() {
  const feed: [string, string, 'now' | 'done'][] = [
    ['9:12', '접수 마쳤어요. 대기 3번째예요.', 'now'],
    ['8:58', '병원에 도착했어요. 어머니 컨디션 좋으세요.', 'done'],
    ['7:42', '댁에서 함께 출발했어요.', 'done'],
  ]
  return (
    <Screen bodyStyle={{ padding: 0, gap: 0 }}>
      <div style={{ position: 'relative' }}>
        <MapPlaceholder height={250} dashed={false} />
        <Link
          to="/guardian/home"
          className="row"
          style={{ position: 'absolute', top: 16, left: 16, gap: 8, padding: '8px 14px 8px 12px', borderRadius: 999, background: '#fff', fontSize: 14, fontWeight: 700 }}
        >
          <Icon name="back" size={20} />
          어머니 동행 현황
        </Link>
      </div>
      <div className="col" style={{ flex: 1, gap: 14, padding: '20px 24px 24px' }}>
        <div className="row row--between">
          <div className="col" style={{ gap: 2 }}>
            <span style={{ fontSize: 20, fontWeight: 700 }}>진료 대기 중</span>
            <span className="t-sub">경북대학교병원 본관 · 대기 3번째</span>
          </div>
          <Chip>안전하게 동행 중</Chip>
        </div>
        <div className="card card--list">
          {feed.map(([t, m, s]) => (
            <div key={t} className="list-item" style={{ alignItems: 'flex-start', padding: '12px 14px' }}>
              <span className="circle-icon" style={{ width: 22, height: 22, background: s === 'now' ? 'var(--brand-accent)' : 'var(--brand-primary)' }}>
                <Icon name="check" size={13} color="#fff" strokeWidth={3} />
              </span>
              <div className="col fill" style={{ gap: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: s === 'now' ? 'var(--brand-accent)' : 'var(--text-secondary)' }}>{t}</span>
                <span className="t-body t-medium">{m}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="t-caption" style={{ fontSize: 12 }}>
          최지인 봉사자가 남긴 소식이에요
        </p>
        <Spacer />
        <div className="row" style={{ gap: 10 }}>
          <Button variant="ghost" style={{ width: 120 }}>
            메시지
          </Button>
          <Button className="fill">봉사자에게 전화</Button>
        </div>
      </div>
    </Screen>
  )
}

/** G05 진료 결과 리포트 */
export function GuardianReport() {
  const facts: [IconName, string, string][] = [
    ['calendar', '다음 진료', '12월 3일(수) 오전 9:30'],
    ['pill', '처방약', '혈압약 4주분 · 하루 1번 아침'],
    ['won', '수납', '8,700원 (어머니 카드 결제)'],
  ]
  return (
    <Screen>
      <TopBar title="오늘 진료 기록" />
      <div className="col" style={{ gap: 6, alignItems: 'flex-start' }}>
        <Chip>귀가 완료 12:48</Chip>
        <h1 className="t-h1">
          어머니 모시고 무사히
          <br />
          댁에 도착했어요
        </h1>
      </div>
      <div className="card" style={{ gap: 8 }}>
        <span className="t-bold t-primary" style={{ fontSize: 13 }}>
          진료 내용
        </span>
        <p className="t-body">혈압약 용량은 그대로 유지. 최근 무릎 통증 말씀드렸고, 정형외과 진료를 권하셨어요.</p>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>봉사자 최지인 · 담당의 설명을 받아 적었어요</span>
      </div>
      <div className="card card--list">
        {facts.map(([ic, k, v]) => (
          <div key={k} className="list-item">
            <Icon name={ic} size={20} color="var(--brand-primary)" />
            <div className="col">
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{k}</span>
              <span className="t-body t-bold">{v}</span>
            </div>
          </div>
        ))}
      </div>
      <Spacer />
      <Button to="/guardian/apply">12월 3일 동행 신청하기</Button>
      <Button variant="ghost">봉사자에게 고맙다고 전하기</Button>
    </Screen>
  )
}

/** G06 동행 기록 */
export function GuardianRecords() {
  const rows: [string, string, string, string, 'green' | 'gray'][] = [
    ['11월 5일', '경북대학교병원 · 내과', '어머니 · 최지인 봉사자', '리포트 있음', 'green'],
    ['10월 28일', '칠곡경북대병원 · 정형외과', '어머니 · 최지인 봉사자', '리포트 있음', 'green'],
    ['10월 14일', '대구파티마병원 · 안과', '아버지 · 박○○ 봉사자', '리포트 있음', 'green'],
    ['9월 30일', '경북대학교병원 · 내과', '어머니 · 이○○ 봉사자', '취소됨', 'gray'],
  ]
  return (
    <Screen footer={tabs}>
      <h1 className="t-h1">동행 기록</h1>
      <FilterChips options={['전체', '어머니', '아버지']} />
      {rows.map(([d, h, s, cs, tone]) => (
        <Link
          key={d}
          to="/guardian/report"
          className="card"
          style={{ flexDirection: 'row', alignItems: 'center', padding: '16px 12px 16px 18px', borderRadius: 16 }}
        >
          <div className="col fill" style={{ gap: 3 }}>
            <div className="row row--between">
              <span className="t-bold t-primary" style={{ fontSize: 13 }}>
                {d}
              </span>
              <Chip tone={tone}>{cs}</Chip>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{h}</span>
            <span className="t-caption">{s}</span>
          </div>
          <Icon name="chev" size={20} color="var(--icon-muted)" />
        </Link>
      ))}
    </Screen>
  )
}

/** G07 MY · 가족·알림 설정 */
export function GuardianMy() {
  const notis: [string, boolean][] = [
    ['댁에서 출발할 때', true],
    ['병원에 도착했을 때', true],
    ['진료가 끝났을 때', true],
    ['댁에 도착했을 때', true],
    ['대기·진료 중 소식', false],
  ]
  return (
    <Screen footer={tabs}>
      <h1 className="t-h1">MY</h1>
      <div className="row row--between">
        <span style={{ fontSize: 16, fontWeight: 700 }}>함께 관리하는 부모님</span>
        <button type="button" className="row t-primary t-bold" style={{ gap: 2, fontSize: 14 }}>
          <Icon name="plus" size={16} strokeWidth={2.4} />
          추가
        </button>
      </div>
      <div className="card card--list">
        {[
          ['어머니 · 김○○', '82세 · 보행 보조 · 귀가 어두움'],
          ['아버지 · 김○○', '85세 · 휠체어 사용'],
        ].map(([n, s]) => (
          <div key={n} className="list-item" style={{ paddingRight: 12 }}>
            <Avatar size={44} />
            <div className="col fill">
              <span style={{ fontSize: 16, fontWeight: 700 }}>{n}</span>
              <span className="t-caption">{s}</span>
            </div>
            <Icon name="chev" size={20} color="var(--icon-muted)" />
          </div>
        ))}
      </div>
      <span style={{ fontSize: 16, fontWeight: 700 }}>알림 받을 순간</span>
      <div className="card card--list">
        {notis.map(([l, on]) => (
          <div key={l} className="list-item row--between" style={{ padding: '12px 14px' }}>
            <span className="t-body t-medium">{l}</span>
            <Switch defaultOn={on} label={l} />
          </div>
        ))}
      </div>
    </Screen>
  )
}
