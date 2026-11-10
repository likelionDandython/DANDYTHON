import { ApiError } from './client'
import type { ApplicationStatus, GenderPref, MeetPlaceType, Mode, Need, RequestStatus, Transport, TravelMode, Weekday } from './types'

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
/** 동행일 2일 이내 취소(lateCancel)일 때 보여줄 문구 */
export const LATE_CANCEL_NOTE = '동행 2일 전 이후 취소는 기록에 남아요'
export const WEEKDAY_LABEL: Record<Weekday, string> = { MON: '월', TUE: '화', WED: '수', THU: '목', FRI: '금', SAT: '토', SUN: '일' }
export const TRANSPORT_LABEL: Record<Transport, string> = { PUBLIC: '대중교통', CAR: '자차 이용 가능' }
/** 봉사자가 할 수 있는 도움: Need 값 + 추가 항목 */
export const ABILITY_LABEL: Record<string, string> = {
  WALK_ASSIST: '보행 보조',
  WHEELCHAIR: '휠체어 밀기',
  EXAM_ESCORT: '진료·검사 동행',
  PHARMACY: '수납·약 수령',
  RIDE_HOME: '귀가 차편 배웅',
  SIGN_LANGUAGE: '수어 가능',
}
export const REGIONS = ['대구 중구', '대구 동구', '대구 서구', '대구 남구', '대구 북구', '대구 수성구', '대구 달서구', '대구 달성군', '군위군', '칠곡군', '경산시', '영천시']
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
  USER_NOT_FOUND: '계정을 찾을 수 없어요.',
  VOLUNTEER_NOT_FOUND: '봉사자 정보를 찾을 수 없어요.',
  HOSPITAL_NOT_FOUND: '병원을 찾을 수 없어요.',
  APPLICATION_NOT_FOUND: '신청 내역을 찾을 수 없어요.',
  VISIT_NOT_FOUND: '동행 기록을 찾을 수 없어요.',
  SUMMARY_NOT_FOUND: '아직 진료 요약이 없어요.',
  SUMMARY_CONSENT_REQUIRED: '진료 요약을 받으려면 요약 수신·공유 동의가 필요해요.',
  INTERNAL_ERROR: '서버에 문제가 생겼어요. 잠시 후 다시 시도해 주세요.',
}

/** 에러 코드를 사용자에게 보여줄 한글 문구로 바꿔요 */
export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return ERROR_MESSAGE[e.code] ?? e.message
  return '알 수 없는 오류가 발생했어요.'
}
