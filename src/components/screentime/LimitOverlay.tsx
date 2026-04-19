'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function LimitOverlay() {
  const router = useRouter()
  const profile = useStore((s) => s.profile)
  const usage = useStore((s) => s.usage)
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const todayMin = profile ? (usage[profile.id]?.[todayKey] ?? 0) : 0
  const limitMin = useStore((s) => s.dailyLimitMin)
  const setLimitHit = useStore((s) => s.setLimitHit)
  const setDailyLimitMin = useStore((s) => s.setDailyLimitMin)
  const setProfile = useStore((s) => s.setProfile)
  const limitHit = useStore((s) => s.limitHit)

  if (!limitHit || !profile) return null

  const h = Math.floor(todayMin / 60)
  const m = todayMin % 60
  const lh = Math.floor(limitMin / 60)
  const lm = limitMin % 60

  function exit() {
    setLimitHit(false)
    setProfile(null)
    router.push('/')
  }

  function add15() {
    setDailyLimitMin(limitMin + 15)
    setLimitHit(false)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 overlay-fade"
      style={{ background: 'rgba(15,15,16,0.85)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 flex flex-col items-center text-center gap-6"
        style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-lg-val)' }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
          style={{ background: profile.color }}
        >
          <span role="img">{profile.emoji}</span>
        </div>

        <div>
          <h2 className="text-[22px] font-black text-ink" style={{ letterSpacing: '-0.02em' }}>
            Time to take a break, {profile.name}!
          </h2>
          <p className="text-ink-3 text-[14px] mt-2">
            You&apos;ve watched <strong className="text-ink">{h > 0 ? `${h}h ` : ''}{m}m</strong> today —
            that&apos;s your daily limit of <strong className="text-ink">{lh > 0 ? `${lh}h ` : ''}{lm}m</strong>.
          </p>
        </div>

        <div className="w-full">
          <div className="text-[13px] font-bold text-ink-3 mb-3">Try something else for a while:</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: '🚶', label: 'Go outside' },
              { emoji: '📖', label: 'Read a book' },
              { emoji: '🎨', label: 'Draw something' },
              { emoji: '🧩', label: 'Play a game' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-[14px] font-semibold text-ink"
                style={{ background: 'var(--surface-2)' }}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={exit}
            className="w-full py-3 rounded-xl font-bold text-[15px] text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            See you tomorrow
          </button>
          {!profile.is_kids ? (
            <button
              onClick={add15}
              className="w-full py-3 rounded-xl font-bold text-[15px] text-ink border transition-colors hover:bg-surface-2"
              style={{ borderColor: 'var(--line)' }}
            >
              Add 15 minutes
            </button>
          ) : (
            <button
              className="w-full py-3 rounded-xl font-bold text-[15px] text-ink border transition-colors hover:bg-surface-2"
              style={{ borderColor: 'var(--line)' }}
            >
              Ask a grown-up for PIN
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
