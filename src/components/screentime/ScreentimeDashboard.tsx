'use client'

import { useStore } from '@/lib/store'
import { useScreentime, todayKey } from '@/hooks/useScreentime'

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-sm-val)' }}>
      <div className="mb-4">
        <div className="text-[16px] font-bold text-ink">{title}</div>
        {sub && <div className="text-[13px] text-ink-3 mt-0.5">{sub}</div>}
      </div>
      {children}
    </div>
  )
}

export default function ScreentimeDashboard() {
  const profile = useStore((s) => s.profile)
  const dailyLimitMin = useStore((s) => s.dailyLimitMin)
  const setDailyLimitMin = useStore((s) => s.setDailyLimitMin)
  const reminderMin = useStore((s) => s.reminderMin)
  const setReminderMin = useStore((s) => s.setReminderMin)

  const { todayMin, week } = useScreentime(profile)

  if (!profile) return null

  const pct = dailyLimitMin > 0 ? Math.min(1, todayMin / dailyLimitMin) : 0
  const r = 52
  const circ = 2 * Math.PI * r
  const todayH = Math.floor(todayMin / 60)
  const todayM = todayMin % 60
  const limitH = Math.floor(dailyLimitMin / 60)
  const limitM = dailyLimitMin % 60

  const maxMins = Math.max(60, ...week.map((d) => d.minutes))
  const weekTotal = week.reduce((s, d) => s + d.minutes, 0)
  const avg = Math.round(weekTotal / 7)
  const goalPct = maxMins > 0 ? (dailyLimitMin / maxMins) * 100 : 0

  const WATCH_CATS = [
    { label: 'Cartoons', pct: 0.42, color: '#EE7A2E' },
    { label: 'Learning', pct: 0.22, color: '#2D7DD2' },
    { label: 'Nature',   pct: 0.18, color: '#6BCB77' },
    { label: 'Music',    pct: 0.12, color: '#B088F9' },
    { label: 'Bedtime',  pct: 0.06, color: '#F4A338' },
  ]

  const today = todayKey()

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Head */}
      <div className="flex items-start justify-between mb-8 gap-6 flex-wrap">
        <div>
          <div className="text-[12px] font-black uppercase tracking-widest text-ink-3 mb-1">Screentime</div>
          <h1 className="text-3xl font-black text-ink" style={{ letterSpacing: '-0.02em' }}>
            Today for {profile.name}
          </h1>
          <p className="text-ink-3 mt-1">A gentle way to keep watching in balance.</p>
        </div>

        {/* Circular ring */}
        <div className="relative flex-shrink-0" style={{ width: 140, height: 140 }}>
          <svg viewBox="0 0 120 120" width="140" height="140">
            <circle cx="60" cy="60" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="12" />
            <circle
              cx="60" cy="60" r={r}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="12"
              strokeDasharray={`${pct * circ} ${circ}`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-[18px] font-black text-ink">
              {todayH > 0 ? `${todayH}h ` : ''}{todayM}m
            </div>
            <div className="text-[11px] text-ink-3">
              of {limitH > 0 ? `${limitH}h ` : ''}{limitM}m
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>

        <Panel
          title="This week"
          sub={`${Math.floor(weekTotal / 60)}h ${weekTotal % 60}m total · avg ${avg}m/day`}
        >
          <div className="relative h-36 mt-2">
            <div className="flex items-end gap-1.5 h-full">
              {week.map((d) => {
                const barH = maxMins > 0 ? Math.round((d.minutes / maxMins) * 100) : 0
                const isToday = d.key === today
                return (
                  <div key={d.key} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div className="relative w-full flex justify-center items-end" style={{ height: '85%' }}>
                      <div
                        className="w-full rounded-t-sm relative"
                        style={{
                          height: `${Math.max(barH, 2)}%`,
                          background: isToday ? 'var(--accent)' : 'var(--ink)',
                          opacity: isToday ? 1 : 0.15,
                        }}
                      >
                        <span
                          className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                          style={{ color: 'var(--ink)' }}
                        >
                          {d.minutes}m
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: isToday ? 'var(--accent)' : 'var(--ink-4)' }}>
                      {d.label}
                    </span>
                  </div>
                )
              })}
            </div>
            {/* Goal line */}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed pointer-events-none flex items-center"
              style={{
                bottom: `${Math.min(goalPct * 0.85, 85)}%`,
                borderColor: 'var(--accent)',
                opacity: 0.6,
              }}
            >
              <span className="text-[10px] font-bold ml-1" style={{ color: 'var(--accent)' }}>Daily goal</span>
            </div>
          </div>
        </Panel>

        <Panel title="Daily limit" sub="After this, we'll gently pause playback.">
          <div className="flex items-center gap-4 mt-2">
            <input
              type="range"
              min="15"
              max="240"
              step="15"
              value={dailyLimitMin}
              onChange={(e) => setDailyLimitMin(+e.target.value)}
              className="flex-1"
            />
            <div className="text-2xl font-black text-ink w-20 text-right">
              {limitH > 0 ? `${limitH}h` : ''}{limitM > 0 ? ` ${limitM}m` : ''}
            </div>
          </div>
          <p className="text-[12px] text-ink-3 mt-3">Applies to {profile.name}&apos;s profile only.</p>
        </Panel>

        <Panel title="Break reminders" sub="A friendly nudge every…">
          <div className="flex flex-wrap gap-2 mt-1">
            {[15, 20, 30, 45, 60, 0].map((m) => (
              <button
                key={m}
                onClick={() => setReminderMin(m)}
                className="px-4 py-2 rounded-full text-[13px] font-bold transition-colors"
                style={{
                  background: reminderMin === m ? 'var(--ink)' : 'var(--surface-2)',
                  color: reminderMin === m ? 'white' : 'var(--ink-2)',
                }}
              >
                {m === 0 ? 'Off' : `${m}m`}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-ink-3 mt-3">We&apos;ll suggest stretching, snacking, or heading outside.</p>
        </Panel>

        <Panel title="What&apos;s been watched" sub="Top categories today">
          <div className="flex flex-col gap-3 mt-1">
            {WATCH_CATS.map((c) => {
              const mins = Math.round(todayMin * c.pct)
              const barPct = todayMin > 0 ? (mins / todayMin) * 100 : 0
              return (
                <div key={c.label} className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold text-ink w-16">{c.label}</span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--surface-2)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${barPct}%`, background: c.color }} />
                  </div>
                  <span className="text-[12px] font-semibold text-ink-3 w-10 text-right">{mins}m</span>
                </div>
              )
            })}
          </div>
        </Panel>
      </div>
    </div>
  )
}
