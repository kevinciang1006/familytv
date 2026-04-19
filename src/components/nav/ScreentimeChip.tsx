'use client'

import { useRouter } from 'next/navigation'

type Props = {
  sessionSec: number
  todayMin: number
  limitMin: number
}

function formatMMSS(s: number): string {
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${m}:${String(ss).padStart(2, '0')}`
}

export default function ScreentimeChip({ sessionSec, todayMin, limitMin }: Props) {
  const router = useRouter()
  const pct = limitMin > 0 ? Math.min(1, todayMin / limitMin) : 0
  const near = pct > 0.8
  const r = 15
  const circ = 2 * Math.PI * r

  return (
    <button
      onClick={() => router.push('/screentime')}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors"
      style={{
        background: near ? 'var(--accent-soft)' : 'var(--surface-2)',
      }}
      title="Screentime"
    >
      <svg viewBox="0 0 36 36" width="22" height="22" className="flex-shrink-0">
        <circle
          cx="18" cy="18" r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.18}
          strokeWidth="4"
        />
        <circle
          cx="18" cy="18" r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="4"
          strokeDasharray={`${pct * circ} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 18 18)"
        />
      </svg>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[12px] font-bold font-mono text-ink" style={{ fontFamily: 'var(--font-jetbrains)' }}>
          {formatMMSS(sessionSec)}
        </span>
        <span className="text-[10px] text-ink-3">
          {todayMin}/{limitMin}m
        </span>
      </span>
    </button>
  )
}
