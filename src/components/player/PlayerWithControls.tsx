'use client'

import { useEffect, useRef, useState } from 'react'
import { X, RotateCcw, Maximize2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { upsertWatchHistory } from '@/lib/history'
import type { Video } from '@/lib/types'

type Props = { video: Video }

export default function PlayerWithControls({ video }: Props) {
  const closeVideo = useStore((s) => s.closeVideo)
  const [isCSSRotated, setIsCSSRotated] = useState(false)
  const [isPhysicalLandscape, setIsPhysicalLandscape] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function detectLandscape() {
    return window.innerWidth > window.innerHeight
  }

  useEffect(() => {
    const update = () => {
      const landscape = detectLandscape()
      setIsPhysicalLandscape(landscape)
      if (landscape) setIsCSSRotated(false)
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', () => setTimeout(update, 100))
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  useEffect(() => {
    const clearTick = () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    }

    const saveProgress = () => {
      const profile = useStore.getState().profile
      if (!playerRef.current || !profile) return
      const progress = Math.floor((playerRef.current.getCurrentTime?.() as number) ?? 0)
      const duration = Math.floor((playerRef.current.getDuration?.() as number) ?? 0)
      if (duration > 0) {
        upsertWatchHistory({ profileId: profile.id, youtubeId: video.youtube_id, progressSeconds: progress, durationSeconds: duration })
      }
    }

    const playerId = `yt-dialog-${video.youtube_id}`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any

    const init = () => {
      playerRef.current = new w.YT.Player(playerId, {
        events: {
          onStateChange: (e: { data: number }) => {
            const playing = e.data === 1
            setIsPlaying(playing)
            if (playing) {
              clearTick()
              intervalRef.current = setInterval(saveProgress, 10_000)
            } else {
              clearTick()
              saveProgress()
            }
          },
        },
      })
    }

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }

    w.onYouTubeIframeAPIReady = init
    if (w.YT?.Player) init()

    return () => {
      clearTick()
      saveProgress()
      delete w.onYouTubeIframeAPIReady
      playerRef.current = null
    }
  }, [video.youtube_id])

  const isLandscape = isCSSRotated || isPhysicalLandscape

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const embedUrl = [
    `https://www.youtube.com/embed/${video.youtube_id}`,
    `?rel=0`,
    `&modestbranding=1`,
    `&iv_load_policy=3`,
    `&fs=1`,
    `&color=white`,
    `&enablejsapi=1`,
    `&origin=${origin}`,
    `&autoplay=1`,
  ].join('')

  const containerStyle: React.CSSProperties = isCSSRotated
    ? {
        width: '100vh',
        height: '100vw',
        transform: 'rotate(90deg)',
        WebkitTransform: 'rotate(90deg)',
        transformOrigin: 'center center',
        transition: 'transform 300ms ease',
        flexShrink: 0,
      }
    : isPhysicalLandscape
    ? { width: '100vw', height: '100vh', flexShrink: 0 }
    : { width: '100vw', height: `${(100 * 9) / 16}vw`, maxHeight: '100vh', flexShrink: 0 }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Player container */}
      <div style={{ position: 'relative', ...containerStyle }}>
        <iframe
          id={`yt-dialog-${video.youtube_id}`}
          src={embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            WebkitOverflowScrolling: 'touch',
          }}
        />

        {/* Top overlay — close button */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 56,
            // background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 12,
            zIndex: 10,
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={closeVideo}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Middle interceptor — blocks YouTube redirect when paused */}
        {/* <div
          style={{
            position: 'absolute',
            top: 56,
            bottom: 48,
            left: 0,
            right: 0,
            zIndex: 9,
            pointerEvents: isPlaying ? 'none' : 'auto',
            background: 'transparent',
            cursor: 'pointer',
          }}
          onClick={() => playerRef.current?.playVideo?.()}
        /> */}

        {/* Bottom overlay — rotate button + click interceptor */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: isLandscape ? 56 : 'clamp(36px, 92vw, 56px)',
            // background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 18,
            zIndex: 10,
            pointerEvents: 'auto',
          }}
        >
          {!isPhysicalLandscape && (
            <button
              onClick={() => setIsCSSRotated((r) => !r)}
              title={isCSSRotated ? 'Exit landscape' : 'Landscape mode'}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
              }}
            >
              <Maximize2 size={18} />
            </button>
          )}
        </div>

        {/* Fullscreen button blocker — YouTube always renders it regardless of allowFullScreen */}
        <div
          style={{
            position: 'absolute',
            bottom: isLandscape ? 84 : 'clamp(44px, 24vw, 90px)',
            right: isLandscape ? 12 : 'clamp(2px, 8vw, 28px)',
            width: isLandscape ? 52 : 'clamp(28px, 12vw, 36px)',
            height: isLandscape ? 52 : 'clamp(28px, 12vw, 36px)',
            zIndex: 10,
            pointerEvents: 'auto',
            // background: 'rgba(252, 134, 134, 0.4)',
          }}
        />
      </div>

      {/* Video info (portrait only) */}
      {/* {!isLandscape && (
        <div
          style={{
            width: '100%',
            padding: '12px 16px',
            background: '#000',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <p
            style={{
              fontWeight: 800,
              fontSize: 15,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {video.title}
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>
            {video.channel_title}
          </p>
        </div>
      )} */}
    </div>
  )
}
