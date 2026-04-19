'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, Density, CardStyle, Accent, Video } from './types'

type AppStore = {
  profile: Profile | null
  setProfile: (p: Profile | null) => void

  videoDialogOpen: boolean
  activeVideo: Video | null
  openVideo: (video: Video) => void
  closeVideo: () => void

  isCSSRotated: boolean
  setIsCSSRotated: (v: boolean) => void

  currentVideoId: string | null
  setCurrentVideoId: (id: string | null) => void

  kidsMode: boolean
  setKidsMode: (v: boolean) => void
  density: Density
  setDensity: (v: Density) => void
  cardStyle: CardStyle
  setCardStyle: (v: CardStyle) => void
  accent: Accent
  setAccent: (v: Accent) => void

  dailyLimitMin: number
  setDailyLimitMin: (v: number) => void
  reminderMin: number
  setReminderMin: (v: number) => void

  sessionSec: number
  setSessionSec: (v: number) => void
  usage: Record<string, Record<string, number>>
  setUsage: (v: Record<string, Record<string, number>>) => void
  reminder: { title: string; text: string } | null
  setReminder: (v: { title: string; text: string } | null) => void
  limitHit: boolean
  setLimitHit: (v: boolean) => void
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (p) =>
        set({ profile: p, kidsMode: p?.is_kids ?? false, sessionSec: 0 }),

      videoDialogOpen: false,
      activeVideo: null,
      openVideo: (video) => set({ videoDialogOpen: true, activeVideo: video }),
      closeVideo: () => set({ videoDialogOpen: false, activeVideo: null, isCSSRotated: false }),

      isCSSRotated: false,
      setIsCSSRotated: (v) => set({ isCSSRotated: v }),

      currentVideoId: null,
      setCurrentVideoId: (id) => set({ currentVideoId: id }),

      kidsMode: false,
      setKidsMode: (v) => set({ kidsMode: v }),
      density: 'cozy',
      setDensity: (v) => set({ density: v }),
      cardStyle: 'landscape',
      setCardStyle: (v) => set({ cardStyle: v }),
      accent: 'red',
      setAccent: (v) => set({ accent: v }),

      dailyLimitMin: 90,
      setDailyLimitMin: (v) => set({ dailyLimitMin: v }),
      reminderMin: 30,
      setReminderMin: (v) => set({ reminderMin: v }),

      sessionSec: 0,
      setSessionSec: (v) => set({ sessionSec: v }),
      usage: {},
      setUsage: (v) => set({ usage: v }),
      reminder: null,
      setReminder: (v) => set({ reminder: v }),
      limitHit: false,
      setLimitHit: (v) => set({ limitHit: v }),
    }),
    {
      name: 'familytv:state',
      partialize: (s) => ({
        profile: s.profile,
        density: s.density,
        cardStyle: s.cardStyle,
        accent: s.accent,
        dailyLimitMin: s.dailyLimitMin,
        reminderMin: s.reminderMin,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.profile) {
          state.kidsMode = state.profile.is_kids ?? false
        }
      },
    }
  )
)
