import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi, profileApi } from '../../api/services'
import { Button } from '../../components/common/Button'
import { Chip, ToggleChipGroup } from '../../components/common/Chip'
import { Agreements, ErrorText, Field, OptionCards } from '../../components/common/Form'
import { Icon } from '../../components/common/Icon'
import { Avatar, Screen, Spacer, StepHeader, TopBar } from '../../components/common/Layout'
import { homePath, useAuth } from '../../auth/AuthContext'
import { buildConsents, completeSignup, getDraft, GUARDIAN_AGREEMENTS, patchDraft } from '../../auth/signup'
import { useAction, useApi } from '../../hooks/useApi'
import { regionFromAddress } from '../../lib/format'
import { Pager } from '../volunteer/Auth'

/** G00 시작 */
export function GuardianOnboarding() {
  return (
    <Screen bodyStyle={{ paddingTop: 56, alignItems: 'center' }}>
      <div className="circle-icon" style={{ width: 220, height: 220, background: 'var(--brand-primary-soft)' }}>
        <Icon name="home" size={88} color="var(--brand-primary)" strokeWidth={1.6} />
      </div>
      <div style={{ height: 24 }} />
      <h1 className="t-display center">
        멀리 계셔도
        <br />
        부모님 병원길을 함께해요
      </h1>
      <p className="t-body center" style={{ color: 'var(--text-secondary)' }}>
        검증된 봉사자가 댁에서 병원, 다시 댁까지
        <br />
        동행하고 진료 내용을 전해드려요.
      </p>
      <Pager />
      <Spacer />
      <Button to="/guardian/signup/1">보호자로 시작하기</Button>
      <Button variant="ghost" to="/guardian/login">
        이미 계정이 있어요
      </Button>
    </Screen>
  )
}

/** G01-0 로그인 */
export function GuardianLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { pending, error, run, setError } = useAction()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = async () => {
    const session = await run(() => authApi.login({ email, password }))
    if (!session) return
    if (session.role !== 'GUARDIAN') return setError('보호자 계정이 아니에요. 봉사자 앱에서 로그인해 주세요.')
    login(session)
    navigate(homePath(session), { replace: true })
  }

  return (
    <Screen bodyStyle={{ gap: 12 }}>
      <TopBar />
      <div style={{ height: 8 }} />
      <h1 className="t-h1" style={{ fontSize: 24 }}>
        보호자 계정으로
        <br />
        로그인해 주세요
      </h1>
      <p className="t-sub">부모님 동행 소식이 이 계정으로 전달돼요.</p>
      <Field label="이메일" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field label="비밀번호" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <ErrorText>{error}</ErrorText>
      <Spacer />
      <Button onClick={submit} disabled={pending || !email || !password}>
        {pending ? '로그인 중…' : '로그인'}
      </Button>
      <p className="t-sub t-medium center">
        처음이신가요?{' '}
        <Link to="/guardian/signup/1" style={{ textDecoration: 'underline' }}>
          보호자로 가입하기
        </Link>
      </p>
    </Screen>
  )
}

/** G10 가입 1 · 내 정보 */
export function GuardianSignup1() {
  const navigate = useNavigate()
  const draft = getDraft('GUARDIAN')
  const [name, setName] = useState(draft.name)
  const [phone, setPhone] = useState(draft.phone)
  const [email, setEmail] = useState(draft.email)
  const [password, setPassword] = useState(draft.password)
  const [checked, setChecked] = useState<boolean[]>([])
  const [error, setError] = useState<string | null>(null)

  const next = () => {
    if (!name.trim() || !phone.trim() || !email.trim() || password.length < 8) return setError('이름, 휴대폰, 이메일을 입력하고 비밀번호는 8자 이상으로 해주세요.')
    const consents = buildConsents(GUARDIAN_AGREEMENTS, checked)
    if (!consents) return setError('필수 약관에 모두 동의해 주세요.')
    patchDraft('GUARDIAN', { name: name.trim(), phone: phone.trim(), email: email.trim(), password, consents })
    navigate('/guardian/signup/2')
  }

  return (
    <Screen>
      <StepHeader title="보호자 가입" step={1} />
      <h1 className="t-h1">보호자님 정보를 알려주세요</h1>
      <Field label="이름" value={name} onChange={(e) => setName(e.target.value)} />
      <Field label="휴대폰 번호" placeholder="010-1234-5678" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Field label="이메일" type="email" autoComplete="email" placeholder="로그인에 사용해요" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field label="비밀번호 (8자 이상)" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Agreements items={GUARDIAN_AGREEMENTS.map((a) => a.label)} onChange={setChecked} />
      <ErrorText>{error}</ErrorText>
      <Spacer />
      <Button onClick={next}>다음</Button>
    </Screen>
  )
}

