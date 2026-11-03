import { authApi, profileApi } from '../api/services'
import type { ConsentItem, Role, SeniorBody } from '../api/types'
import type { Session } from './AuthContext'

/** 여러 화면에 걸친 가입 입력값을 sessionStorage 에 임시 보관해요 (새로고침해도 유지) */
export type SignupDraft = {
  role: Role
  email: string
  password: string
  name: string
  phone: string
  consents: { item: ConsentItem; agreed: boolean }[]
  /** 아직 서버에 등록하지 않은 어르신 (보호자만) */
  seniors: SeniorBody[]
  signedUp: boolean
}

const KEY = 'hospital-companion.signup-draft'

const empty = (role: Role): SignupDraft => ({
  role,
  email: '',
  password: '',
  name: '',
  phone: '',
  consents: [],
  seniors: [],
  signedUp: false,
})

export function getDraft(role: Role): SignupDraft {
  try {
    const raw = sessionStorage.getItem(KEY)
    const d = raw ? (JSON.parse(raw) as SignupDraft) : null
    return d && d.role === role ? d : empty(role)
  } catch {
    return empty(role)
  }
}

export function patchDraft(role: Role, patch: Partial<SignupDraft>) {
  sessionStorage.setItem(KEY, JSON.stringify({ ...getDraft(role), ...patch }))
}

export function clearDraft() {
  sessionStorage.removeItem(KEY)
}

/** 약관 문구 ↔ 명세의 consents item 코드 (null 은 명세에 없는 항목) */
export type AgreementDef = { label: string; code: ConsentItem | null }

export const GUARDIAN_AGREEMENTS: AgreementDef[] = [
  { label: '[필수] 서비스 이용약관', code: 'TERMS' },
  { label: '[필수] 개인정보 수집·이용', code: 'PRIVACY' },
  { label: '[필수] 개인정보 제3자 제공', code: 'THIRD_PARTY' },
  { label: '[필수] 부모님 정보 대리 등록 동의', code: 'PROXY_CONFIRM' },
  { label: '[필수] 건강정보 수집·이용', code: 'HEALTH_INFO' },
  { label: '[선택] 진료 요약 공유', code: 'SUMMARY_SHARE' },
  { label: '[선택] 진료 요약 수신', code: 'SUMMARY_RECEIVE' },
  { label: '[선택] 동행 소식 알림 받기', code: null },
]

export const VOLUNTEER_AGREEMENTS: AgreementDef[] = [
  { label: '[필수] 서비스 이용약관', code: 'TERMS' },
  { label: '[필수] 개인정보 수집·이용', code: 'PRIVACY' },
  { label: '[필수] 개인정보 제3자 제공', code: 'THIRD_PARTY' },
  { label: '[필수] 봉사자 프로필 공개', code: 'PROFILE_PUBLIC' },
  { label: '[필수] 봉사자 서약', code: 'VOLUNTEER_PLEDGE' },
  { label: '[필수] 비밀유지 서약', code: 'CONFIDENTIALITY' },
  { label: '[선택] 학교 인증', code: 'SCHOOL_VERIFY' },
  { label: '[필수] 위치정보 이용 (동행 중에만)', code: null },
]

/** 체크 상태 → consents[] (코드가 있는 항목만). 필수 항목이 빠졌으면 null */
export function buildConsents(defs: AgreementDef[], checked: boolean[]) {
  const requiredOk = defs.every((d, i) => !d.label.startsWith('[필수]') || checked[i])
  if (!requiredOk) return null
  return defs.flatMap((d, i) => (d.code ? [{ item: d.code, agreed: !!checked[i] }] : []))
}

/** 가입 → 로그인 → (보호자) 어르신 등록. 실패해도 이어서 다시 시도할 수 있게 진행 상태를 저장해요 */
export async function completeSignup(role: Role, login: (s: Session) => void): Promise<Session> {
  const d = getDraft(role)
  if (!d.signedUp) {
    await authApi.signup({
      role,
      email: d.email,
      password: d.password,
      name: d.name,
      phone: d.phone,
      consents: d.consents,
    })
    patchDraft(role, { signedUp: true })
  }
  const session = await authApi.login({ email: d.email, password: d.password })
  login(session)

  let rest = getDraft(role).seniors
  while (rest.length) {
    await profileApi.createSenior(rest[0])
    rest = rest.slice(1)
    patchDraft(role, { seniors: rest })
  }
  clearDraft()
  return session
}
