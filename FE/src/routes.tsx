import type { ReactElement } from 'react'
import * as A from './screens/common/Account'
import * as VM from './screens/volunteer/Main'
import { VolunteerProfile } from './screens/volunteer/Profile'
import { VolunteerMemoDone, VolunteerMemoFallback, VolunteerMemoWrite } from './screens/volunteer/Memo'
import * as GM from './screens/guardian/Main'
import { designRoutes } from './design/routes'

export type ScreenRoute = {
  /** 화면 번호 */
  code: string
  name: string
  path: string
  element: ReactElement
  group: string
}

export type AppSection = { key: 'common' | 'volunteer' | 'guardian'; title: string; routes: ScreenRoute[] }

/**
 * 계정 하나 + 모드 구조.
 * - 공통: 시작·가입·로그인·모드 선택·모드 첫 진입 약관
 * - 동행 요청 모드 (/guardian/*): 나 또는 가족을 위한 요청
 * - 동행하기 모드 (/volunteer/*)
 * 동행받는 분 전용 앱은 따로 두지 않아요. 본인 요청은 동행 요청 모드에서 "나"를 고르면 돼요.
 */
export const sections: AppSection[] = [
  {
    key: 'common',
    title: '공통 · 계정 하나',
    routes: [
      { group: '시작 · 가입 · 로그인', code: 'C01', name: '시작', path: '/start', element: <A.Start /> },
      { group: '시작 · 가입 · 로그인', code: 'C02', name: '가입 1 · 역할 없이', path: '/signup', element: <A.Signup /> },
      { group: '시작 · 가입 · 로그인', code: 'C03', name: '가입 2 · 공통 약관', path: '/signup/agree', element: <A.SignupAgree /> },
      { group: '시작 · 가입 · 로그인', code: 'C04', name: '로그인', path: '/login', element: <A.Login /> },
      { group: '모드', code: 'C10', name: '오늘은 무엇을 할까요?', path: '/mode', element: <A.ModeSelect /> },
      { group: '모드', code: 'C11', name: '모드 첫 진입 약관', path: '/mode/terms', element: <A.ModeTerms /> },
    ],
  },
  {
    key: 'guardian',
    title: '동행 요청 모드',
    routes: [
      { group: '시작', code: 'G00', name: '누구를 위해 요청하나요? (나 / 가족)', path: '/request/who', element: <A.WhoFor /> },
      { group: '시작', code: 'G10', name: '동행받는 분 등록', path: '/guardian/senior/new', element: <A.SeniorAdd /> },
      { group: '메인', code: 'G01', name: '홈', path: '/guardian/home', element: <GM.GuardianHome /> },
      { group: '메인', code: 'G02', name: '동행 신청 (나 / 가족)', path: '/guardian/apply', element: <GM.GuardianApply /> },
      ...designRoutes.guardian,
      { group: '메인', code: 'G03', name: '봉사자 확정', path: '/guardian/confirmed', element: <GM.GuardianConfirmed /> },
      { group: '메인', code: 'G04', name: '동행 현황', path: '/guardian/live', element: <GM.GuardianLive /> },
      { group: '메인', code: 'G05', name: '진료 결과 리포트', path: '/guardian/report', element: <GM.GuardianReport /> },
      { group: '메인', code: 'G06', name: '동행 기록', path: '/guardian/records', element: <GM.GuardianRecords /> },
      { group: '메인', code: 'G07', name: 'MY · 모드 전환', path: '/guardian/my', element: <GM.GuardianMy /> },
    ],
  },
  {
    key: 'volunteer',
    title: '동행하기 모드',
    routes: [
      { group: '시작', code: 'V10', name: '봉사자 프로필', path: '/volunteer/profile', element: <VolunteerProfile /> },
      { group: '메인', code: '03', name: '홈', path: '/volunteer/home', element: <VM.VolunteerHome /> },
      { group: '메인', code: '04', name: '동행 요청 목록', path: '/volunteer/requests', element: <VM.VolunteerRequests /> },
      { group: '메인', code: '05', name: '요청 상세', path: '/volunteer/request-detail', element: <VM.VolunteerRequestDetail /> },
      { group: '메인', code: '06', name: '수락 완료', path: '/volunteer/accepted', element: <VM.VolunteerAccepted /> },
      { group: '메인', code: '07', name: '동행 진행', path: '/volunteer/progress', element: <VM.VolunteerProgress /> },
      { group: '동행 마무리', code: '09', name: '진료 메모 쓰기 + 동의', path: '/volunteer/memo', element: <VolunteerMemoWrite /> },
      { group: '동행 마무리', code: '10', name: '진료 요약 완료', path: '/volunteer/memo/done', element: <VolunteerMemoDone /> },
      { group: '동행 마무리', code: '11', name: '요약 실패 · 메모 원문', path: '/volunteer/memo/fallback', element: <VolunteerMemoFallback /> },
      { group: '메인', code: '08', name: 'MY · 모드 전환', path: '/volunteer/my', element: <VM.VolunteerMyPage /> },
    ],
  },
]

export const allRoutes = sections.flatMap((s) => s.routes)

/** 예전 역할별 주소 → 새 공통 화면 (북마크·공유 링크가 깨지지 않게) */
export const legacyRedirects: Record<string, string> = {
  '/volunteer/onboarding': '/start',
  '/guardian/onboarding': '/start',
  '/volunteer/login': '/login',
  '/guardian/login': '/login',
  '/volunteer/signup/1': '/signup',
  '/guardian/signup/1': '/signup',
  '/guardian/signup/2': '/guardian/senior/new',
}
