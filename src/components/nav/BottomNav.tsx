'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Tv, History, User } from 'lucide-react'

const TABS = [
  { id: 'home',     href: '/home',     icon: Home,    label: 'Home'     },
  { id: 'channels', href: '/channels', icon: Tv,      label: 'Channels' },
  { id: 'history',  href: '/history',  icon: History, label: 'History'  },
  { id: 'you',      href: '/you',      icon: User,    label: 'You'      },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex"
      style={{
        height: 64,
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'var(--surface)',
        borderTop: '1px solid var(--line)',
      }}
    >
      {TABS.map(({ id, href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <button
            key={id}
            onClick={() => router.push(href)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5"
            style={{
              color: active ? 'var(--accent)' : 'var(--ink-3)',
              transition: 'color 150ms ease',
            }}
          >
            <Icon
              size={24}
              style={{
                transform: active ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 150ms ease',
              }}
            />
            <span className="text-[11px] font-semibold">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
