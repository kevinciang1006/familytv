'use client'

import { useState, FormEvent } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Shield, Bell, Search } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useScreentime } from '@/hooks/useScreentime'
import FamilyTVLogo from '@/components/FamilyTVLogo'
import ScreentimeChip from './ScreentimeChip'

const NAV_LINKS = [
  { href: '/home', label: 'Home' },
  { href: '/kids', label: 'Kids' },
  { href: '/channels', label: 'Channels' },
  { href: '/search', label: 'Search' },
  { href: '/screentime', label: 'Screentime' },
]

export default function TopNav() {
  const router = useRouter()
  const pathname = usePathname()
  const profile = useStore((s) => s.profile)
  const kidsMode = useStore((s) => s.kidsMode)
  const dailyLimitMin = useStore((s) => s.dailyLimitMin)

  const { sessionSec, todayMin } = useScreentime(profile)

  const [query, setQuery] = useState('')

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const isKids = kidsMode

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: isKids
          ? 'linear-gradient(to right, #fefce8, #fffbeb)'
          : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderColor: isKids ? 'transparent' : 'var(--line)',
        borderBottomStyle: isKids ? 'dashed' : 'solid',
        borderBottomColor: isKids ? 'var(--line)' : 'var(--line)',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-16 grid grid-cols-3 items-center gap-4">
        {/* Left */}
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/home')} className="flex-shrink-0">
            <FamilyTVLogo small />
          </button>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <button
                  key={link.href}
                  onClick={() => router.push(link.href)}
                  className="px-3 py-1.5 rounded-full text-[14px] font-semibold transition-colors"
                  style={{
                    background: active ? 'var(--ink)' : 'transparent',
                    color: active ? 'white' : 'var(--ink-2)',
                  }}
                >
                  {link.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Center — search */}
        <form onSubmit={handleSearch} className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--ink-4)' }}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => router.push('/search')}
            placeholder={isKids ? 'Search cartoons, songs…' : 'Search videos, topics…'}
            className="w-full pl-9 pr-4 py-2 rounded-full text-[14px] outline-none transition-all"
            style={{
              background: 'var(--surface-2)',
              color: 'var(--ink)',
              border: '1.5px solid transparent',
            }}
            onFocusCapture={(e) => {
              e.currentTarget.style.borderColor = 'var(--ink)'
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-soft)'
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.borderColor = 'transparent'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </form>

        {/* Right */}
        <div className="flex items-center justify-end gap-2">
          {profile && (
            <ScreentimeChip
              sessionSec={sessionSec}
              todayMin={todayMin}
              limitMin={dailyLimitMin}
            />
          )}

          <button
            onClick={() => router.push('/parental')}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-2 transition-colors"
            title="Parental controls"
          >
            <Shield size={18} style={{ color: 'var(--ink-3)' }} />
          </button>

          <button
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-2 transition-colors"
            title="Notifications"
          >
            <Bell size={18} style={{ color: 'var(--ink-3)' }} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {profile && (
            <button
              onClick={() => router.push('/')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: profile.color }}
              title={profile.name}
            >
              <span role="img">{profile.emoji}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
