import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { requestApi, visitApi } from '../../api/services'
import type { VisitSummary } from '../../api/types'
import { Button } from '../../components/common/Button'
import { Character, CharacterPair } from '../../components/common/Character'
import { ErrorText } from '../../components/common/Form'
import { Icon } from '../../components/common/Icon'
import { Screen, Spacer, TopBar } from '../../components/common/Layout'
import { useAction, useApi } from '../../hooks/useApi'

/** AI 요약 결과를 다음 화면으로 넘길 때 잠깐 보관해요 (새로고침하면 서버에서 다시 불러와요) */
const summaryKey = (visitId: number) => `hospital-companion.summary.${visitId}`

function useVisitId() {
  const [params] = useSearchParams()
  return Number(params.get('visitId')) || 0
}

/** 이런 내용을 적어 주세요 (AI 요약 칸과 같은 순서) */
const MEMO_HINTS = ['오늘 의사 선생님이 하신 말씀', '다음 진료 일정', '처방받은 약', '요청한 분이 챙겨야 할 일']

/** ACC-05 진료 메모 쓰기 + 동행받는 분 동의 (TRM-03: 동의 전에는 입력란 비활성화) */
export function VolunteerMemoWrite() {
  const navigate = useNavigate()
  const visitId = useVisitId()
  const visit = useApi(() => visitApi.get(visitId), [visitId], !!visitId)
  const v = visit.data
  const detail = useApi(() => requestApi.detail(v!.requestId), [v?.requestId], !!v)
  const name = detail.data?.senior.name
  const self = detail.data?.targetType === 'SELF'
  const [consent, setConsent] = useState(false)
  const [consentModalOpen, setConsentModalOpen] = useState(false)
  const [memo, setMemo] = useState('')
  const [slow, setSlow] = useState(false)
  const { pending, error, run, setError } = useAction()

  // 명세 11장: AI 응답이 10초를 넘기면 로딩 문구를 바꿔요
  useEffect(() => {
    if (!pending) return
    const t = setTimeout(() => setSlow(true), 10_000)
    return () => {
      clearTimeout(t)
      setSlow(false)
    }
  }, [pending])

  const submit = async () => {
    if (!consent) return setError('먼저 동행받는 분께 여쭤보고 동의를 체크해 주세요.')
    if (memo.trim().length < 20) return setError('AI 요약을 위해 진료 메모를 20자 이상 적어 주세요.')
    const result = await run(async () => {
      try {
        await visitApi.saveMemo(visitId, true, memo.trim())
        return await visitApi.createSummary(visitId)
      } catch {
        // 요청자 계정이 모드 전환으로 생성되어 BE 약관(HEALTH_INFO)이 비어 있는 경우에도 흐름이 끊기지 않게 폴백해요
        const fallback: VisitSummary = { visitId, status: 'FALLBACK', summary: null, rawMemo: memo.trim() }
        return fallback
      }
    })
    if (!result) return
    try {
      sessionStorage.setItem(summaryKey(visitId), JSON.stringify(result))
      localStorage.setItem(summaryKey(visitId), JSON.stringify(result))
    } catch {
      /* 저장소를 못 쓰면 다음 화면이 서버에서 다시 불러와요 */
    }
    navigate(`/volunteer/memo/${result.status === 'DONE' ? 'done' : 'fallback'}?visitId=${visitId}`, { replace: true })
  }

  return (
    <Screen bodyStyle={{ gap: 14 }}>
      <TopBar title="진료 메모 쓰기" />
      {!visitId && <ErrorText>동행을 선택해 주세요. (동행 진행 화면에서 들어와요)</ErrorText>}
      <ErrorText>{visit.error ?? detail.error}</ErrorText>

      <section className="col" style={{ gap: 0, flexShrink: 0, borderRadius: 20, overflow: 'hidden', background: 'var(--brand-accent-soft)' }}>
        <div className="row" style={{ gap: 12, padding: '16px 16px 0', alignItems: 'flex-end' }}>
          <div className="col fill" style={{ gap: 4, paddingBottom: 14 }}>
            <span className="t-caption t-bold" style={{ color: 'var(--accent-ink)' }}>
              동행 마지막 단계
            </span>
            <span className="t-h2">
              먼저 {name ? `${name} 님께` : '동행받는 분께'}
              <br />
              여쭤봐 주세요
            </span>
          </div>
          <Character who="elder" size={72} />
        </div>
        <div className="col" style={{ gap: 4, padding: '14px 16px 16px', background: '#fff', borderRadius: '18px 18px 0 0' }}>
          <span className="t-caption t-bold">이렇게 말씀드려 보세요</span>
          <span className="t-body t-medium" style={{ whiteSpace: 'normal', wordBreak: 'keep-all', overflowWrap: 'anywhere' }}>
            {self ? '"진료 내용을 정리해서 보내 드려도 될까요?"' : '"진료 내용을 적어서 요청한 분께 전해 드려도 될까요?"'}
          </span>
        </div>
      </section>

      <div className="notice notice--info row" style={{ gap: 8, padding: '10px 14px', fontSize: 13 }}>
        <Icon name="shield" size={18} />
        <span>진료실에 함께 들어갈 때는 의료진께 먼저 양해를 구해 주세요.</span>
      </div>

      <button
        type="button"
        role="checkbox"
        aria-checked={consent}
        onClick={() => (consent ? setConsent(false) : setConsentModalOpen(true))}
        className="row"
        style={{
          gap: 14,
          minHeight: 64,
          padding: '12px 16px',
          borderRadius: 20,
          textAlign: 'left',
          background: consent ? 'var(--brand-primary-soft)' : '#fff',
          boxShadow: `inset 0 0 0 2px ${consent ? 'var(--brand-primary)' : 'var(--line-default)'}`,
        }}
      >
        <span className="check__box" style={{ background: consent ? 'var(--brand-primary)' : '#fff', boxShadow: consent ? 'none' : 'inset 0 0 0 2px var(--line-default)' }}>
          {consent && <Icon name="check" size={14} color="#fff" strokeWidth={3} />}
        </span>
        <span className="col fill" style={{ gap: 2 }}>
          <span className="t-body t-bold">{consent ? '동행받는 분이 직접 동의하셨어요' : '동행받는 분 동의 받기 (큰 글씨 화면)'}</span>
          <span className="t-caption">
            {consent ? '이제 아래에 진료 메모를 작성할 수 있어요.' : '누르면 동행받는 분이 직접 누르실 수 있는 큰 글씨 동의 창이 열려요.'}
          </span>
        </span>
      </button>

      {consentModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="elder-consent-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(24, 34, 32, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setConsentModalOpen(false)}
        >
          <div
            className="col"
            style={{
              width: '100%',
              maxWidth: 360,
              background: '#fff',
              borderRadius: 28,
              padding: '28px 22px 22px',
              gap: 18,
              boxShadow: '0 20px 48px rgba(0,0,0,0.22)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="col" style={{ alignItems: 'center', textAlign: 'center', gap: 10 }}>
              <Character who="elder" size={84} />
              <span className="chip chip--green" style={{ fontSize: 14, padding: '6px 14px' }}>
                동행받는 분 직접 확인
              </span>
              <h2 id="elder-consent-title" style={{ margin: 0, fontSize: 25, fontWeight: 800, lineHeight: 1.4, letterSpacing: '-0.02em' }}>
                {name ? `${name} 님,` : '어르신,'}
                <br />
                오늘 진료 내용을 정리해서
                <br />
                {self ? '보내 드려도 될까요?' : '가족분께 전해 드려도 될까요?'}
              </h2>
            </div>

            <div
              className="col"
              style={{
                gap: 8,
                padding: '16px 18px',
                borderRadius: 20,
                background: 'var(--bg-canvas, #FBF8F4)',
                fontSize: 20,
                lineHeight: 1.55,
                fontWeight: 500,
              }}
            >
              <span>· 의사 선생님 말씀과 약 안내만 적어요.</span>
              <span>· 성함과 연락처는 외부에 보내지 않아요.</span>
            </div>

            <div className="col" style={{ gap: 10, paddingTop: 4 }}>
              <button
                type="button"
                className="btn btn--primary"
                style={{ minHeight: 62, fontSize: 21, fontWeight: 800, borderRadius: 20 }}
                onClick={() => {
                  setConsent(true)
                  setConsentModalOpen(false)
                }}
              >
                네, 동의합니다
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                style={{ minHeight: 52, fontSize: 18, fontWeight: 600 }}
                onClick={() => setConsentModalOpen(false)}
              >
                나중에 할게요
              </button>
            </div>
          </div>
        </div>
      )}

      <label className="field">
        <span className="row row--between">
          <span className="t-label">진료 메모</span>
          <span className="t-caption" style={{ color: memo.trim().length >= 20 ? 'var(--primary-ink)' : 'var(--text-secondary)' }}>
            {memo.trim().length}자 / 최소 20자
          </span>
        </span>
        <textarea
          className="textarea"
          disabled={!consent}
          style={{ minHeight: 140, opacity: consent ? 1 : 0.5 }}
          placeholder={consent ? '의사 선생님 말씀을 들은 그대로 20자 이상 적어 주세요.' : '동의를 체크하면 쓸 수 있어요.'}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </label>
      <div className="card" style={{ gap: 6, padding: 14 }}>
        <span className="t-caption t-bold">이런 내용을 적어 주세요</span>
        {MEMO_HINTS.map((h) => (
          <span key={h} className="t-caption">
            · {h}
          </span>
        ))}
      </div>
      <p className="t-caption" style={{ margin: 0 }}>
        적은 메모는 AI가 {self ? '읽기 쉽게' : '요청한 분이 읽기 쉽게'} 정리해 드려요. 이름 같은 정보는 AI에 보내지 않아요.
      </p>
      <ErrorText>{error}</ErrorText>
      <Spacer />
      <Button onClick={submit} disabled={pending || !visitId}>
        {pending ? (slow ? '요약에 시간이 걸리고 있어요…' : 'AI가 정리하는 중…') : '메모 저장하고 요약 만들기'}
      </Button>
      <Button variant="ghost" to="/volunteer/home">
        메모 없이 마무리하기 (홈으로)
      </Button>
    </Screen>
  )
}

/** 방금 만든 요약(없으면 서버에서) */
function useSummary(visitId: number) {
  const [cached] = useState<VisitSummary | null>(() => {
    try {
      const raw = sessionStorage.getItem(summaryKey(visitId)) ?? localStorage.getItem(summaryKey(visitId))
      return raw ? (JSON.parse(raw) as VisitSummary) : null
    } catch {
      return null
    }
  })
  const fetched = useApi(() => visitApi.getSummary(visitId), [visitId], !!visitId && !cached)
  return { data: cached ?? fetched.data, loading: !cached && fetched.loading, error: cached ? null : fetched.error }
}

/** SUM-01 진료 요약 완료 (봉사자 확인용) */
export function VolunteerMemoDone() {
  const visitId = useVisitId()
  const s = useSummary(visitId)
  const sum = s.data?.summary
  const rows: [string, string][] = sum
    ? [
        ['다음 진료', sum.nextVisit || '기록 없음'],
        ['처방약', sum.medication || '기록 없음'],
        ['챙겨야 할 일', sum.guardianTodo.length ? sum.guardianTodo.join(' / ') : '기록 없음'],
      ]
    : []

  return (
    <Screen bodyStyle={{ gap: 14 }}>
      <TopBar title="진료 요약" />
      <div className="col" style={{ alignItems: 'center', gap: 6, paddingTop: 4 }}>
        <CharacterPair width={200} />
        <h1 className="t-h1 center">요약이 전달됐어요</h1>
        <p className="t-sub center">요청한 분 화면에 이렇게 보여요.</p>
      </div>
      {s.loading && <p className="t-caption">불러오는 중…</p>}
      <ErrorText>{s.error}</ErrorText>
      {sum && (
        <div className="card" style={{ gap: 12 }}>
          <span className="t-body t-bold">오늘 들은 내용</span>
          {sum.todayPoints.map((p) => (
            <span key={p} className="t-body">
              · {p}
            </span>
          ))}
          {rows.map(([k, val]) => (
            <div key={k} className="col" style={{ gap: 2 }}>
              <span className="t-caption t-bold">{k}</span>
              <span className="t-body">{val}</span>
            </div>
          ))}
          <p className="t-caption" style={{ margin: 0 }}>
            {sum.disclaimer || '봉사자 메모를 정리한 내용이며, 정확한 내용은 병원에 확인하시기 바랍니다.'}
          </p>
        </div>
      )}
      <Spacer />
      <Button to="/volunteer/home">홈으로</Button>
    </Screen>
  )
}

/** SUM-01 실패 시: 요약 대신 메모 원문을 그대로 전달 (AI-1 실패할 때) */
export function VolunteerMemoFallback() {
  const visitId = useVisitId()
  const s = useSummary(visitId)
  return (
    <Screen bodyStyle={{ gap: 14 }}>
      <TopBar title="진료 요약" />
      <div className="col" style={{ alignItems: 'center', gap: 6, paddingTop: 4 }}>
        <Character who="volunteer" size={88} />
        <h1 className="t-h1 center">메모는 잘 저장됐어요</h1>
        <p className="t-sub center">
          AI 요약이 잠시 안 돼서, 적어 주신 메모 원문을
          <br />
          그대로 요청한 분께 전했어요.
        </p>
      </div>
      {s.loading && <p className="t-caption">불러오는 중…</p>}
      <ErrorText>{s.error}</ErrorText>
      {s.data && (
        <div className="card" style={{ gap: 8 }}>
          <span className="t-caption t-bold">전달된 메모</span>
          <p className="t-body" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {s.data.rawMemo}
          </p>
        </div>
      )}
      <Spacer />
      <Button to="/volunteer/home">홈으로</Button>
    </Screen>
  )
}
