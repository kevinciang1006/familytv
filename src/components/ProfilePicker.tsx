'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { getProfiles } from '@/lib/profiles'
import type { Profile } from '@/lib/types'
import FamilyTVLogo from './FamilyTVLogo'

export default function ProfilePicker() {
  const router = useRouter()
  const setProfile = useStore((s) => s.setProfile)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfiles().then((data) => {
      setProfiles(data)
      setLoading(false)
    })
  }, [])

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
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div
                    className="w-28 h-28 rounded-full animate-pulse"
                    style={{ background: 'var(--surface-2)' }}
                  />
                  <div
                    className="h-4 w-20 rounded animate-pulse"
                    style={{ background: 'var(--surface-2)' }}
                  />
                </div>
              ))
            : profiles.map((p) => (
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
                  {p.is_kids && (
                    <span className="text-[11px] font-bold tracking-widest uppercase text-accent">
                      Kid · Age {p.age}
                    </span>
                  )}
                </button>
              ))}
        </div>
      </div>
    </div>
  )
}
