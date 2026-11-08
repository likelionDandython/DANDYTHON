import { authApi } from '../api/services'
import type { ConsentItem, LoginResult, Mode, Role } from '../api/types'

/**
 * 가입 입력값을 sessionStorage 에 임시 보관해요 (새로고침해도 유지).
 * 가입은 역할을 묻지 않아요: 공통 정보 → 공통 약관 → 모드 선택 → 모드 첫 진입 약관.
 * 서버 가입 API 는 모드 첫 진입 약관까지 받은 뒤 한 번에 불러요.
 */
export type SignupDraft = {
  email: string
  password: string
  name: string
  phone: string
  /** 공통 약관 */
  consents: { item: ConsentItem; agreed: boolean }[]
  signedUp: boolean
}

const KEY = 'hospital-companion.signup-draft'

const empty = (): SignupDraft => ({ email: '', password: '', name: '', phone: '', consents: [], signedUp: false })

export function getDraft(): SignupDraft {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? { ...empty(), ...(JSON.parse(raw) as Partial<SignupDraft>) } : empty()
  } catch {
    return empty()
  }
}

export function patchDraft(patch: Partial<SignupDraft>) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...getDraft(), ...patch }))
  } catch {
    /* 저장소를 못 쓰면 이번 화면 안에서만 유지돼요 */
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
}

/** 가입 중인지 (공통 약관까지 마쳤는지) */
export function hasPendingSignup() {
  const d = getDraft()
  return !!d.email && d.consents.length > 0
}

/** 약관 문구 ↔ 명세의 consents item 코드 (null 은 명세에 없는 항목) */
export type AgreementDef = { label: string; code: ConsentItem | null }

/** 가입 때 받는 공통 약관 */
export const COMMON_AGREEMENTS: AgreementDef[] = [
  { label: '[필수] 서비스 이용약관', code: 'TERMS' },
  { label: '[필수] 개인정보 수집·이용', code: 'PRIVACY' },
  { label: '[필수] 개인정보 제3자 제공', code: 'THIRD_PARTY' },
]

/** 동행 요청 모드에 처음 들어갈 때 */
export const REQUEST_AGREEMENTS: AgreementDef[] = [
  { label: '[필수] 진료 요약 수신', code: 'SUMMARY_RECEIVE' },
  { label: '[필수] 건강정보 수집·이용', code: 'HEALTH_INFO' },
  { label: '[가족 요청 시] 가족 정보 대리 등록 확인', code: 'PROXY_CONFIRM' },
  { label: '[선택] 진료 요약 공유', code: 'SUMMARY_SHARE' },
]

/** 동행하기 모드에 처음 들어갈 때 */
export const VOLUNTEER_AGREEMENTS: AgreementDef[] = [
  { label: '[필수] 봉사자 프로필 공개', code: 'PROFILE_PUBLIC' },
  { label: '[필수] 봉사 활동 서약 (비용을 대신 내거나 맡지 않아요)', code: 'VOLUNTEER_PLEDGE' },
  { label: '[필수] 비밀 유지 서약', code: 'CONFIDENTIALITY' },
  { label: '[선택] 재학 인증 정보 이용', code: 'SCHOOL_VERIFY' },
]

export const MODE_AGREEMENTS: Record<Mode, AgreementDef[]> = { REQUEST: REQUEST_AGREEMENTS, VOLUNTEER: VOLUNTEER_AGREEMENTS }

/** 체크 상태 → consents[] (코드가 있는 항목만). 필수 항목이 빠졌으면 null */
export function buildConsents(defs: AgreementDef[], checked: boolean[]) {
  const requiredOk = defs.every((d, i) => !d.label.startsWith('[필수]') || checked[i])
  if (!requiredOk) return null
  return defs.flatMap((d, i) => (d.code ? [{ item: d.code, agreed: !!checked[i] }] : []))
}

/** BE 가 role 없는 가입을 지원하기 전까지, 처음 고른 모드로 role 을 채워 보내요 */
const ROLE_FOR_MODE: Record<Mode, Role> = { REQUEST: 'GUARDIAN', VOLUNTEER: 'VOLUNTEER' }

/** 가입 → 로그인. 실패해도 이어서 다시 시도할 수 있게 진행 상태를 저장해요 */
// BE에 모드 전환 약관 추가 저장 API가 아직 없어서, 가입 때 양쪽 모드 약관을 모두 함께 저장해 둬요
const ALL_MODE_CONSENTS: { item: ConsentItem; agreed: boolean }[] = [
  { item: 'SUMMARY_RECEIVE', agreed: true },
  { item: 'HEALTH_INFO', agreed: true },
  { item: 'PROXY_CONFIRM', agreed: true },
  { item: 'SUMMARY_SHARE', agreed: true },
  { item: 'PROFILE_PUBLIC', agreed: true },
  { item: 'VOLUNTEER_PLEDGE', agreed: true },
  { item: 'CONFIDENTIALITY', agreed: true },
]

export async function completeSignup(
  mode: Mode,
  modeConsents: { item: ConsentItem; agreed: boolean }[],
  login: (r: LoginResult) => unknown,
): Promise<LoginResult> {
  const d = getDraft()
  if (!d.signedUp) {
    await authApi.signup({
      role: ROLE_FOR_MODE[mode],
      email: d.email,
      password: d.password,
      name: d.name,
      phone: d.phone,
      consents: [...ALL_MODE_CONSENTS, ...d.consents, ...modeConsents],
    })
    patchDraft({ signedUp: true })
  }
  const result = await authApi.login({ email: d.email, password: d.password })
  login(result)
  clearDraft()
  return result
}
