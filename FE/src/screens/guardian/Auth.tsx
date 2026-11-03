import { Link } from 'react-router-dom'
import { Button } from '../../components/common/Button'
import { Chip, ToggleChipGroup } from '../../components/common/Chip'
import { Agreements, Field, OptionCards } from '../../components/common/Form'
import { Icon } from '../../components/common/Icon'
import { Avatar, Screen, Spacer, StepHeader, TopBar } from '../../components/common/Layout'
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
  return (
    <Screen bodyStyle={{ gap: 12 }}>
      <TopBar />
      <div style={{ height: 8 }} />
      <h1 className="t-h1" style={{ fontSize: 24 }}>
        보호자 계정으로
        <br />
        로그인해 주세요
      </h1>
      <p className="t-sub">부모님 동행 소식이 이 번호로 전달돼요.</p>
      <Field label="휴대폰 번호" defaultValue="010-9876-5432" inputMode="tel" suffix={<button className="field__suffix">인증번호 받기</button>} />
      <Field label="인증번호" placeholder="6자리 숫자" inputMode="numeric" maxLength={6} />
      <span className="t-caption t-accent t-medium">남은 시간 02:48</span>
      <Spacer />
      <Button to="/guardian/home">로그인</Button>
      <Button variant="ghost" to="/guardian/home">
        카카오로 계속하기
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
  return (
    <Screen>
      <StepHeader title="보호자 가입" step={1} />
      <h1 className="t-h1">보호자님 정보를 알려주세요</h1>
      <Field label="이름" defaultValue="김민정" />
      <Field label="휴대폰 번호" defaultValue="010-9876-5432" suffix={<Chip>인증 완료</Chip>} />
      <Field label="이메일 (선택)" placeholder="진료 리포트를 메일로도 받아요" type="email" />
      <Agreements
        items={['[필수] 서비스 이용약관', '[필수] 개인정보 수집·이용', '[필수] 부모님 정보 대리 등록 동의', '[선택] 동행 소식 알림 받기']}
      />
      <Spacer />
      <Button to="/guardian/signup/2">다음</Button>
    </Screen>
  )
}

/** G11 가입 2 · 부모님 등록 */
export function GuardianSignup2() {
  return (
    <Screen>
      <StepHeader title="보호자 가입" step={2} />
      <h1 className="t-h1">
        동행할 부모님을
        <br />
        등록해 주세요
      </h1>
      <ToggleChipGroup label="관계" options={['어머니', '아버지', '할머니·할아버지', '기타']} defaultSelected={['어머니']} />
      <Field label="성함" defaultValue="김○○" />
      <div className="row" style={{ gap: 10, alignItems: 'flex-end' }}>
        <div className="fill">
          <Field label="출생 연도" defaultValue="1944" inputMode="numeric" />
        </div>
        <div className="fill">
          <Field label="휴대폰 (없으면 비워두기)" defaultValue="010-2222-3333" inputMode="tel" />
        </div>
      </div>
      <Field label="댁 주소" defaultValue="경북 칠곡군 왜관읍 ○○로 12" />
      <button type="button" className="row t-primary" style={{ gap: 6, fontSize: 14, fontWeight: 700 }}>
        <Icon name="plus" size={18} strokeWidth={2.4} />한 분 더 등록하기
      </button>
      <Spacer />
      <Button to="/guardian/signup/3">다음</Button>
    </Screen>
  )
}

/** G12 가입 3 · 도움·연결 */
export function GuardianSignup3() {
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
      <Spacer />
      <Button to="/guardian/signup/done">가입 마치기</Button>
    </Screen>
  )
}

/** G13 가입 완료 */
export function GuardianSignupDone() {
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
          <span style={{ fontSize: 16, fontWeight: 700 }}>어머니 · 김○○</span>
          <span className="t-caption">초대 문자 보냄</span>
        </div>
        <Chip tone="orange">연결 대기</Chip>
      </div>
      <Spacer />
      <Button to="/guardian/apply">첫 동행 신청하기</Button>
      <Button variant="ghost" to="/guardian/home">
        홈으로
      </Button>
    </Screen>
  )
}
