import { ApiError } from './client'
import type { ApplicationStatus, GenderPref, MeetPlaceType, Mode, Need, RequestStatus, TravelMode } from './types'

export const NEED_LABEL: Record<Need, string> = {
  WALK_ASSIST: '보행 보조',
  WHEELCHAIR: '휠체어',
  EXAM_ESCORT: '진료·검사 동행',
  PHARMACY: '수납·약 수령',
  RIDE_HOME: '귀가 동행',
}
export const NEEDS = Object.keys(NEED_LABEL) as Need[]

export const MEET_PLACE_LABEL: Record<MeetPlaceType, string> = { HOME: '자택', STATION: '터미널·역', HOSPITAL: '병원' }
export const TRAVEL_MODE_LABEL: Record<TravelMode, string> = { BUS_TRAIN: '시외버스·기차', TAXI: '택시', FAMILY_CAR: '가족이 차로' }
export const MODE_LABEL: Record<Mode, string> = { REQUEST: '동행 요청 모드', VOLUNTEER: '동행하기 모드' }
export const GENDER_PREF_LABEL: Record<GenderPref, string> = { ANY: '상관없어요', FEMALE: '여성 봉사자', MALE: '남성 봉사자' }

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  RECRUITING: '봉사자 찾는 중',
  CONFIRMED: '확정',
  IN_PROGRESS: '동행 중',
  COMPLETED: '동행 완료',
  APPROVED: '승인 완료',
  CANCELED: '취소됨',
}
export const REQUEST_STATUS_TONE: Record<RequestStatus, 'green' | 'orange' | 'gray'> = {
  RECRUITING: 'orange',
  CONFIRMED: 'green',
  IN_PROGRESS: 'green',
  COMPLETED: 'green',
  APPROVED: 'green',
  CANCELED: 'gray',
}
export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  PENDING: '대기 중',
  ACCEPTED: '수락됨',
  CLOSED: '마감',
  CANCELED: '취소됨',
}

const ERROR_MESSAGE: Record<string, string> = {
  NETWORK_ERROR: '서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.',
  INVALID_INPUT: '입력한 내용을 다시 확인해 주세요.',
  UNAUTHORIZED: '로그인이 필요해요.',
  FORBIDDEN: '이 작업을 할 수 있는 권한이 없어요.',
  INVALID_STATUS: '지금 상태에서는 할 수 없는 동작이에요.',
  EMAIL_DUPLICATED: '이미 가입된 이메일이에요.',
  REQUIRED_CONSENT_MISSING: '필수 약관에 모두 동의해 주세요.',
  LOGIN_FAILED: '이메일 또는 비밀번호가 맞지 않아요.',
  SENIOR_NOT_FOUND: '등록된 동행받는 분을 찾을 수 없어요.',
  REQUEST_NOT_FOUND: '요청을 찾을 수 없어요.',
  PROFILE_INCOMPLETE: '프로필을 먼저 완성해 주세요.',
  ALREADY_APPLIED: '이미 신청한 동행이에요.',
  SCHEDULE_CONFLICT: '같은 시간대에 확정된 동행이 있어요.',
  CONSENT_REQUIRED: '동행받는 분의 동의가 필요해요.',
  OWN_REQUEST: '내가 올린 요청에는 신청할 수 없어요.',
}

/** 에러 코드를 사용자에게 보여줄 한글 문구로 바꿔요 */
export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return ERROR_MESSAGE[e.code] ?? e.message
  return '알 수 없는 오류가 발생했어요.'
}
