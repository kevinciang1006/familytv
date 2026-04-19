'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Clock } from 'lucide-react'
import { useStore } from '@/lib/store'
import { getProfiles } from '@/lib/profiles'
import { getProfileStats } from '@/lib/history'
import type { Profile } from '@/lib/types'

export default function YouPage() {
  const router = useRouter()
  const profile = useStore((s) => s.profile)
  const setProfile = useStore((s) => s.setProfile)
  const [stats, setStats] = useState<{ count: number; totalSeconds: number } | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])

  useEffect(() => {
    getProfiles().then(setProfiles)
  }, [])

  useEffect(() => {
    if (!profile) return
    getProfileStats(profile.id).then(setStats)
  }, [profile?.id])

  if (!profile) return null

  const totalHours = stats ? (stats.totalSeconds / 3600).toFixed(1) : '—'

  return (
    <div className="max-w-[480px] mx-auto px-5 py-8">
      {/* Current profile */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
          style={{ background: profile.color }}
        >
          {profile.emoji}
        </div>
        <div className="text-[22px] font-extrabold text-ink">{profile.name}</div>
        <div className="text-[13px] text-ink-3">Switch profile</div>
      </div>

      {/* Profile switcher */}
      <div className="flex justify-center gap-5 mb-8">
        {profiles.map((p: Profile) => {
          const isActive = p.id === profile.id
          return (
            <button
              key={p.id}
              onClick={() => setProfile(p)}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all"
                style={{
                  background: p.color,
                  outline: isActive ? `3px solid var(--accent)` : '3px solid transparent',
                  outlineOffset: 2,
                }}
              >
                {p.emoji}
              </div>
              <span className="text-[12px] font-semibold text-ink-2">{p.name}</span>
            </button>
          )
        })}
      </div>

      {/* Stats */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--surface-2)' }}>
        <div className="text-[13px] font-bold text-ink-3 mb-3 uppercase tracking-wide">Your activity</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-[28px] font-black text-ink">{stats?.count ?? '—'}</div>
            <div className="text-[12px] text-ink-3">Videos watched</div>
          </div>
          <div className="text-center">
            <div className="text-[28px] font-black text-ink">{totalHours}</div>
            <div className="text-[12px] text-ink-3">Hours watched</div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-2xl overflow-hidden mb-4" style={{ border: '1px solid var(--line)' }}>
        <div className="text-[13px] font-bold text-ink-3 uppercase tracking-wide px-4 pt-4 pb-2">Settings</div>

        {/* Parental controls */}
        <button
          onClick={() => router.push('/parental')}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-2 transition-colors"
          style={{ borderTop: '1px solid var(--line)' }}
        >
          <div className="flex items-center gap-2">
            <Shield size={16} style={{ color: 'var(--ink-3)' }} />
            <span className="text-[14px] font-semibold text-ink">Parental Controls</span>
          </div>
          <span className="text-ink-4 text-[18px]">›</span>
        </button>

        {/* Screentime */}
        <button
          onClick={() => router.push('/screentime')}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-2 transition-colors"
          style={{ borderTop: '1px solid var(--line)' }}
        >
          <div className="flex items-center gap-2">
            <Clock size={16} style={{ color: 'var(--ink-3)' }} />
            <span className="text-[14px] font-semibold text-ink">Screentime</span>
          </div>
          <span className="text-ink-4 text-[18px]">›</span>
        </button>
      </div>
    </div>
  )
}
