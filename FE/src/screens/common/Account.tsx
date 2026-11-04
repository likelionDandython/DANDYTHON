import { useState, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi, profileApi, userApi } from '../../api/services'
import { MODE_LABEL } from '../../api/labels'
import type { Mode } from '../../api/types'
import { Button } from '../../components/common/Button'
import { CharacterAvatar, CharacterPair } from '../../components/common/Character'
import { Agreements, ErrorText, Field } from '../../components/common/Form'
import { Icon, type IconName } from '../../components/common/Icon'
import { Screen, Spacer, StepHeader, TopBar } from '../../components/common/Layout'
import { homePath, modeHome, useAuth } from '../../auth/AuthContext'
import { buildConsents, COMMON_AGREEMENTS, completeSignup, getDraft, hasPendingSignup, MODE_AGREEMENTS, patchDraft } from '../../auth/signup'
import { useAction } from '../../hooks/useApi'
import { regionFromAddress } from '../../lib/format'

/** 큰 선택 카드 (모드 선택, 나/가족 선택) */
function ChoiceCard({
  onClick,
  leading,
  tag,
  title,
  desc,
  tone,
}: {
  onClick: () => void
  leading: ReactNode
  tag?: string
  title: string
  desc: string
  tone: 'accent' | 'primary' | 'plain'
}) {
  const style =
    tone === 'accent'
      ? { background: 'var(--brand-accent-soft)', boxShadow: 'inset 0 0 0 2px var(--char-elder)', ink: 'var(--accent-ink)' }
      : tone === 'primary'
        ? { background: 'var(--brand-primary-soft)', boxShadow: 'inset 0 0 0 2px var(--char-vol)', ink: 'var(--primary-ink)' }
        : { background: '#fff', boxShadow: 'inset 0 0 0 1px var(--line-default)', ink: 'var(--text-primary)' }
  return (
    <button
      type="button"
      onClick={onClick}
      className="row"
      style={{ gap: 16, padding: 20, borderRadius: 24, background: style.background, boxShadow: style.boxShadow, textAlign: 'left', width: '100%' }}
    >
      {leading}
      <span className="col fill" style={{ gap: 4 }}>
        {tag && <span style={{ fontSize: 13, fontWeight: 700, color: style.ink }}>{tag}</span>}
        <span style={{ fontSize: 21, fontWeight: 700, color: style.ink }}>{title}</span>
        <span className="t-sub" style={{ lineHeight: 1.55 }}>
          {desc}
        </span>
      </span>
      <Icon name="chev" size={22} color={style.ink} />
    </button>
  )
}

function IconCircle({ name }: { name: IconName }) {
  return (
    <span className="circle-icon" style={{ width: 56, height: 56, background: 'var(--brand-accent-soft)', flexShrink: 0 }}>
      <Icon name={name} size={28} color="var(--accent-ink)" />
    </span>
  )
}

/** 시작: 계정 하나로 요청도 동행도 */
export function Start() {
  const { session } = useAuth()
  if (session) return <Navigate to={homePath(session)} replace />
  return (
    <Screen bodyStyle={{ paddingTop: 40, alignItems: 'center', gap: 16 }}>
      <CharacterPair width={240} />
      <h1 className="t-display center">
        경북에서 대구 병원까지
        <br />
        같이 가요
      </h1>
      <p className="t-body center" style={{ color: 'var(--text-secondary)' }}>
        내 병원길이든 가족의 병원길이든 동행을 요청할 수도,
        <br />
        누군가의 곁을 지키는 봉사자가 될 수도 있어요.
        <br />
        계정 하나로 둘 다 할 수 있어요.
      </p>
      <Spacer />
      <Button to="/signup">시작하기</Button>
      <Button variant="ghost" to="/login">
        이미 계정이 있어요
      </Button>
    </Screen>
  )
}

