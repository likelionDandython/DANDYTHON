import { BigButton } from '../../components/common/Button'
import { Icon } from '../../components/common/Icon'
import { Avatar, Screen, Spacer } from '../../components/common/Layout'
import { ChoiceList, ElderBack, ElderField, ElderStepHeader, SingleChoice } from '../../components/elder/Elder'
import { useState } from 'react'

const S = (props: Parameters<typeof Screen>[0]) => <Screen variant="elder" {...props} />

/** E01 시작 */
export function ElderStart() {
  return (
    <S bodyStyle={{ paddingTop: 72, gap: 14 }}>
      <div className="circle-icon" style={{ width: 96, height: 96, borderRadius: 28, background: 'var(--brand-primary)' }}>
        <Icon name="hospital" size={52} color="#fff" strokeWidth={1.8} />
      </div>
      <div style={{ height: 12 }} />
      <h1 className="e-display">
        병원 가는 날,
        <br />
        혼자 가지 마세요
      </h1>
      <p className="e-body">
        집에서 병원까지, 진료 끝나고
        <br />
        집에 오실 때까지 함께 다녀요.
      </p>
      <Spacer />
      <BigButton to="/elder/signup/1">전화번호로 시작하기</BigButton>
      <BigButton variant="call">전화로 도움받기</BigButton>
      <p className="center" style={{ margin: 0, fontSize: 17, fontWeight: 500, color: 'var(--text-secondary)' }}>
        자녀분이 대신 신청할 수도 있어요
      </p>
    </S>
  )
}

/** E02 홈 */
export function ElderHome() {
  return (
    <S>
      <h1 className="e-title" style={{ fontSize: 30 }}>
        김○○ 어르신,
        <br />
        안녕하세요
      </h1>
      <section className="col" style={{ gap: 10, padding: 22, borderRadius: 22, background: '#fff', boxShadow: 'inset 0 0 0 2.5px var(--brand-primary)' }}>
        <span className="chip chip--orange" style={{ alignSelf: 'flex-start', fontSize: 16, padding: '6px 12px' }}>
          다음 병원 가는 날
        </span>
        <span style={{ fontSize: 26, fontWeight: 700 }}>11월 5일 목요일</span>
        <span style={{ fontSize: 21, fontWeight: 500 }}>
          아침 7시 40분에
          <br />
          봉사자가 집으로 와요
        </span>
        <span style={{ fontSize: 19, color: 'var(--text-secondary)' }}>경북대학교병원 내과</span>
      </section>
      <Spacer />
      <BigButton to="/elder/apply/1">병원 동행 신청하기</BigButton>
      <BigButton variant="ghost" to="/elder/records">
        지난 기록 보기
      </BigButton>
      <BigButton variant="call">전화로 물어보기</BigButton>
    </S>
  )
}

/** E03 신청 1 · 병원 */
export function ElderApplyHospital() {
  return (
    <S>
      <ElderStepHeader step={1} title={'어느 병원에\n가세요?'} />
      <span className="e-label">자주 가시는 병원</span>
      <SingleChoice
        options={[
          { title: '경북대학교병원', sub: '대구 중구 · 지난번 내과' },
          { title: '칠곡경북대학교병원', sub: '대구 북구 · 정형외과' },
        ]}
      />
      <button
        type="button"
        className="row"
        style={{ gap: 10, padding: '22px 20px', borderRadius: 18, border: '2px dashed var(--line-default)', fontSize: 21, fontWeight: 500, color: 'var(--text-secondary)' }}
      >
        <Icon name="plus" size={26} strokeWidth={2.4} />
        다른 병원 찾기
      </button>
      <Spacer />
      <BigButton to="/elder/apply/2">다음</BigButton>
    </S>
  )
}

const DAYS = [
  ['오늘', '11.2'],
  ['목', '11.5'],
  ['금', '11.6'],
  ['월', '11.9'],
]

/** E04 신청 2 · 날짜 */
export function ElderApplyDate() {
  const [day, setDay] = useState(1)
  return (
    <S bodyStyle={{ gap: 14 }}>
      <ElderStepHeader step={2} title="언제 가세요?" />
      <div className="row" style={{ gap: 10 }}>
        {DAYS.map(([d, n], i) => {
          const on = i === day
          return (
            <button
              key={n}
              type="button"
              aria-pressed={on}
              onClick={() => setDay(i)}
              className="col fill"
              style={{
                alignItems: 'center',
                padding: '16px 0',
                borderRadius: 18,
                background: on ? 'var(--brand-primary)' : '#fff',
                color: on ? '#fff' : undefined,
                boxShadow: on ? undefined : 'inset 0 0 0 1.5px var(--line-default)',
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 500, color: on ? '#fff' : 'var(--text-secondary)' }}>{d}</span>
              <span style={{ fontSize: 24, fontWeight: 700 }}>{n}</span>
            </button>
          )
        })}
      </div>
      <button type="button" className="row t-primary" style={{ gap: 8, fontSize: 18, fontWeight: 700 }}>
        <Icon name="calendar" color="var(--brand-primary)" />
        달력에서 다른 날 고르기
      </button>
      <span className="e-label">진료 시간</span>
      <SingleChoice
        options={[
          { title: '오전', sub: '9시 ~ 12시 사이 진료' },
          { title: '오후', sub: '1시 ~ 5시 사이 진료' },
          { title: '정확한 시간을 알아요', sub: '예약 시간 입력하기' },
        ]}
      />
      <Spacer />
      <BigButton to="/elder/apply/3">다음</BigButton>
    </S>
  )
}

