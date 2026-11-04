/**
 * 디자인 개편 중 "캐릭터 · 신청자 수락" 범위의 라우트.
 * routes.tsx 의 동행 요청 모드 섹션에 펼쳐 넣어 쓰고 있어요.
 *   import { designRoutes } from './design/routes'   →   ...designRoutes.guardian
 */
import type { ScreenRoute } from '../routes'
import { NotificationList, NotificationSettingsScreen } from '../screens/common/Notifications'
import { GuardianApplicantConfirm, GuardianApplicants } from '../screens/guardian/Applicants'

const G = '디자인 개편 · 신청자 수락'
const N = '알림'

export const designRoutes: { guardian: ScreenRoute[] } = {
  guardian: [
    { group: G, code: 'G08', name: '신청자 보기', path: '/guardian/applicants', element: <GuardianApplicants /> },
    { group: G, code: 'G09', name: '봉사자 확정 확인', path: '/guardian/applicants/confirm', element: <GuardianApplicantConfirm /> },
    { group: N, code: 'G12', name: '알림 목록', path: '/guardian/notifications', element: <NotificationList /> },
    { group: N, code: 'G13', name: '알림 설정', path: '/guardian/notifications/settings', element: <NotificationSettingsScreen /> },
  ],
}