/** 가입 1 · 역할 없이 기본 정보 */
export function Signup() {
  const navigate = useNavigate()
  const draft = getDraft()
  const [name, setName] = useState(draft.name)
  const [phone, setPhone] = useState(draft.phone)
  const [email, setEmail] = useState(draft.email)
  const [password, setPassword] = useState(draft.password)
  const [error, setError] = useState<string | null>(null)

  const next = () => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      return setError('이름, 휴대폰, 이메일을 입력해 주세요.')
    }
    if (name.trim().length > 30) return setError('이름은 30자 이하로 입력해 주세요.')
    if (!/^010-?\d{4}-?\d{4}$/.test(phone.trim())) return setError('휴대폰 번호는 010-1234-5678 형식으로 입력해 주세요.')
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('이메일 형식이 올바르지 않아요.')
    if (password.length < 8 || password.length > 20) return setError('비밀번호는 8~20자로 해주세요.')
    patchDraft({ name: name.trim(), phone: phone.trim(), email: email.trim(), password, signedUp: false })
    navigate('/signup/agree')
  }

  return (
    <Screen>
      <StepHeader title="가입" step={1} total={2} />
      <h1 className="t-h1">
        같이가요 계정을
        <br />
        만들어요
      </h1>
      <p className="t-sub">역할은 고르지 않아요. 가입한 뒤에 "동행 요청하기"와 "동행하러 가기"를 오갈 수 있어요.</p>
      <Field label="이름" value={name} onChange={(e) => setName(e.target.value)} />
      <Field label="휴대폰 번호" placeholder="010-1234-5678" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Field label="이메일" type="email" autoComplete="email" placeholder="로그인에 사용해요" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field label="비밀번호 (8~20자)" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <ErrorText>{error}</ErrorText>
      <Spacer />
      <Button onClick={next}>다음</Button>
    </Screen>
  )
}

/** 가입 2 · 공통 약관 */
export function SignupAgree() {
  const navigate = useNavigate()
  const [checked, setChecked] = useState<boolean[]>([])
  const [error, setError] = useState<string | null>(null)
  if (!getDraft().email) return <Navigate to="/signup" replace />

  const next = () => {
    const consents = buildConsents(COMMON_AGREEMENTS, checked)
    if (!consents) return setError('필수 약관에 모두 동의해 주세요.')
    patchDraft({ consents })
    navigate('/mode')
  }

  return (
    <Screen>
      <StepHeader title="가입" step={2} total={2} />
      <h1 className="t-h1">
        같이가요를 쓰려면
        <br />
        동의가 필요해요
      </h1>
      <p className="t-sub">모드별 약관은 그 모드에 처음 들어갈 때 따로 받아요.</p>
      <Agreements items={COMMON_AGREEMENTS.map((a) => a.label)} onChange={setChecked} />
      <ErrorText>{error}</ErrorText>
      <Spacer />
      <Button onClick={next}>동의하고 가입하기</Button>
    </Screen>
  )
}

/** 로그인 (공통) */
export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { pending, error, run } = useAction()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = async () => {
    const result = await run(() => authApi.login({ email, password }))
    if (!result) return
    const s = login(result)
    navigate(homePath(s), { replace: true })
  }

  return (
    <Screen bodyStyle={{ gap: 12 }}>
      <TopBar />
      <div style={{ height: 8 }} />
      <h1 className="t-h1" style={{ fontSize: 24 }}>
        같이가요 계정으로
        <br />
        로그인해 주세요
      </h1>
      <p className="t-sub">
        요청할 때도 동행할 때도 같은 계정이에요.
        <br />
        로그인하면 마지막에 쓰던 모드로 열려요.
      </p>
      <Field label="이메일" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field label="비밀번호" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <ErrorText>{error}</ErrorText>
      <Spacer />
      <Button onClick={submit} disabled={pending || !email || !password}>
        {pending ? '로그인 중…' : '로그인'}
      </Button>
      <p className="t-sub t-medium center">
        처음이신가요?{' '}
        <Link to="/signup" style={{ textDecoration: 'underline' }}>
          가입하기
        </Link>
      </p>
    </Screen>
  )
}

