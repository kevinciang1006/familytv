'use client'

import { useState, useMemo, useEffect } from 'react'
import { useStore } from '@/lib/store'
import type { Video, Channel } from '@/lib/types'
import { CONTINUE_IDS } from '@/lib/constants'
import { getVideosByCategory, getKidsVideos, getFeaturedVideo, getVideosByChannel } from '@/lib/videos'
import Hero from './Hero'
import CategoryBar from './CategoryBar'
import Row from './Row'

type Props = { videos: Video[]; channels: Channel[]; quotaExceeded?: boolean }

export default function HomeClient({ videos, channels, quotaExceeded = false }: Props) {
  const [cat, setCat] = useState('all')
  const [showQuotaToast, setShowQuotaToast] = useState(false)

  useEffect(() => {
    if (quotaExceeded) setShowQuotaToast(true)
  }, [quotaExceeded])
  const kidsMode = useStore((s) => s.kidsMode)
  const cardStyle = useStore((s) => s.cardStyle)

  const base = useMemo(() => kidsMode ? getKidsVideos(videos) : videos, [videos, kidsMode])

  const filtered = useMemo(
    () => cat === 'all' ? base : getVideosByCategory(base, cat),
    [base, cat]
  )

  const continueVideos = useMemo(() => {
    return CONTINUE_IDS
      .map((c) => base.find((v) => v.id === c.id))
      .filter(Boolean) as Video[]
  }, [base])

  const featured = getFeaturedVideo(videos)

  const hasChannels = channels.length > 0
  const hasVideos = base.length > 0

  // Channel rows filtered by kidsMode + active category
  const visibleChannels = useMemo(() => {
    return channels.filter((ch) => {
      if (kidsMode && !ch.is_kids) return false
      if (cat !== 'all' && ch.category !== cat) return false
      return true
    })
  }, [channels, kidsMode, cat])

  return (
    <div>
      {showQuotaToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 toast-slide-in" style={{ width: 'min(480px, calc(100vw - 32px))' }}>
          <div className="flex items-center gap-4 px-5 py-4 rounded-2xl" style={{ background: 'var(--ink)', color: 'white', boxShadow: 'var(--shadow-lg-val)' }}>
            <div className="text-2xl flex-shrink-0">⚠️</div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold">YouTube quota reached</div>
              <div className="text-[13px] opacity-70">Showing pinned videos only. Channel feeds will reload tomorrow.</div>
            </div>
            <button
              onClick={() => setShowQuotaToast(false)}
              className="px-3 py-1.5 rounded-full text-[13px] font-semibold flex-shrink-0"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {featured && <Hero video={featured} />}

      {!hasVideos && !hasChannels && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
          <div className="text-5xl">📺</div>
          <h2 className="text-xl font-black text-ink">No content yet</h2>
          <p className="text-ink-3 max-w-sm">
            Add channels in your Supabase dashboard to get started, or pin individual videos in the <code className="text-accent">videos</code> table.
          </p>
        </div>
      )}

      {hasVideos && (
        <div className="pt-6">
          <CategoryBar value={cat} onChange={setCat} kidsMode={kidsMode} />

          <div className="pt-4">
            {cat === 'all' && continueVideos.length > 0 && (
              <Row
                title="Keep watching"
                videos={continueVideos}
                isContinue
                subLabel="picks up right where you left off"
              />
            )}

            <Row
              title={kidsMode ? 'Popular with kids' : 'Trending with families'}
              videos={filtered.slice(0, 10)}
              cardStyle={cardStyle}
            />

            {/* Dynamic channel rows */}
            {visibleChannels.map((ch) => {
              const chVideos = getVideosByChannel(base, ch.channel_id).slice(0, 10)
              if (chVideos.length === 0) return null
              return (
                <Row
                  key={ch.channel_id}
                  title={`From ${ch.name}`}
                  videos={chVideos}
                  cardStyle={cardStyle}
                  channelHref={`https://youtube.com/channel/${ch.channel_id}`}
                  channelAvatar={ch.thumbnail_url ?? undefined}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
