'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'
import TopNav from '@/components/nav/TopNav'
import ReminderToast from '@/components/screentime/ReminderToast'
import LimitOverlay from '@/components/screentime/LimitOverlay'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const profile = useStore((s) => s.profile)

  useEffect(() => {
    if (!profile && pathname !== '/') {
      router.replace('/')
    }
  }, [profile, pathname, router])

  if (!profile) return null

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <TopNav />
      <main>{children}</main>
      <ReminderToast />
      <LimitOverlay />
    </div>
  )
}
