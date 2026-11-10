/**
 * 서비스 캐릭터 (임시 — 로고·캐릭터가 확정되면 이 파일의 모양과 tokens.css 의 --char-* 색만 바꾸면 돼요)
 * 규칙: 코랄 = 동행받는 분, 틸 = 봉사자. 홈 상단·빈 화면·완료 화면에서만 쓰고 목록 안에는 넣지 않아요.
 * 봉사자 프로필은 사진 업로드가 없어서(BE 확인) 항상 이 캐릭터가 고정으로 들어가요.
 */
import type { SVGProps } from 'react'
import '../../design/styles'

type Who = 'elder' | 'volunteer'

/** 120×150 좌표계에 그린 캐릭터 한 명 (다른 svg 안에 <g> 로 넣어서 써요) */
function Elder() {
  return (
    <g>
      <line x1="14" y1="96" x2="10" y2="146" stroke="var(--char-elder-dark)" strokeWidth="5" strokeLinecap="round" />
      <path d="M38 82 L16 98" stroke="var(--char-elder)" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M82 82 L102 96" stroke="var(--char-elder)" strokeWidth="10" strokeLinecap="round" fill="none" />
      <rect x="43" y="124" width="10" height="22" rx="5" fill="var(--char-elder)" />
      <rect x="67" y="124" width="10" height="22" rx="5" fill="var(--char-elder)" />
      <path d="M38 72 Q60 64 82 72 L94 128 Q60 136 26 128 Z" fill="var(--char-elder)" strokeLinejoin="round" />
      <circle cx="60" cy="16" r="11" fill="var(--char-elder)" />
      <circle cx="60" cy="44" r="22" fill="var(--char-elder)" />
      <circle cx="52" cy="45" r="2.6" fill="var(--char-face)" />
      <circle cx="68" cy="45" r="2.6" fill="var(--char-face)" />
      <path d="M53 54 Q60 60 67 54" stroke="var(--char-face)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="45" cy="52" r="4" fill="var(--char-elder-cheek)" />
      <circle cx="75" cy="52" r="4" fill="var(--char-elder-cheek)" />
    </g>
  )
}

function Volunteer() {
  return (
    <g>
      <rect x="72" y="68" width="22" height="42" rx="10" fill="var(--char-vol-dark)" />
      <path d="M52 106 L40 140" stroke="var(--char-vol)" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M68 106 L80 142" stroke="var(--char-vol)" strokeWidth="12" strokeLinecap="round" fill="none" />
      <rect x="36" y="62" width="46" height="52" rx="20" fill="var(--char-vol)" />
      <path d="M42 78 L20 94" stroke="var(--char-vol)" strokeWidth="10" strokeLinecap="round" fill="none" />
      <rect x="49" y="77" width="16" height="11" rx="3" fill="var(--char-paper)" />
      <circle cx="60" cy="36" r="21" fill="var(--char-vol)" />
      <path d="M38 34 Q38 12 60 12 Q82 12 82 34 Q72 24 38 34 Z" fill="var(--char-vol-dark)" />
      <circle cx="53" cy="41" r="2.5" fill="var(--char-paper)" />
      <circle cx="67" cy="41" r="2.5" fill="var(--char-paper)" />
      <path d="M54 48 Q60 53 66 48" stroke="var(--char-paper)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="47" cy="47" r="3.5" fill="var(--char-vol-cheek)" />
      <circle cx="73" cy="47" r="3.5" fill="var(--char-vol-cheek)" />
    </g>
  )
}

const LABEL: Record<Who, string> = { elder: '동행받는 분 캐릭터', volunteer: '봉사자 캐릭터' }

/** 캐릭터 한 명 (전신). size = 가로 px */
export function Character({ who, size = 80, title, ...rest }: { who: Who; size?: number; title?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={(size * 150) / 120}
      viewBox="0 0 120 150"
      role="img"
      aria-label={title ?? LABEL[who]}
      {...rest}
    >
      {who === 'elder' ? <Elder /> : <Volunteer />}
    </svg>
  )
}

/**
 * 하트 아치 아래 두 사람. 빈 화면·완료·안내 화면 위쪽에 써요.
 * waiting=true 이면 봉사자 자리를 점선으로 비워 둬요 (아직 신청자가 없을 때).
 */
export function CharacterPair({
  width = 220,
  waiting = false,
  baseline = 'var(--line-default)',
  title,
}: {
  width?: number
  waiting?: boolean
  baseline?: string
  title?: string
}) {
  const label = title ?? (waiting ? '하트 아치 아래에서 동행받는 분이 봉사자를 기다리는 그림' : '하트 아치 아래에서 동행받는 분과 봉사자가 함께 걷는 그림')
  return (
    <svg width={width} height={(width * 190) / 260} viewBox="0 0 260 190" role="img" aria-label={label}>
      <path
        d="M60 124 C26 92 28 34 78 30 C104 28 122 44 130 58 C138 44 156 28 182 30 C232 34 234 92 200 124"
        fill="none"
        stroke="var(--char-elder)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <svg x="66" y="62" width="68" height="85" viewBox="0 0 120 150">
        <Elder />
      </svg>
      {waiting ? (
        <g fill="none" stroke="var(--char-vol)" strokeWidth="3" strokeDasharray="3 7" strokeLinecap="round" opacity="0.7">
          <circle cx="160" cy="88" r="12" />
          <rect x="147" y="104" width="26" height="30" rx="11" />
        </g>
      ) : (
        <svg x="122" y="62" width="68" height="85" viewBox="0 0 120 150">
          <Volunteer />
        </svg>
      )}
      <line x1="40" y1="150" x2="220" y2="150" stroke={baseline} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/** 동그란 프로필 아바타 (얼굴 부분만 잘라서 보여줘요) */
export function CharacterAvatar({ who, size = 56 }: { who: Who; size?: number }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, background: who === 'elder' ? 'var(--brand-accent-soft)' : 'var(--brand-primary-soft)', overflow: 'hidden' }}
    >
      <svg width={size} height={size} viewBox="14 0 92 92" role="img" aria-label={LABEL[who]}>
        {who === 'elder' ? <Elder /> : <Volunteer />}
      </svg>
    </span>
  )
}