/** E05 신청 3 · 확인 */
export function ElderApplyConfirm() {
  return (
    <S bodyStyle={{ gap: 14 }}>
      <ElderStepHeader step={3} title="이렇게 신청할까요?" />
      <div className="col" style={{ gap: 6, padding: '18px 20px', borderRadius: 18, background: '#fff', boxShadow: 'inset 0 0 0 1.5px var(--line-default)' }}>
        <span style={{ fontSize: 22, fontWeight: 700 }}>11월 5일 목요일 오전</span>
        <span style={{ fontSize: 20, fontWeight: 500 }}>경북대학교병원</span>
        <span style={{ fontSize: 17, color: 'var(--text-secondary)' }}>집 → 병원 → 집까지 함께</span>
      </div>
      <span style={{ fontSize: 19, fontWeight: 700 }}>도와드릴 일을 골라주세요</span>
      <ChoiceList
        options={[{ title: '걸을 때 부축' }, { title: '수납·약 받기' }, { title: '휠체어 필요' }]}
        defaultSelected={['걸을 때 부축', '수납·약 받기']}
      />
      <Spacer />
      <BigButton to="/elder/assigned">신청하기</BigButton>
    </S>
  )
}

/** E06 봉사자 배정 */
export function ElderAssigned() {
  return (
    <S bodyStyle={{ paddingTop: 48, alignItems: 'center', gap: 12 }}>
      <span className="row chip chip--green" style={{ gap: 6, fontSize: 17, padding: '8px 14px' }}>
        <Icon name="check" size={20} strokeWidth={3} />
        신청 완료
      </span>
      <h1 className="e-title center" style={{ fontSize: 30 }}>
        함께 갈 봉사자가
        <br />
        정해졌어요
      </h1>
      <div style={{ height: 8 }} />
      <div className="col" style={{ width: '100%', alignItems: 'center', gap: 6, padding: '24px 20px', borderRadius: 22, background: '#fff', boxShadow: 'inset 0 0 0 1.5px var(--line-default)' }}>
        <Avatar size={96} />
        <span style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>최지인 봉사자</span>
        <span style={{ fontSize: 18, color: 'var(--text-secondary)' }}>경북대학교 학생 · 동행 12번</span>
        <span className="center" style={{ fontSize: 20, fontWeight: 500 }}>
          11월 5일 아침 7시 40분에
          <br />
          댁으로 찾아갈게요
        </span>
      </div>
      <Spacer />
      <BigButton variant="call">봉사자에게 전화하기</BigButton>
      <BigButton variant="ghost" to="/elder/home">
        처음 화면으로
      </BigButton>
    </S>
  )
}

/** E07 당일 · 도착 안내 */
export function ElderArriving() {
  return (
    <S bodyStyle={{ gap: 16 }}>
      <section className="col" style={{ gap: 8, padding: '28px 24px', borderRadius: 24, background: 'var(--brand-primary)', color: '#fff' }}>
        <Icon name="car" size={44} color="#fff" />
        <span style={{ fontSize: 22, fontWeight: 500 }}>봉사자가 오고 있어요</span>
        <span style={{ fontSize: 36, fontWeight: 700 }}>약 12분 뒤 도착</span>
      </section>
      <div className="row" style={{ gap: 14, padding: '16px 18px', borderRadius: 20, background: '#fff', boxShadow: 'inset 0 0 0 1.5px var(--line-default)' }}>
        <Avatar size={60} />
        <div className="col">
          <span style={{ fontSize: 21, fontWeight: 700 }}>최지인 봉사자</span>
          <span style={{ fontSize: 17, color: 'var(--text-secondary)' }}>초록색 조끼를 입고 가요</span>
        </div>
      </div>
      <div className="col" style={{ gap: 12, padding: '18px 20px', borderRadius: 20, background: 'var(--brand-accent-soft)' }}>
        <span style={{ fontSize: 19, fontWeight: 700, color: 'var(--brand-accent)' }}>나가기 전에 챙겨주세요</span>
        {['신분증', '건강보험증 또는 진료카드', '먹고 있는 약 봉투'].map((s) => (
          <span key={s} className="row" style={{ gap: 10, fontSize: 19, fontWeight: 500 }}>
            <Icon name="check" size={22} color="var(--brand-accent)" strokeWidth={3} />
            {s}
          </span>
        ))}
      </div>
      <Spacer />
      <BigButton variant="call">봉사자에게 전화하기</BigButton>
    </S>
  )
}

