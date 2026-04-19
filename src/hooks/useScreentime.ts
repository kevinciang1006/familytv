'use client'

import { useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'
import type { Profile } from '@/lib/types'

export function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function last7Days(): Array<{ key: string; label: string }> {
  const out = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    out.push({ key, label: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()] })
  }
  return out
}

const REMINDER_MESSAGES = [
  { title: 'Time to stretch!', text: "You've been watching for a while. How about a quick wiggle?" },
  { title: 'Hydration check', text: 'A good moment for a glass of water.' },
  { title: 'Little break?', text: 'Rest your eyes for a minute — look at something far away!' },
]

export function useScreentime(profile: Profile | null) {
  const {
    sessionSec, setSessionSec,
    usage, setUsage,
    dailyLimitMin, reminderMin,
    setReminder, reminder,
    limitHit, setLimitHit,
  } = useStore()

  const tickRef = useRef(0)
  const reminderIndexRef = useRef(0)

  useEffect(() => {
    setSessionSec(0)
  }, [profile?.id, setSessionSec])

  useEffect(() => {
    if (!profile) return

    const id = setInterval(() => {
      const next = tickRef.current + 1
      tickRef.current = next
      setSessionSec(next)

      if (next % 60 === 0) {
        const k = todayKey()
        const prev = useStore.getState().usage
        const profileUsage = { ...(prev[profile.id] ?? {}) }
        profileUsage[k] = (profileUsage[k] ?? 0) + 1
        const nextUsage = { ...prev, [profile.id]: profileUsage }
        try { localStorage.setItem('familytv:usage', JSON.stringify(nextUsage)) } catch {}
        setUsage(nextUsage)
      }

      if (reminderMin > 0 && next > 0 && next % (reminderMin * 60) === 0) {
        const msg = REMINDER_MESSAGES[reminderIndexRef.current % REMINDER_MESSAGES.length]
        reminderIndexRef.current++
        setReminder(msg)
      }
    }, 1000)

    return () => {
      clearInterval(id)
      tickRef.current = 0
    }
  }, [profile, reminderMin, setSessionSec, setUsage, setReminder])

  useEffect(() => {
    if (!profile) return
    const todayMin = usage[profile.id]?.[todayKey()] ?? 0
    if (todayMin >= dailyLimitMin && !limitHit) {
      setLimitHit(true)
    }
  }, [usage, profile, dailyLimitMin, limitHit, setLimitHit])

  const todayMin = profile ? (usage[profile.id]?.[todayKey()] ?? 0) : 0
  const week = last7Days().map((d) => ({
    ...d,
    minutes: profile ? (usage[profile.id]?.[d.key] ?? 0) : 0,
  }))

  return { sessionSec, todayMin, week, reminder, limitHit }
}
