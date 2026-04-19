'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import type { Video } from '@/lib/types'
import { PALETTES } from '@/lib/constants'
import { useStore } from '@/lib/store'

type Props = {
  video: Video
  progress: number
}

function stripeBg(seed: number): string {
  const palette = PALETTES[seed % PALETTES.length]
  const [a, b] = palette
  const angle = 30 + (seed * 17) % 60
  return `repeating-linear-gradient(${angle}deg, ${a} 0 18px, ${b} 18px 36px)`
}

export default function ContinueCard({ video, progress }: Props) {
  const openVideo = useStore((s) => s.openVideo)
  const [hover, setHover] = useState(false)
  const idx = video.id.charCodeAt(0) + video.id.charCodeAt(video.id.length - 1)
  const pct = Math.round(progress * 100)

  const isStriped = !video.thumbnail_url

  return (
    <div
      className="flex-shrink-0 cursor-pointer"
      style={{ width: 'var(--card-w)' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => openVideo(video)}
    >
      <div
        className="relative overflow-hidden rounded-[var(--radius)]"
        style={{
          aspectRatio: '16/9',
          transform: hover ? 'translateY(-3px)' : 'translateY(0)',
          transition: 'transform 180ms ease, box-shadow 180ms ease',
          boxShadow: hover ? 'var(--shadow-md-val)' : 'var(--shadow-sm-val)',
        }}
      >
        {isStriped ? (
          <div className="w-full h-full" style={{ background: stripeBg(idx) }} />
        ) : (
          <img src={video.thumbnail_url!} alt={video.title} className="w-full h-full object-cover" />
        )}

        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }}
        />

        {/* Resume badge */}
        <div
          className="absolute top-2 right-2 text-[11px] font-bold text-white px-2 py-0.5 rounded-full"
          style={{ background: 'var(--accent)' }}
        >
          Resume
        </div>

        {/* Duration badge */}
        <span
          className="absolute bottom-6 right-2 text-[11px] font-bold text-white px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(0,0,0,0.75)', fontFamily: 'var(--font-jetbrains)' }}
        >
          {video.duration_label || '—'}
        </span>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <div className="h-full" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
        </div>

        {hover && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <Play size={20} fill="white" className="text-white ml-0.5" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 px-0.5">
        <div
          className="text-[14.5px] font-extrabold text-ink leading-snug"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {video.title}
        </div>
        <div className="text-[12px] text-ink-3 mt-0.5">
          {pct}% watched · {video.duration_label || '—'}
        </div>
      </div>
    </div>
  )
}
