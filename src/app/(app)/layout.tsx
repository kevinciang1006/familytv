'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'
import BottomNav from '@/components/nav/BottomNav'
import ReminderToast from '@/components/screentime/ReminderToast'
import LimitOverlay from '@/components/screentime/LimitOverlay'
import VideoDialog from '@/components/player/VideoDialog'

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

  const isWatch = pathname.startsWith('/watch/')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <main className={isWatch ? undefined : 'pb-20'}>{children}</main>
      {!isWatch && <BottomNav />}
      <ReminderToast />
      <LimitOverlay />
      <VideoDialog />
    </div>
  )
}