/** 오늘은 무엇을 할까요? (모드 선택) */
export function ModeSelect() {
  const navigate = useNavigate()
  const { session, setMode } = useAuth()
  if (!session && !hasPendingSignup()) return <Navigate to="/start" replace />

  const choose = (mode: Mode) => {
    if (session?.modes.includes(mode)) {
      setMode(mode)
      userApi.setMode(mode).catch(() => undefined)
      return navigate(modeHome(mode))
    }
    navigate(`/mode/terms?mode=${mode}`)
  }

  return (
    <Screen bodyStyle={{ gap: 16, paddingTop: 56 }}>
      <h1 className="t-h1" style={{ fontSize: 24 }}>
        오늘은 무엇을
        <br />
        할까요?
      </h1>
      <p className="t-sub">하나만 고르면 돼요. 홈 위쪽이나 MY에서 언제든 바꿀 수 있어요.</p>
      <ChoiceCard
        tone="accent"
        onClick={() => choose('REQUEST')}
        leading={<CharacterAvatar who="elder" size={64} />}
        tag={MODE_LABEL.REQUEST}
        title="동행 요청하기"
        desc="나 또는 가족의 병원 가는 길에 함께할 봉사자를 찾아요."
      />
      <ChoiceCard
        tone="primary"
        onClick={() => choose('VOLUNTEER')}
        leading={<CharacterAvatar who="volunteer" size={64} />}
        tag={MODE_LABEL.VOLUNTEER}
        title="동행하러 가기"
        desc="병원 가는 길에 곁을 지켜 드릴 동행을 찾아요."
      />
    </Screen>
  )
}

const TERMS_COPY: Record<Mode, { title: string; note: string; next: string }> = {
  REQUEST: {
    title: '동행을 요청하기 전에\n확인해 주세요',
    note: '건강정보는 일반 개인정보 동의와 따로 받아요. 가족을 위해 요청할 땐 그분 본인의 동의를 먼저 받아 주세요.',
    next: '/request/who',
  },
  VOLUNTEER: {
    title: '동행하러 가기 전에\n확인해 주세요',
    note: '프로필의 이름·나이·성별·대학·학과·고향·소개는 동행을 요청한 분에게 공개돼요.',
    next: '/volunteer/profile',
  },
}

/** 모드 첫 진입 약관 (가입 중이면 여기서 서버 가입까지 마쳐요) */
export function ModeTerms() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const mode: Mode = params.get('mode') === 'VOLUNTEER' ? 'VOLUNTEER' : 'REQUEST'
  const { session, login, enterMode } = useAuth()
  const { pending, error, run, setError } = useAction()
  const [checked, setChecked] = useState<boolean[]>([])
  const defs = MODE_AGREEMENTS[mode]
  const copy = TERMS_COPY[mode]
  if (!session && !hasPendingSignup()) return <Navigate to="/start" replace />

  const submit = async () => {
    const consents = buildConsents(defs, checked)
    if (!consents) return setError('필수 약관에 모두 동의해 주세요.')
    const ok = await run(async () => {
      if (!session) {
        await completeSignup(mode, consents, login)
      } else {
        // BE 준비 전에는 저장에 실패해도 이 기기에서는 모드를 열어 줘요
        await userApi.addConsents(consents).catch(() => undefined)
      }
      return true
    })
    if (!ok) return
    enterMode(mode)
    userApi.setMode(mode).catch(() => undefined)
    navigate(copy.next, { replace: true })
  }

  return (
    <Screen bodyStyle={{ gap: 14 }}>
      <TopBar title={mode === 'REQUEST' ? '동행 요청하기' : '동행하러 가기'} />
      <h1 className="t-h1" style={{ whiteSpace: 'pre-line' }}>
        {copy.title}
      </h1>
      <p className="t-sub">이 모드에 처음 들어갈 때 한 번만 받아요.</p>
      <Agreements items={defs.map((a) => a.label)} onChange={setChecked} />
      <div className="notice">
        <Icon name="lock" size={20} />
        {copy.note}
      </div>
      {mode === 'VOLUNTEER' && (
        <div className="notice" style={{ background: 'var(--brand-accent-soft)', color: 'var(--accent-ink)' }}>
          <Icon name="won" size={20} />
          돈은 대신 내거나 맡지 않아요. 차비·진료비·약값은 동행받는 분이 직접 결제해요.
        </div>
      )}
      <ErrorText>{error}</ErrorText>
      <Spacer />
      <Button onClick={submit} disabled={pending}>
        {pending ? '처리 중…' : '동의하고 시작하기'}
      </Button>
    </Screen>
  )
}