/** E08 지난 기록 */
export function ElderRecords() {
  const rows = [
    ['10월 28일', '칠곡경북대학교병원', '정형외과 · 최지인 봉사자'],
    ['10월 21일', '경북대학교병원', '내과 · 최지인 봉사자'],
    ['9월 30일', '경북대학교병원', '내과 · 박○○ 봉사자'],
  ]
  return (
    <S bodyStyle={{ gap: 16 }}>
      <ElderBack />
      <h1 className="e-title">지난 병원 기록</h1>
      {rows.map(([d, h, s]) => (
        <button
          key={d}
          type="button"
          className="row"
          style={{ gap: 12, padding: '18px 14px 18px 20px', borderRadius: 18, background: '#fff', boxShadow: 'inset 0 0 0 1.5px var(--line-default)', textAlign: 'left' }}
        >
          <span className="col fill" style={{ gap: 2 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--brand-primary)' }}>{d}</span>
            <span style={{ fontSize: 21, fontWeight: 700 }}>{h}</span>
            <span style={{ fontSize: 16, color: 'var(--text-secondary)' }}>{s}</span>
          </span>
          <Icon name="chev" size={26} color="var(--icon-muted)" strokeWidth={2.4} />
        </button>
      ))}
      <Spacer />
      <BigButton to="/elder/apply/1">같은 병원 다시 신청하기</BigButton>
    </S>
  )
}

/** E10 가입 1 · 전화번호 */
export function ElderSignupPhone() {
  return (
    <S>
      <ElderStepHeader step={1} title={'전화번호를\n알려주세요'} />
      <ElderField label="내 휴대폰 번호" defaultValue="010-1234-5678" inputMode="tel" />
      <ElderField label="문자로 온 숫자 6개" placeholder="숫자 6개" inputMode="numeric" maxLength={6} />
      <button type="button" className="t-primary" style={{ fontSize: 18, fontWeight: 700, textAlign: 'left' }}>
        문자가 안 왔어요 → 다시 보내기
      </button>
      <Spacer />
      <BigButton to="/elder/signup/2">다음</BigButton>
      <BigButton variant="call">전화로 가입 도움받기</BigButton>
    </S>
  )
}

/** E11 가입 2 · 이름·주소 */
export function ElderSignupName() {
  return (
    <S>
      <ElderStepHeader step={2} title={'성함과\n사시는 곳'} />
      <ElderField label="성함" defaultValue="김○○" />
      <ElderField label="댁 주소" icon="pin" defaultValue="경북 군위군 효령면 ○○길 5" style={{ fontSize: 21 }} />
      <div style={{ padding: '16px 18px', borderRadius: 16, background: 'var(--brand-accent-soft)', color: 'var(--brand-accent)', fontSize: 18, fontWeight: 700 }}>
        어려우시면 자녀분이 대신 적어도 괜찮아요
      </div>
      <Spacer />
      <BigButton to="/elder/signup/3">다음</BigButton>
    </S>
  )
}

/** E12 가입 3 · 필요한 도움 (기타 직접 입력 포함) */
export function ElderSignupNeeds() {
  return (
    <S bodyStyle={{ gap: 12 }}>
      <ElderStepHeader step={3} title={'어떤 도움이\n필요하세요?'} />
      <span className="e-label">여러 개 골라도 돼요</span>
      <ChoiceList
        options={[{ title: '걸을 때 부축' }, { title: '휠체어를 써요' }, { title: '귀가 잘 안 들려요' }, { title: '눈이 잘 안 보여요' }]}
        defaultSelected={['걸을 때 부축', '귀가 잘 안 들려요']}
        withOther
        defaultOther="숨이 차서 자주 쉬어야 해요"
      />
      <Spacer />
      <BigButton to="/elder/signup/done">다음</BigButton>
    </S>
  )
}

/** E13 가입 완료 · 가족 연결 */
export function ElderSignupDone() {
  return (
    <S bodyStyle={{ paddingTop: 48, gap: 14 }}>
      <div className="circle-icon" style={{ width: 88, height: 88, background: 'var(--brand-primary)' }}>
        <Icon name="check" size={44} color="#fff" strokeWidth={2.8} />
      </div>
      <h1 className="e-title" style={{ fontSize: 30 }}>
        가입을 마쳤어요
      </h1>
      <div className="col" style={{ gap: 14, padding: 20, borderRadius: 22, background: '#fff', boxShadow: 'inset 0 0 0 1.5px var(--line-default)' }}>
        <span className="row" style={{ gap: 8, fontSize: 22, fontWeight: 700 }}>
          <Icon name="heart" size={26} color="var(--brand-primary)" />
          자녀분과 연결할까요?
        </span>
        <p className="e-body" style={{ fontSize: 19 }}>
          병원 가는 날 소식이
          <br />
          자녀분께도 전해져요.
        </p>
        <ElderField label="자녀분 전화번호" defaultValue="010-9876-5432" inputMode="tel" />
      </div>
      <Spacer />
      <BigButton to="/elder/home">연결 문자 보내기</BigButton>
      <BigButton variant="ghost" to="/elder/home">
        나중에 할게요
      </BigButton>
    </S>
  )
}
