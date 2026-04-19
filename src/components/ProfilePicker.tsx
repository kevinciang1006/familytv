'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { PROFILES } from '@/lib/constants'
import type { Profile } from '@/lib/types'
import FamilyTVLogo from './FamilyTVLogo'

export default function ProfilePicker() {
  const router = useRouter()
  const setProfile = useStore((s) => s.setProfile)

  function pick(profile: Profile) {
    setProfile(profile)
    router.push('/home')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-6 py-12">
      <div className="flex flex-col items-center gap-10 w-full max-w-3xl">
        <FamilyTVLogo />

        <h1
          className="text-[28px] font-black text-ink"
          style={{ letterSpacing: '-0.02em' }}
        >
          Who&rsquo;s watching?
        </h1>

        <div
          className="grid justify-center gap-6 w-full"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, max-content))' }}
        >
          {PROFILES.map((p) => (
            <button
              key={p.id}
              onClick={() => pick(p)}
              className="flex flex-col items-center gap-3 group profile-card-hover outline-none"
            >
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-5xl"
                style={{
                  background: p.color,
                  boxShadow: 'var(--shadow-sm-val)',
                  transition: 'box-shadow 200ms ease',
                }}
              >
                <span role="img">{p.emoji}</span>
              </div>
              <span className="text-[18px] font-extrabold text-ink group-hover:text-accent transition-colors">
                {p.name}
              </span>
              {p.kids && (
                <span className="text-[11px] font-bold tracking-widest uppercase text-accent">
                  Kid · Age {p.age}
                </span>
              )}
            </button>
          ))}

          <button className="flex flex-col items-center gap-3 group profile-card-hover outline-none">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{ border: '2px dashed var(--line-2)' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="text-[18px] font-extrabold text-ink-3">Add profile</span>
          </button>
        </div>

        <button className="text-sm text-ink-3 underline underline-offset-2 hover:text-ink transition-colors">
          Manage profiles
        </button>
      </div>
    </div>
  )
}
