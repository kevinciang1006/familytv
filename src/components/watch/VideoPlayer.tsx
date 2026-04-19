'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { upsertWatchHistory } from '@/lib/history'

type Props = { youtubeId: string }

export default function VideoPlayer({ youtubeId }: Props) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  const embedUrl = `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&iv_load_policy=3&fs=1&color=white&origin=${origin}&enablejsapi=1`

  useEffect(() => {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)

    const playerId = `yt-${youtubeId}`
    let player: Record<string, (...args: unknown[]) => unknown> | null = null
    let interval: ReturnType<typeof setInterval> | null = null

    const clearTick = () => {
      if (interval) { clearInterval(interval); interval = null }
    }

    const saveProgress = () => {
      const profile = useStore.getState().profile
      if (!player || !profile) return
      const progress = Math.floor((player.getCurrentTime?.() as number) ?? 0)
      const duration = Math.floor((player.getDuration?.() as number) ?? 0)
      if (duration > 0) {
        upsertWatchHistory({ profileId: profile.id, youtubeId, progressSeconds: progress, durationSeconds: duration })
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any

    const init = () => {
      player = new w.YT.Player(playerId, {
        events: {
          onStateChange: (e: { data: number }) => {
            if (e.data === 1) {
              clearTick()
              interval = setInterval(saveProgress, 10_000)
            } else {
              clearTick()
              saveProgress()
            }
          },
        },
      })
    }

    w.onYouTubeIframeAPIReady = init
    if (w.YT?.Player) init()

    return () => {
      clearTick()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).onYouTubeIframeAPIReady
      player = null
    }
  }, [youtubeId])

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: '16/9', borderRadius: 'var(--radius-lg)', background: '#000' }}
    >
      <iframe
        id={`yt-${youtubeId}`}
        src={embedUrl}
        title="Video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
      {/* Covers bottom control bar — blocks clicks and blurs YouTube branding */}
      <div className="absolute bottom-0 left-0 right-0 h-[9%] pointer-events-auto backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.4)' }} />
    </div>
  )
}
