/**
 * 고향 연결 배지 판단 ("남의 할매니도 우리 할매니처럼").
 * 봉사자 고향은 직접 쓴 글("경북 안동시")이고, 동행받는 분 거주지는 시·군 이름("의성군")이라
 * 둘에서 시·군 이름만 뽑아 같은지 비교해요. 같은 시·군일 때만 true.
 */
const BIG_CITY = /(특별자치시|특별시|광역시)/g
/** 시·군 이름이 아닌 앞말 (도·광역시 이름) */
const PROVINCE = new Set(['경북', '경상북도', '경남', '경상남도', '대구', '부산', '서울', '울산', '인천', '광주', '대전', '세종'])

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
  return a !== '' && a === b
}
