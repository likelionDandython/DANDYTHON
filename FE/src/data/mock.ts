// 화면 확인용 예시 데이터. 실제 API가 생기면 이 파일을 교체하세요.

export type CompanionRequest = {
  id: string
  dDay: string
  date: string
  hospital: string
  from: string
  elder: string
}

export const requests: CompanionRequest[] = [
  {
    id: 'r1',
    dDay: 'D-2',
    date: '11월 5일(목) 오전 9:30',
    hospital: '경북대학교병원 · 내과',
    from: '출발 · 군위군 효령면',
    elder: '김○○ 어르신 (82세) · 보행 보조',
  },
  {
    id: 'r2',
    dDay: 'D-4',
    date: '11월 7일(토) 오후 1:00',
    hospital: '대구가톨릭대병원 · 안과',
    from: '출발 · 경산시 하양읍',
    elder: '이○○ 어르신 (77세) · 휠체어',
  },
  {
    id: 'r3',
    dDay: 'D-7',
    date: '11월 10일(화) 오전 10:00',
    hospital: '영남대학교병원 · 신경과',
    from: '출발 · 영천시 금호읍',
    elder: '최○○ 어르신 (85세) · 청력 약함',
  },
]