/** 누구를 위해 동행을 요청하나요? (나 / 가족) */
export function WhoFor() {
  const navigate = useNavigate()
  return (
    <Screen bodyStyle={{ gap: 16 }}>
      <TopBar title="동행 요청하기" />
      <h1 className="t-h1" style={{ fontSize: 24 }}>
        누구를 위해
        <br />
        동행을 요청하나요?
      </h1>
      <p className="t-sub">요청할 때마다 다시 고를 수 있어요. 나와 가족 둘 다 해도 돼요.</p>
      <ChoiceCard tone="plain" onClick={() => navigate('/guardian/home')} leading={<IconCircle name="user" />} title="나" desc="내 병원 동행을 요청해요. 가입한 내 정보로 바로 시작해요." />
      <ChoiceCard tone="plain" onClick={() => navigate('/guardian/senior/new')} leading={<IconCircle name="heart" />} title="가족" desc="가족의 병원 동행을 요청해요. 동행받을 분 정보를 등록해요." />
    </Screen>
  )
}

/** 동행받는 분(가족) 등록 */
export function SeniorAdd() {
  const navigate = useNavigate()
  const { pending, error, run, setError } = useAction()
  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const submit = async () => {
    const age = new Date().getFullYear() - Number(birthYear)
    if (!name.trim() || !/^\d{4}$/.test(birthYear) || age < 1 || age > 120 || !address.trim()) {
      return setError('이름, 출생 연도(4자리), 사시는 곳을 입력해 주세요.')
    }
    if (name.trim().length > 30) return setError('이름은 30자 이하로 입력해 주세요.')
    if (phone.trim() && !/^01\d-?\d{3,4}-?\d{4}$/.test(phone.trim())) return setError('휴대폰 번호 형식이 올바르지 않아요. 없으면 비워 주세요.')
    const res = await run(() => profileApi.createSenior({ name: name.trim(), age, phone: phone.trim(), region: regionFromAddress(address) }))
    if (res) navigate('/guardian/home', { replace: true })
  }

  return (
    <Screen>
      <TopBar title="동행받는 분 등록" />
      <h1 className="t-h1">
        동행받을 분을
        <br />
        알려 주세요
      </h1>
      <p className="t-sub">여러 분을 등록할 수 있어요. 등록하기 전에 그분 본인의 동의를 받아 주세요.</p>
      <Field label="이름" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="row" style={{ gap: 10, alignItems: 'flex-end' }}>
        <div className="fill">
          <Field label="출생 연도" placeholder="1948" inputMode="numeric" maxLength={4} value={birthYear} onChange={(e) => setBirthYear(e.target.value)} />
        </div>
        <div className="fill">
          <Field label="휴대폰 (없으면 비워두기)" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>
      <Field label="사시는 곳" placeholder="경북 의성군 의성읍 ○○로 12" value={address} onChange={(e) => setAddress(e.target.value)} />
      <ErrorText>{error}</ErrorText>
      <Spacer />
      <Button onClick={submit} disabled={pending}>
        {pending ? '등록 중…' : '등록하기'}
      </Button>
    </Screen>
  )
}
