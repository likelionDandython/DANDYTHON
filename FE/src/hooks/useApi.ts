import { useCallback, useEffect, useState } from 'react'
import { errorMessage } from '../api/labels'

/** 화면 진입 시 API 를 한 번 호출하고 loading / error / data 를 돌려줘요. enabled=false 면 호출하지 않아요. */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = [], enabled = true) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let alive = true
    setLoading(true)
    setError(null)
    fetcher()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(errorMessage(e)))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { data, loading, error, reload }
}

/** 버튼 클릭 등 사용자 동작으로 API 를 호출할 때 */
export function useAction() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
    setPending(true)
    setError(null)
    try {
      return await fn()
    } catch (e) {
      setError(errorMessage(e))
      return undefined
    } finally {
      setPending(false)
    }
  }, [])
  return { pending, error, run, setError }
}
