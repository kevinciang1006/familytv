'use client'

import { useState, useEffect } from 'react'
import { getProfiles } from '@/lib/profiles'
import type { Profile } from '@/lib/types'

function ToggleRow({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'var(--line)' }}>
      <div>
        <div className="text-[14px] font-semibold text-ink">{label}</div>
        <div className="text-[12px] text-ink-3">{desc}</div>
      </div>
      <button
        className={`toggle-track ${value ? 'is-on' : ''}`}
        onClick={() => onChange(!value)}
        aria-pressed={value}
      >
        <span className="toggle-knob" />
      </button>
    </div>
  )
}

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

export default function ParentalClient() {
  const [maxAge, setMaxAge] = useState(8)
  const [hours, setHours] = useState(2)
  const [autoplay, setAutoplay] = useState(true)
  const [safeSearch, setSafeSearch] = useState(true)
  const [requirePin, setRequirePin] = useState(true)
  const [pin, setPin] = useState(['', '', '', ''])
  const [kids, setKids] = useState<Profile[]>([])

  useEffect(() => {
    getProfiles().then((all) => setKids(all.filter((p) => p.is_kids)))
  }, [])

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink" style={{ letterSpacing: '-0.02em' }}>Parental controls</h1>
        <p className="text-ink-3 mt-1">Set limits, pick categories, keep things grown-up-approved.</p>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>

        <Panel title="Kids profiles" sub="Customize per child">
          <div className="flex flex-col gap-3">
            {kids.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: p.color }}>
                  <span>{p.emoji}</span>
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-bold text-ink">{p.name}</div>
                  <div className="text-[12px] text-ink-3">Age {p.age} · All family-friendly</div>
                </div>
                <button className="px-3 py-1 rounded-full text-[12px] font-semibold border transition-colors hover:bg-surface-2" style={{ borderColor: 'var(--line)', color: 'var(--ink-2)' }}>
                  Edit
                </button>
              </div>
            ))}
            <button className="mt-1 text-[13px] font-semibold text-left py-2 border-t" style={{ borderColor: 'var(--line)', color: 'var(--ink-3)' }}>
              + Add a kid profile
            </button>
          </div>
        </Panel>

        <Panel title="Watch time" sub="Daily limit for kids profiles">
          <div className="flex items-center gap-4 mt-2">
            <input
              type="range"
              min="0.5"
              max="6"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(+e.target.value)}
              className="flex-1"
            />
            <div className="text-2xl font-black text-ink w-16 text-right">{hours}h</div>
          </div>
          <p className="text-[12px] text-ink-3 mt-3">A gentle reminder appears 5 minutes before the limit.</p>
        </Panel>

        <Panel title="Maximum age rating" sub="Only show content appropriate for this age">
          <div className="flex flex-wrap gap-2 mt-1">
            {[4, 6, 8, 10, 12].map((a) => (
              <button
                key={a}
                onClick={() => setMaxAge(a)}
                className="px-4 py-2 rounded-full text-[13px] font-bold transition-colors"
                style={{
                  background: maxAge === a ? 'var(--ink)' : 'var(--surface-2)',
                  color: maxAge === a ? 'white' : 'var(--ink-2)',
                }}
              >
                Ages {a}+
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Playback">
          <ToggleRow label="Autoplay next episode" desc="Start the next video automatically" value={autoplay} onChange={setAutoplay} />
          <ToggleRow label="Safe search" desc="Hide results above the age limit" value={safeSearch} onChange={setSafeSearch} />
          <ToggleRow label="Require PIN to exit kids mode" desc="Keep kids mode sticky" value={requirePin} onChange={setRequirePin} />
        </Panel>

        <Panel title="Parent PIN" sub="Used to change these settings and leave kids mode">
          <div className="flex items-center gap-3 mt-3">
            {pin.map((_, i) => (
              <input
                key={i}
                type="password"
                maxLength={1}
                value={pin[i]}
                onChange={(e) => {
                  const next = [...pin]
                  next[i] = e.target.value.replace(/\D/g, '')
                  setPin(next)
                }}
                className="pin-box text-center outline-none"
                style={{ width: 48, height: 56, fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-jetbrains)', border: '2px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--surface)' }}
              />
            ))}
            <button
              onClick={() => setPin(['', '', '', ''])}
              className="ml-2 text-[13px] font-semibold underline"
              style={{ color: 'var(--accent)' }}
            >
              Reset
            </button>
          </div>
        </Panel>

        <Panel title="Activity this week">
          <div className="flex flex-col gap-3 mt-1">
            {[
              { name: 'Emma',  color: '#F4A338', pct: 62, val: '3h 42m' },
              { name: 'Leo',   color: '#6BCB77', pct: 44, val: '2h 38m' },
              { name: 'Nana',  color: '#B088F9', pct: 22, val: '1h 18m' },
            ].map((row) => (
              <div key={row.name} className="flex items-center gap-3">
                <span className="text-[13px] font-semibold text-ink w-12">{row.name}</span>
                <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--surface-2)' }}>
                  <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }} />
                </div>
                <span className="text-[12px] font-semibold text-ink-3 w-14 text-right">{row.val}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