/** G11 가입 2 · 부모님 등록 */
export function GuardianSignup2() {
  const navigate = useNavigate()
  const first = getDraft('GUARDIAN').seniors[0]
  const [name, setName] = useState(first?.name ?? '')
  const [birthYear, setBirthYear] = useState('')
  const [phone, setPhone] = useState(first?.phone ?? '')
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)

  const next = () => {
    const year = Number(birthYear)
    const age = new Date().getFullYear() - year
    if (!name.trim() || !/^\d{4}$/.test(birthYear) || age < 1 || age > 120 || !address.trim()) {
      return setError('성함, 출생 연도(4자리), 댁 주소를 입력해 주세요.')
    }
    patchDraft('GUARDIAN', { seniors: [{ name: name.trim(), age, phone: phone.trim(), region: regionFromAddress(address) }] })
    navigate('/guardian/signup/3')
  }

  return (
    <Screen>
      <StepHeader title="보호자 가입" step={2} />
      <h1 className="t-h1">
        동행할 부모님을
        <br />
        등록해 주세요
      </h1>
      <ToggleChipGroup label="관계" options={['어머니', '아버지', '할머니·할아버지', '기타']} defaultSelected={['어머니']} />
      <Field label="성함" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="row" style={{ gap: 10, alignItems: 'flex-end' }}>
        <div className="fill">
          <Field label="출생 연도" placeholder="1944" inputMode="numeric" maxLength={4} value={birthYear} onChange={(e) => setBirthYear(e.target.value)} />
        </div>
        <div className="fill">
          <Field label="휴대폰 (없으면 비워두기)" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>
      <Field label="댁 주소" placeholder="경북 칠곡군 왜관읍 ○○로 12" value={address} onChange={(e) => setAddress(e.target.value)} />
      <button type="button" className="row t-primary" style={{ gap: 6, fontSize: 14, fontWeight: 700 }}>
        <Icon name="plus" size={18} strokeWidth={2.4} />한 분 더 등록하기
      </button>
      <ErrorText>{error}</ErrorText>
      <Spacer />
      <Button onClick={next}>다음</Button>
    </Screen>
  )
}

/** G12 가입 3 · 도움·연결 */
export function GuardianSignup3() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { pending, error, run } = useAction()

  const submit = async () => {
    const session = await run(() => completeSignup('GUARDIAN', login))
    if (session) navigate('/guardian/signup/done')
  }

  return (
    <Screen bodyStyle={{ gap: 14 }}>
      <StepHeader title="보호자 가입" step={3} />
      <h1 className="t-h1">어머니께 필요한 도움</h1>
      <ToggleChipGroup
        label="필요한 도움"
        options={['보행 보조', '휠체어', '귀가 어두움', '시력 약함', '수납·약 수령']}
        defaultSelected={['보행 보조', '귀가 어두움', '수납·약 수령']}
      />
      <div className="field">
        <span className="row" style={{ gap: 4 }}>
          <span className="t-label">건강 메모</span>
          <Icon name="lock" size={14} color="var(--icon-muted)" />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>배정된 봉사자에게만 보여요</span>
        </span>
        <textarea className="textarea" defaultValue="혈압약 복용 중, 무릎 수술 이력 있음" style={{ minHeight: 52 }} />
      </div>
      <span className="t-label">어머니와 연결하는 방법</span>
      <OptionCards
        options={[
          { title: '어머니 휴대폰으로 초대 문자 보내기', sub: '어머니도 어르신 앱에서 일정을 보고 봉사자와 통화할 수 있어요.' },
          { title: '제가 대신 관리할게요', sub: '휴대폰이 없으셔도 돼요. 소식은 보호자님께만 와요.' },
        ]}
      />
      <ErrorText>{error}</ErrorText>
      <Spacer />
      <Button onClick={submit} disabled={pending}>
        {pending ? '가입 중…' : '가입 마치기'}
      </Button>
    </Screen>
  )
}

/** G13 가입 완료 */
export function GuardianSignupDone() {
  const seniors = useApi(() => profileApi.mySeniors(), [])
  const senior = seniors.data?.[0]
  return (
    <Screen bodyStyle={{ paddingTop: 80, alignItems: 'center', gap: 14 }}>
      <div className="circle-icon" style={{ width: 96, height: 96, background: 'var(--brand-primary)' }}>
        <Icon name="check" size={48} color="#fff" strokeWidth={2.6} />
      </div>
      <div style={{ height: 8 }} />
      <h1 className="t-h1 center" style={{ fontSize: 24 }}>
        준비가 끝났어요
      </h1>
      <p className="t-body center" style={{ color: 'var(--text-secondary)' }}>
        이제 어머니의 첫 동행을 신청해 보세요.
      </p>
      <div className="card row" style={{ width: '100%', flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        <Avatar size={48} />
        <div className="col fill" style={{ gap: 1 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{senior ? `${senior.name} (${senior.age}세)` : '어르신'}</span>
          <span className="t-caption">{senior?.region ?? '등록 완료'}</span>
        </div>
        <Chip tone="green">등록 완료</Chip>
      </div>
      <Spacer />
      <Button to="/guardian/apply">첫 동행 신청하기</Button>
      <Button variant="ghost" to="/guardian/home">
        홈으로
      </Button>
    </Screen>
  )
}
