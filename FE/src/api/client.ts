import type { ApiResponse } from './types'

/** 배포 환경에서는 VITE_API_URL 로 덮어쓰고, 개발 중에는 vite 프록시(/api)를 써요 */
const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api'

const STORAGE_KEY = 'hospital-companion.auth'
export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

export class ApiError extends Error {
  code: string
  status: number
  constructor(code: string, message: string, status: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

export function getToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as { accessToken?: string }).accessToken ?? null : null
  } catch {
    return null
  }
}

export const authStorageKey = STORAGE_KEY

type Query = Record<string, string | number | undefined | null>

function buildUrl(path: string, query?: Query) {
  const params = new URLSearchParams()
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  })
  const qs = params.toString()
  return `${BASE_URL}${path}${qs ? `?${qs}` : ''}`
}

/** 공통 응답 {success,data,error} 를 벗겨서 data 만 돌려주고, 실패하면 ApiError 를 던져요 */
export async function request<T>(method: string, path: string, opts: { body?: unknown; query?: Query } = {}): Promise<T> {
  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'

  let res: Response
  try {
    res = await fetch(buildUrl(path, opts.query), {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    })
  } catch {
    throw new ApiError('NETWORK_ERROR', '서버에 연결할 수 없어요', 0)
  }

  let json: ApiResponse<T> | null = null
  try {
    json = (await res.json()) as ApiResponse<T>
  } catch {
    /* 본문이 JSON 이 아닌 경우 */
  }

  if (res.status === 401 && token) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))

  if (!res.ok || !json || !json.success) {
    throw new ApiError(json?.error?.code ?? 'UNKNOWN_ERROR', json?.error?.message ?? '알 수 없는 오류가 발생했어요', res.status)
  }
  return json.data as T
}

export const http = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body }),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
