'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import type { Video } from '@/lib/types'
import { PALETTES, CATEGORIES } from '@/lib/constants'
import { useStore } from '@/lib/store'

type Props = {
  video: Video
  style?: 'landscape' | 'poster'
  onClick?: () => void
}

function stripeBg(seed: number): string {
  const palette = PALETTES[seed % PALETTES.length]
  const [a, b] = palette
  const angle = 30 + (seed * 17) % 60
  return `repeating-linear-gradient(${angle}deg, ${a} 0 18px, ${b} 18px 36px)`
}

export default function VideoCard({ video, style = 'landscape', onClick }: Props) {
  const openVideo = useStore((s) => s.openVideo)
  const [hover, setHover] = useState(false)
  const isPoster = style === 'poster'
  const idx = video.id.charCodeAt(0) + video.id.charCodeAt(video.id.length - 1)

  const isStriped = !video.thumbnail_url
  const catLabel = CATEGORIES.find((c) => c.id === video.category)?.label ?? video.category

  function handleClick() {
    if (onClick) { onClick(); return }
    openVideo(video)
  }

  return (
    <div
      className="flex-shrink-0 cursor-pointer"
      style={{ width: isPoster ? 'var(--card-w-poster)' : 'var(--card-w)' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handleClick}
    >
      <div
        className="relative overflow-hidden rounded-[var(--radius)]"
        style={{
          aspectRatio: isPoster ? '2/3' : '16/9',
          transform: hover ? 'translateY(-3px)' : 'translateY(0)',
          transition: 'transform 180ms ease, box-shadow 180ms ease',
          boxShadow: hover ? 'var(--shadow-md-val)' : 'var(--shadow-sm-val)',
        }}
      >
        {isStriped ? (
          <div className="w-full h-full" style={{ background: stripeBg(idx) }} />
        ) : (
          <img
            src={video.thumbnail_url!}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        )}

        {/* dark bottom gradient + category + title overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }}
        />
        {!isPoster && (
          <span
            className="absolute bottom-8 left-2 text-[10px] font-bold uppercase tracking-wider text-white/80 px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(0,0,0,0.4)', fontFamily: 'var(--font-jetbrains)' }}
          >
            {catLabel}
          </span>
        )}
        <span
          className="absolute bottom-2 right-2 text-[11px] font-bold text-white px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(0,0,0,0.75)', fontFamily: 'var(--font-jetbrains)' }}
        >
          {video.duration_label || '—'}
        </span>

        {/* Hover previewing chip */}
        {hover && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-bold text-white"
            style={{ background: 'rgba(0,0,0,0.7)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
            Previewing
          </div>
        )}

        {/* Hover play button */}
        {hover && (
          <div
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent)' }}
            >
              <Play size={20} fill="white" className="text-white ml-0.5" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 px-0.5">
        <div
          className="text-[14.5px] font-extrabold text-ink leading-snug"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {video.title}
        </div>
        <div className="text-[12px] text-ink-3 mt-0.5 flex items-center gap-1 truncate">
          <span className="truncate">{video.channel_title}</span>
        </div>
      </div>
    </div>
  )
}
