import type { ReactElement } from 'react'
import * as V from './screens/volunteer/Auth'
import * as VM from './screens/volunteer/Main'
import * as E from './screens/elder/Elder'
import * as G from './screens/guardian/Auth'
import * as GM from './screens/guardian/Main'

export type ScreenRoute = {
  /** Figma 프레임 이름 앞 번호 */
  code: string
  name: string
  path: string
  element: ReactElement
  group: string
}

export type AppSection = { key: 'volunteer' | 'elder' | 'guardian'; title: string; figmaPage: string; routes: ScreenRoute[] }

export const sections: AppSection[] = [
  {
    key: 'volunteer',
    title: '봉사자 앱',
    figmaPage: '봉사자 앱',
    routes: [
      { group: '시작 · 로그인 · 등록', code: '01', name: '온보딩', path: '/volunteer/onboarding', element: <V.VolunteerOnboarding /> },
      { group: '시작 · 로그인 · 등록', code: '02', name: '로그인', path: '/volunteer/login', element: <V.VolunteerLogin /> },
      { group: '시작 · 로그인 · 등록', code: '10', name: '등록 1 · 기본 정보', path: '/volunteer/signup/1', element: <V.VolunteerSignup1 /> },
      { group: '시작 · 로그인 · 등록', code: '11', name: '등록 2 · 활동 정보', path: '/volunteer/signup/2', element: <V.VolunteerSignup2 /> },
      { group: '시작 · 로그인 · 등록', code: '12', name: '등록 3 · 신원 확인·교육', path: '/volunteer/signup/3', element: <V.VolunteerSignup3 /> },
      { group: '시작 · 로그인 · 등록', code: '13', name: '등록 · 승인 대기', path: '/volunteer/signup/done', element: <V.VolunteerSignupDone /> },
      { group: '메인', code: '03', name: '홈', path: '/volunteer/home', element: <VM.VolunteerHome /> },
      { group: '메인', code: '04', name: '동행 요청 목록', path: '/volunteer/requests', element: <VM.VolunteerRequests /> },
      { group: '메인', code: '05', name: '요청 상세', path: '/volunteer/request-detail', element: <VM.VolunteerRequestDetail /> },
      { group: '메인', code: '06', name: '수락 완료', path: '/volunteer/accepted', element: <VM.VolunteerAccepted /> },
      { group: '메인', code: '07', name: '진행 현황 · 실시간 위치', path: '/volunteer/progress', element: <VM.VolunteerProgress /> },
      { group: '메인', code: '08', name: '마이페이지 · 활동 내역', path: '/volunteer/my', element: <VM.VolunteerMyPage /> },
    ],
  },
  {
    key: 'elder',
    title: '어르신 앱',
    figmaPage: '어르신 앱',
    routes: [
      { group: '시작 · 가입', code: 'E01', name: '시작', path: '/elder/start', element: <E.ElderStart /> },
      { group: '시작 · 가입', code: 'E10', name: '가입 1 · 전화번호', path: '/elder/signup/1', element: <E.ElderSignupPhone /> },
      { group: '시작 · 가입', code: 'E11', name: '가입 2 · 이름·주소', path: '/elder/signup/2', element: <E.ElderSignupName /> },
      { group: '시작 · 가입', code: 'E12', name: '가입 3 · 필요한 도움 (기타 입력)', path: '/elder/signup/3', element: <E.ElderSignupNeeds /> },
      { group: '시작 · 가입', code: 'E13', name: '가입 완료 · 가족 연결', path: '/elder/signup/done', element: <E.ElderSignupDone /> },
      { group: '메인', code: 'E02', name: '홈', path: '/elder/home', element: <E.ElderHome /> },
      { group: '메인', code: 'E03', name: '신청 1 · 병원', path: '/elder/apply/1', element: <E.ElderApplyHospital /> },
      { group: '메인', code: 'E04', name: '신청 2 · 날짜', path: '/elder/apply/2', element: <E.ElderApplyDate /> },
      { group: '메인', code: 'E05', name: '신청 3 · 확인', path: '/elder/apply/3', element: <E.ElderApplyConfirm /> },
      { group: '메인', code: 'E06', name: '봉사자 배정', path: '/elder/assigned', element: <E.ElderAssigned /> },
      { group: '메인', code: 'E07', name: '당일 · 도착 안내', path: '/elder/arriving', element: <E.ElderArriving /> },
      { group: '메인', code: 'E08', name: '지난 기록', path: '/elder/records', element: <E.ElderRecords /> },
    ],
  },
  {
    key: 'guardian',
    title: '보호자 앱',
    figmaPage: '보호자 앱',
    routes: [
      { group: '시작 · 로그인 · 가입', code: 'G00', name: '시작', path: '/guardian/onboarding', element: <G.GuardianOnboarding /> },
      { group: '시작 · 로그인 · 가입', code: 'G01-0', name: '로그인', path: '/guardian/login', element: <G.GuardianLogin /> },
      { group: '시작 · 로그인 · 가입', code: 'G10', name: '가입 1 · 내 정보', path: '/guardian/signup/1', element: <G.GuardianSignup1 /> },
      { group: '시작 · 로그인 · 가입', code: 'G11', name: '가입 2 · 부모님 등록', path: '/guardian/signup/2', element: <G.GuardianSignup2 /> },
      { group: '시작 · 로그인 · 가입', code: 'G12', name: '가입 3 · 도움·연결', path: '/guardian/signup/3', element: <G.GuardianSignup3 /> },
      { group: '시작 · 로그인 · 가입', code: 'G13', name: '가입 완료', path: '/guardian/signup/done', element: <G.GuardianSignupDone /> },
      { group: '메인', code: 'G01', name: '홈', path: '/guardian/home', element: <GM.GuardianHome /> },
      { group: '메인', code: 'G02', name: '동행 대신 신청', path: '/guardian/apply', element: <GM.GuardianApply /> },
      { group: '메인', code: 'G03', name: '봉사자 확정', path: '/guardian/confirmed', element: <GM.GuardianConfirmed /> },
      { group: '메인', code: 'G04', name: '실시간 동행 현황', path: '/guardian/live', element: <GM.GuardianLive /> },
      { group: '메인', code: 'G05', name: '진료 결과 리포트', path: '/guardian/report', element: <GM.GuardianReport /> },
      { group: '메인', code: 'G06', name: '동행 기록', path: '/guardian/records', element: <GM.GuardianRecords /> },
      { group: '메인', code: 'G07', name: 'MY · 가족·알림 설정', path: '/guardian/my', element: <GM.GuardianMy /> },
    ],
  },
]

export const allRoutes = sections.flatMap((s) => s.routes)
