/**
 * 디자인 개편 중 "캐릭터 · 신청자 수락" 범위의 라우트.
 * 기존 routes.tsx 는 수정하지 않았어요. 팀이 쓰기로 하면 routes.tsx 의 guardian 섹션 routes 뒤에 펼쳐 넣으면 돼요.
 *   import { designRoutes } from './design/routes'   →   ...designRoutes.guardian
 */
import type { ScreenRoute } from '../routes'
import { GuardianApplicantConfirm, GuardianApplicants } from '../screens/guardian/Applicants'

const G = '디자인 개편 · 신청자 수락'

export const designRoutes: { guardian: ScreenRoute[] } = {
  guardian: [
    { group: G, code: 'G08', name: '신청자 보기', path: '/guardian/applicants', element: <GuardianApplicants /> },
    { group: G, code: 'G09', name: '봉사자 확정 확인', path: '/guardian/applicants/confirm', element: <GuardianApplicantConfirm /> },
  ],
}
