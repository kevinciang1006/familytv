'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { getWatchHistory, getContinueWatching, type HistoryRow } from '@/lib/history'
import GridCard from '@/components/cards/GridCard'
import type { Video } from '@/lib/types'

function timeLeft(progressSec: number, durationSec: number): string {
  const rem = Math.max(0, durationSec - progressSec)
  const h = Math.floor(rem / 3600)
  const m = Math.floor((rem % 3600) / 60)
  if (h > 0) return `${h}h ${m}m left`
  return `${m}m left`
}

export default function HistoryPage() {
  const router = useRouter()
  const profile = useStore((s) => s.profile)
  const openVideo = useStore((s) => s.openVideo)
  const [continueRows, setContinueRows] = useState<HistoryRow[]>([])
  const [allRows, setAllRows] = useState<HistoryRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    Promise.all([
      getContinueWatching(profile.id),
      getWatchHistory(profile.id),
    ]).then(([c, a]) => {
      setContinueRows(c)
      setAllRows(a)
      setLoading(false)
    })
  }, [profile?.id])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--ink-4)' }} />
      </div>
    )
  }

  const isEmpty = allRows.length === 0

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-[24px] font-black text-ink" style={{ letterSpacing: '-0.02em' }}>
          Watch History
        </h1>
        {profile && <span className="text-2xl">{profile.emoji}</span>}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="text-5xl">🎬</div>
          <h2 className="text-xl font-black text-ink">Nothing watched yet</h2>
          <button
            onClick={() => router.push('/home')}
            className="px-5 py-2 rounded-full text-[14px] font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            Go to Home to start watching
          </button>
        </div>
      ) : (
        <>
          {/* Continue watching */}
          {continueRows.length > 0 && (
            <section className="mb-8">
              <h2 className="text-[16px] font-bold text-ink mb-4">Continue Watching</h2>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                {continueRows.map((row) => {
                  if (!row.videos) return null
                  const pct = row.duration_seconds > 0
                    ? (row.progress_seconds / row.duration_seconds) * 100
                    : 0
                  return (
                    <div
                      key={row.youtube_id}
                      className="flex-shrink-0 cursor-pointer"
                      style={{ width: 220 }}
                      onClick={() => row.videos && openVideo(row.videos as Video)}
                    >
                      <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                        {row.videos.thumbnail_url ? (
                          <img src={row.videos.thumbnail_url} alt={row.videos.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full" style={{ background: 'var(--surface-2)' }} />
                        )}
                        {/* Progress bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'rgba(255,255,255,0.2)' }}>
                          <div className="h-full" style={{ width: `${pct}%`, background: '#E7352C' }} />
                        </div>
                      </div>
                      <div className="mt-1.5">
                        <div className="text-[13px] font-bold text-ink truncate">{row.videos.title}</div>
                        <div className="text-[11px] text-ink-3 mt-0.5">
                          Resume · {timeLeft(row.progress_seconds, row.duration_seconds)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* All watched grid */}
          <section>
            <h2 className="text-[16px] font-bold text-ink mb-4">All watched</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {allRows.map((row) => {
                if (!row.videos) return null
                return (
                  <div key={row.youtube_id} className="relative">
                    <GridCard video={row.videos as Video} />
                    {row.completed && (
                      <div
                        className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: 'rgba(0,0,0,0.6)' }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
