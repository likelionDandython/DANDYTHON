// 병원동행 API 명세서 v0.1 (10/31) 기준 타입 정의

export type Role = 'GUARDIAN' | 'VOLUNTEER'
export type Gender = 'FEMALE' | 'MALE'
export type GenderPref = 'ANY' | Gender
export type MeetPlaceType = 'HOME' | 'STATION' | 'HOSPITAL'
export type Need = 'WALK_ASSIST' | 'WHEELCHAIR' | 'EXAM_ESCORT' | 'PHARMACY' | 'RIDE_HOME'
export type RequestStatus = 'RECRUITING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'CANCELED'
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'CLOSED' | 'CANCELED'
export type VisitStep = 'MEET' | 'RECEPTION' | 'TREATMENT' | 'PAYMENT' | 'PHARMACY' | 'SEE_OFF'

export type ConsentItem =
  | 'TERMS'
  | 'PRIVACY'
  | 'THIRD_PARTY'
  | 'PROFILE_PUBLIC'
  | 'VOLUNTEER_PLEDGE'
  | 'CONFIDENTIALITY'
  | 'SCHOOL_VERIFY'
  | 'PROXY_CONFIRM'
  | 'SUMMARY_RECEIVE'
  | 'HEALTH_INFO'
  | 'SUMMARY_SHARE'

/** 공통 응답 형식 */
export type ApiResponse<T> = {
  success: boolean
  data: T | null
  error: { code: string; message: string } | null
}

// ── 1. 인증 ──
export type SignupBody = {
  role: Role
  email: string
  password: string
  name: string
  phone: string
  consents: { item: ConsentItem; agreed: boolean }[]
}
export type SignupResult = { userId: number; role: Role }
export type LoginBody = { email: string; password: string }
export type LoginResult = {
  accessToken: string
  userId: number
  role: Role
  name: string
  profileCompleted: boolean
}

// ── 2. 프로필 ──
export type VolunteerProfileBody = {
  age: number
  gender: Gender
  school: string
  major: string
  grade: number
  hometown: string
  intro: string
  photoUrl: string
}
export type VolunteerProfile = Omit<VolunteerProfileBody, never> & {
  userId: number
  name: string
  verified: boolean
  visitCount: number
  totalMinutes: number
  thanksMessages: string[]
}
export type SeniorBody = { name: string; age: number; phone: string; region: string }
export type Senior = { seniorId: number; name: string; age: number; region: string }
export type Hospital = { hospitalId: number; name: string; address: string }

// ── 3. 동행 요청 ──
export type RequestBody = {
  seniorId: number
  date: string
  meetTime: string
  meetPlaceType: MeetPlaceType
  meetAddress: string
  hospitalId: number
  department: string
  needs: Need[]
  notes: string
  helpersNeeded: number
  genderPref: GenderPref
}
export type BoardItem = {
  requestId: number
  date: string
  meetTime: string
  hospitalName: string
  department: string
  meetPlaceType: MeetPlaceType
  region: string
  needs: Need[]
  expectedHours: number
  twoRecommended: boolean
  urgent: boolean
  applied: boolean
}
export type MyRequestItem = {
  requestId: number
  seniorName: string
  date: string
  hospitalName: string
  status: RequestStatus
  applicantCount: number
}
export type RequestDetail = {
  requestId: number
  status: RequestStatus
  senior: { name: string; age: number; region: string; phone: string | null }
  date: string
  meetTime: string
  meetPlaceType: MeetPlaceType
  meetAddress: string | null
  hospital: { hospitalId: number; name: string }
  department: string
  needs: Need[]
  notes: string
  helpersNeeded: number
  genderPref: GenderPref
  guardian: { name: string; phone: string } | null
  volunteers: { userId: number; name: string; phone: string }[] | null
  visitId: number | null
}
export type CancelRequestResult = { requestId: number; status: RequestStatus; lateCancel: boolean }

// ── 4. 신청·매칭 ──
export type ApplicationItem = {
  applicationId: number
  status: ApplicationStatus
  message: string
  createdAt: string
  volunteer: {
    userId: number
    name: string
    age: number
    gender: Gender
    school: string
    major: string
    grade: number
    hometown: string
    photoUrl: string
    verified: boolean
    visitCount: number
  }
}
export type AcceptResult = { requestId: number; requestStatus: RequestStatus; visitId: number }
export type MyApplication = {
  applicationId: number
  status: ApplicationStatus
  requestId: number
  visitId: number | null
  date: string
  meetTime: string
  hospitalName: string
  requestStatus: RequestStatus
}
export type CancelApplicationResult = { applicationId: number; status: ApplicationStatus; lateCancel: boolean }

// ── 5. 동행 진행 ──
export type Visit = {
  visitId: number
  requestId: number
  step: VisitStep
  checklist: { step: VisitStep; label: string; done: boolean }[]
  startedAt: string | null
  endedAt: string | null
  consent: boolean
  hasMemo: boolean
  hasSummary: boolean
  approved: boolean
}
export type CheckoutResult = { visitId: number; startedAt: string; endedAt: string; recognizedMinutes: number }

// ── 6. 메모·요약·승인 ──
export type VisitSummary = {
  visitId: number
  status: 'DONE' | 'FALLBACK'
  summary: {
    todayPoints: string[]
    nextVisit: string
    medication: string
    guardianTodo: string[]
    disclaimer: string
  } | null
  rawMemo: string
}
export type ApproveResult = { visitId: number; approvedMinutes: number; approvedAt: string; requestStatus: RequestStatus }
export type Certificate = {
  volunteerName: string
  school: string
  date: string
  hospitalName: string
  startedAt: string
  endedAt: string
  approvedMinutes: number
  approvedAt: string
}
