import { http } from './client'
import type {
  AcceptResult,
  ApplicationItem,
  ApproveResult,
  BoardItem,
  CancelApplicationResult,
  CancelRequestResult,
  Certificate,
  CheckoutResult,
  Hospital,
  LoginBody,
  LoginResult,
  MyApplication,
  MyRequestItem,
  Need,
  RequestBody,
  RequestDetail,
  Senior,
  SeniorBody,
  SignupBody,
  SignupResult,
  Visit,
  VisitStep,
  VisitSummary,
  VolunteerProfile,
  VolunteerProfileBody,
} from './types'

/** 1. 인증 */
export const authApi = {
  signup: (body: SignupBody) => http.post<SignupResult>('/auth/signup', body),
  login: (body: LoginBody) => http.post<LoginResult>('/auth/login', body),
}

/** 2. 프로필 */
export const profileApi = {
  saveVolunteer: (body: VolunteerProfileBody) => http.put<{ userId: number; profileCompleted: boolean }>('/volunteers/me', body),
  getVolunteer: (userId: number) => http.get<VolunteerProfile>(`/volunteers/${userId}`),
  createSenior: (body: SeniorBody) => http.post<{ seniorId: number }>('/seniors', body),
  mySeniors: () => http.get<Senior[]>('/seniors/me'),
  hospitals: () => http.get<Hospital[]>('/hospitals'),
}

/** 3. 동행 요청 */
export const requestApi = {
  create: (body: RequestBody) => http.post<{ requestId: number; status: string }>('/requests', body),
  board: (q: { date?: string; hospitalId?: number; need?: Need } = {}) => http.get<BoardItem[]>('/requests', q),
  mine: () => http.get<MyRequestItem[]>('/requests/me'),
  detail: (requestId: number) => http.get<RequestDetail>(`/requests/${requestId}`),
  cancel: (requestId: number) => http.delete<CancelRequestResult>(`/requests/${requestId}`),
}

/** 4. 신청·매칭 */
export const applicationApi = {
  apply: (requestId: number, message: string) =>
    http.post<{ applicationId: number; status: string }>(`/requests/${requestId}/applications`, { message }),
  listForRequest: (requestId: number) => http.get<ApplicationItem[]>(`/requests/${requestId}/applications`),
  accept: (applicationId: number) => http.post<AcceptResult>(`/applications/${applicationId}/accept`),
  mine: () => http.get<MyApplication[]>('/applications/me'),
  cancel: (applicationId: number) => http.delete<CancelApplicationResult>(`/applications/${applicationId}`),
}

/** 5. 동행 진행 · 6. 메모/요약/승인 */
export const visitApi = {
  get: (visitId: number) => http.get<Visit>(`/visits/${visitId}`),
  checkin: (visitId: number, time?: string) =>
    http.post<{ visitId: number; startedAt: string }>(`/visits/${visitId}/checkin`, time ? { time } : undefined),
  step: (visitId: number, step: VisitStep, done = true) =>
    http.patch<{ visitId: number; step: VisitStep }>(`/visits/${visitId}/step`, { step, done }),
  checkout: (visitId: number, time?: string) =>
    http.post<CheckoutResult>(`/visits/${visitId}/checkout`, time ? { time } : undefined),
  saveMemo: (visitId: number, consent: boolean, memo: string) =>
    http.post<{ visitId: number; consent: boolean; memoSaved: boolean }>(`/visits/${visitId}/memo`, { consent, memo }),
  createSummary: (visitId: number) => http.post<VisitSummary>(`/visits/${visitId}/summary`),
  getSummary: (visitId: number) => http.get<VisitSummary>(`/visits/${visitId}/summary`),
  approve: (visitId: number, thanks?: string) => http.post<ApproveResult>(`/visits/${visitId}/approve`, { thanks }),
  certificate: (visitId: number) => http.get<Certificate>(`/visits/${visitId}/certificate`),
}
