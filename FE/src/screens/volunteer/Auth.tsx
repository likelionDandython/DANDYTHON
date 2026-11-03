import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/services'
import { Button } from '../../components/common/Button'
import { Chip, ToggleChipGroup } from '../../components/common/Chip'
import { Agreements, ErrorText, Field } from '../../components/common/Form'
import { Icon, type IconName } from '../../components/common/Icon'
import { Screen, Spacer, StepHeader, TopBar } from '../../components/common/Layout'
import { homePath, useAuth } from '../../auth/AuthContext'
import { buildConsents, completeSignup, getDraft, patchDraft, VOLUNTEER_AGREEMENTS } from '../../auth/signup'
import { useAction } from '../../hooks/useApi'
import { ageFromBirth } from '../../lib/format'

/** 01 온보딩 */
export function VolunteerOnboarding() {
  return (
    <Screen bodyStyle={{ paddingTop: 56, alignItems: 'center' }}>
      <div className="circle-icon" style={{ width: 220, height: 220, background: 'var(--brand-primary-soft)' }}>
        <Icon name="heart" size={88} color="var(--brand-primary)" strokeWidth={1.6} />
      </div>
      <div style={{ height: 24 }} />
      <h1 className="t-display center">
        어르신의 병원 가는 길,
        <br />
        함께 걸어주세요
      </h1>
      <p className="t-body center" style={{ color: 'var(--text-secondary)' }}>
        경북에서 대구 병원까지, 접수부터 귀가까지
        <br />곁을 지키는 동행 봉사자가 되어주세요.
      </p>
      <Pager />
      <Spacer />
      <Button to="/volunteer/signup/1">봉사자로 시작하기</Button>
      <Button variant="ghost" to="/volunteer/login">
        이미 계정이 있어요
      </Button>
    </Screen>
  )
}

export function Pager({ index = 0, count = 3 }: { index?: number; count?: number }) {
  return (
    <div className="row" style={{ gap: 6 }}>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          style={{
            width: i === index ? 20 : 6,
            height: 6,
            borderRadius: 3,
            background: i === index ? 'var(--brand-primary)' : 'var(--line-default)',
          }}
        />
      ))}
    </div>
  )
}

/** 02 로그인 */
export function VolunteerLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { pending, error, run, setError } = useAction()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = async () => {
    const session = await run(() => authApi.login({ email, password }))
    if (!session) return
    if (session.role !== 'VOLUNTEER') return setError('봉사자 계정이 아니에요. 보호자 앱에서 로그인해 주세요.')
    login(session)
    navigate(homePath(session), { replace: true })
  }

  return (
    <Screen bodyStyle={{ gap: 12 }}>
      <TopBar />
      <div style={{ height: 8 }} />
      <h1 className="t-h1" style={{ fontSize: 24 }}>
        이메일로
        <br />
        로그인해 주세요
      </h1>
      <p className="t-sub">동행 일정과 긴급 연락이 이 계정으로 전달돼요.</p>
      <div style={{ height: 4 }} />
      <Field label="이메일" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field label="비밀번호" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <ErrorText>{error}</ErrorText>
      <Spacer />
      <Button onClick={submit} disabled={pending || !email || !password}>
        {pending ? '로그인 중…' : '로그인'}
      </Button>
      <p className="t-sub t-medium center">
        처음이신가요?{' '}
        <Link to="/volunteer/signup/1" style={{ textDecoration: 'underline' }}>
          봉사자 등록하기
        </Link>
      </p>
    </Screen>
  )
}

/** 10 봉사자 등록 1 · 기본 정보 */
export function VolunteerSignup1() {
  const navigate = useNavigate()
  const draft = getDraft('VOLUNTEER')
  const [name, setName] = useState(draft.name)
  const [birth, setBirth] = useState('')
  const [phone, setPhone] = useState(draft.phone)
  const [email, setEmail] = useState(draft.email)
  const [password, setPassword] = useState(draft.password)
  const [error, setError] = useState<string | null>(null)

  const next = () => {
    const age = ageFromBirth(birth)
    if (!name.trim() || !phone.trim() || !email.trim() || password.length < 8) return setError('이름, 휴대폰, 이메일을 입력하고 비밀번호는 8자 이상으로 해주세요.')
    if (age === null) return setError('생년월일을 2004.05.21 형식으로 입력해 주세요.')
    if (age < 18) return setError('만 18세 이상부터 동행 봉사에 참여할 수 있어요.')
    patchDraft('VOLUNTEER', { name: name.trim(), phone: phone.trim(), email: email.trim(), password })
    navigate('/volunteer/signup/2')
  }

  return (
    <Screen>
      <StepHeader title="봉사자 등록" step={1} />
      <h1 className="t-h1">기본 정보를 알려주세요</h1>
      <Field label="이름" value={name} onChange={(e) => setName(e.target.value)} />
      <Field label="생년월일" placeholder="2004.05.21" inputMode="numeric" value={birth} onChange={(e) => setBirth(e.target.value)} />
      <Field label="휴대폰 번호" placeholder="010-1234-5678" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Field label="이메일" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field label="비밀번호 (8자 이상)" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <p className="t-caption">만 18세 이상부터 동행 봉사에 참여할 수 있어요.</p>
      <ErrorText>{error}</ErrorText>
      <Spacer />
      <Button onClick={next}>다음</Button>
    </Screen>
  )
}

