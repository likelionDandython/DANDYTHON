/**
 * 고향 연결 배지 판단 ("남의 할매니도 우리 할매니처럼").
 * 봉사자 고향("경북 안동시")과 동행받는 분 거주지("의성군")에서 시·군 이름을 뽑아
 * 같은 시·군이거나 인접한 경북 생활권 시·군일 때 true 를 반환해요 (PRF-03).
 */
const BIG_CITY = /(특별자치시|특별시|광역시)/g
/** 시·군 이름이 아닌 앞말 (도·광역시 이름) */
const PROVINCE = new Set(['경북', '경상북도', '경남', '경상남도', '대구', '부산', '서울', '울산', '인천', '광주', '대전', '세종'])

/** 경북 시·군 인접 생활권 매핑 (본인 시·군 + 맞닿은 인접 시·군) */
const ADJACENT_SIGUN: Record<string, string[]> = {
  안동: ['의성', '예천', '영주', '봉화', '영양', '청송'],
  의성: ['안동', '예천', '상주', '구미', '군위', '청송'],
  예천: ['안동', '의성', '영주', '문경', '상주'],
  영주: ['안동', '예천', '봉화'],
  봉화: ['안동', '영주', '영양', '울진'],
  영양: ['안동', '봉화', '청송', '울진', '영덕'],
  청송: ['안동', '의성', '영양', '영덕', '포항', '영천'],
  문경: ['예천', '상주'],
  상주: ['예천', '의성', '문경', '구미', '김천'],
  구미: ['의성', '상주', '김천', '칠곡', '군위'],
  김천: ['상주', '구미', '성주'],
  칠곡: ['구미', '성주', '군위'],
  성주: ['김천', '칠곡', '고령'],
  고령: ['성주'],
  군위: ['의성', '구미', '칠곡', '영천'],
  영천: ['청송', '군위', '포항', '경주', '경산', '청도'],
  경산: ['영천', '청도'],
  청도: ['영천', '경산', '경주'],
  포항: ['청송', '영천', '영덕', '경주'],
  영덕: ['영양', '청송', '포항', '울진'],
  울진: ['봉화', '영양', '영덕'],
  경주: ['영천', '포항', '청도'],
}

/** "경북 안동시 풍산읍" → "안동", "의성군" → "의성", 못 찾으면 '' */
export function sigunName(text: string | null | undefined): string {
  if (!text) return ''
  const clean = text.replace(BIG_CITY, ' ')
  const m = clean.match(/([가-힣]{1,4})(시|군)(?![가-힣])/)
  if (m) return m[1]
  // "안동", "경북 의성"처럼 시·군 글자 없이 쓴 경우: 도·광역시 이름을 뺀 첫 낱말
  const word = clean.split(/\s+/).find((w) => /^[가-힣]{2,4}$/.test(w) && !PROVINCE.has(w))
  return word ?? ''
}

export function isHometownNeighbor(hometown: string | null | undefined, seniorRegion: string | null | undefined): boolean {
  const a = sigunName(hometown)
  const b = sigunName(seniorRegion)
  if (!a || !b) return false
  if (a === b) return true
  return ADJACENT_SIGUN[a]?.includes(b) ?? false
}
