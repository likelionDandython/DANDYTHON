const WEEK = ['일', '월', '화', '수', '목', '금', '토']

function parse(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** 2026-11-12 → 11월 12일(목) */
export function formatDate(date: string) {
  const d = parse(date)
  return `${d.getMonth() + 1}월 ${d.getDate()}일(${WEEK[d.getDay()]})`
}

/** 10:00 → 오전 10:00 */
export function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number)
  const ap = h < 12 ? '오전' : '오후'
  return `${ap} ${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')}`
}

export function formatDateTime(date: string, time: string) {
  return `${formatDate(date)} ${formatTime(time)}`
}

/** 동행일까지 남은 일수 → D-2 / D-DAY */
export function dDay(date: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((parse(date).getTime() - today.getTime()) / 86400000)
  return diff <= 0 ? 'D-DAY' : `D-${diff}`
}

/** 2026-11-12T10:05:00 → 10:05 */
export function hhmm(iso: string | null) {
  return iso ? iso.slice(11, 16) : ''
}

export function minutesToText(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h && m ? `${h}시간 ${m}분` : h ? `${h}시간` : `${m}분`
}

export function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 오늘로부터 7일 뒤 날짜 (yyyy-MM-dd) */
export function weekLater() {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 생년월일(2004.05.21 / 2004-05-21 / 20040521) → 만 나이. 형식이 틀리면 null */
export function ageFromBirth(birth: string): number | null {
  const m = birth.replace(/\D/g, '').match(/^(\d{4})(\d{2})(\d{2})$/)
  if (!m) return null
  const [, y, mo, d] = m.map(Number)
  const now = new Date()
  let age = now.getFullYear() - y
  if (now.getMonth() + 1 < mo || (now.getMonth() + 1 === mo && now.getDate() < d)) age -= 1
  return age
}

/** 주소 문자열에서 시·군 이름을 뽑아요 (예: "경북 의성군 ○○" → 의성군) */
export function regionFromAddress(address: string): string {
  const m = address.match(/([가-힣]+(?:시|군))/)
  return m ? m[1] : address.trim()
}