/** 11 봉사자 등록 2 · 활동 정보 */
export function VolunteerSignup2() {
  return (
    <Screen>
      <StepHeader title="봉사자 등록" step={2} />
      <h1 className="t-h1">
        언제, 어디서
        <br />
        함께할 수 있나요?
      </h1>
      <ToggleChipGroup
        label="활동 지역"
        options={['대구 북구', '대구 중구', '칠곡군', '경산시', '군위군', '영천시']}
        defaultSelected={['대구 북구', '대구 중구', '칠곡군']}
      />
      <ToggleChipGroup
        label="가능한 요일"
        options={['월', '화', '수', '목', '금', '토', '일']}
        defaultSelected={['화', '목', '토']}
      />
      <ToggleChipGroup label="이동 방법" options={['대중교통 동행', '자차 이용 가능']} defaultSelected={['대중교통 동행']} />
      <ToggleChipGroup
        label="할 수 있는 도움"
        options={['보행 보조', '휠체어 밀기', '수납·약 수령', '수어 가능']}
        defaultSelected={['보행 보조', '휠체어 밀기', '수납·약 수령']}
      />
      <Spacer />
      <Button to="/volunteer/signup/3">다음</Button>
    </Screen>
  )
}

function VerifyItem({ icon, title, sub, state, tone }: { icon: IconName; title: string; sub: string; state: string; tone: 'green' | 'orange' | 'gray' }) {
  return (
    <div className="card" style={{ flexDirection: 'row', alignItems: 'center', padding: '14px 14px 14px 16px', borderRadius: 16 }}>
      <span className="icon-badge" style={{ width: 40, height: 40 }}>
        <Icon name={icon} size={22} color="var(--brand-primary)" />
      </span>
      <span className="col fill" style={{ gap: 1 }}>
        <span className="t-body t-bold">{title}</span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{sub}</span>
      </span>
      <Chip tone={tone}>{state}</Chip>
    </div>
  )
}

/** 12 봉사자 등록 3 · 신원 확인·교육 */
export function VolunteerSignup3() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { pending, error, run, setError } = useAction()
  const [checked, setChecked] = useState<boolean[]>([])

  const submit = async () => {
    const consents = buildConsents(VOLUNTEER_AGREEMENTS, checked)
    if (!consents) return setError('필수 약관에 모두 동의해 주세요.')
    patchDraft('VOLUNTEER', { consents })
    const session = await run(() => completeSignup('VOLUNTEER', login))
    if (session) navigate('/volunteer/signup/done')
  }

  return (
    <Screen bodyStyle={{ gap: 14 }}>
      <StepHeader title="봉사자 등록" step={3} />
      <h1 className="t-h1">
        안전한 동행을 위해
        <br />
        확인이 필요해요
      </h1>
      <VerifyItem icon="id" title="신분증 확인" sub="이름·생년월일 일치 확인" state="완료" tone="green" />
      <VerifyItem icon="play" title="동행 봉사 교육" sub="영상 3편 · 약 20분" state="1/3 시청" tone="orange" />
      <VerifyItem icon="link" title="1365 자원봉사 연결" sub="봉사시간 자동 등록 (선택)" state="연결하기" tone="gray" />
      <Agreements items={VOLUNTEER_AGREEMENTS.map((a) => a.label)} onChange={setChecked} />
      <ErrorText>{error}</ErrorText>
      <Spacer />
      <Button onClick={submit} disabled={pending}>
        {pending ? '등록 중…' : '등록 신청하기'}
      </Button>
    </Screen>
  )
}

/** 13 봉사자 등록 · 승인 대기 */
export function VolunteerSignupDone() {
  const rows: [string, string, 'green' | 'orange' | 'gray'][] = [
    ['신분증 확인', '완료', 'green'],
    ['동행 봉사 교육', '2편 남음', 'orange'],
    ['승인 심사', '대기 중', 'gray'],
  ]
  return (
    <Screen bodyStyle={{ paddingTop: 72, alignItems: 'center', gap: 14 }}>
      <div className="circle-icon" style={{ width: 96, height: 96, background: 'var(--brand-accent-soft)' }}>
        <Icon name="hourglass" size={44} color="var(--brand-accent)" />
      </div>
      <div style={{ height: 8 }} />
      <h1 className="t-h1 center" style={{ fontSize: 24 }}>
        등록 신청이 접수됐어요
      </h1>
      <p className="t-body center" style={{ color: 'var(--text-secondary)' }}>
        담당자가 확인하고 1~2일 안에
        <br />
        문자로 알려드릴게요.
      </p>
      <div className="card card--list" style={{ width: '100%' }}>
        {rows.map(([k, v, tone]) => (
          <div key={k} className="list-item row--between" style={{ padding: '14px 14px 14px 16px' }}>
            <span className="t-body t-medium">{k}</span>
            <Chip tone={tone}>{v}</Chip>
          </div>
        ))}
      </div>
      <p className="t-caption t-accent t-medium center">교육을 모두 들어야 첫 동행 요청을 받을 수 있어요.</p>
      <Spacer />
      <Button>남은 교육 이어보기</Button>
      <Button variant="ghost" to="/volunteer/home">
        먼저 둘러보기
      </Button>
    </Screen>
  )
}
