'use client'

import type { Video } from '@/lib/types'
import { PALETTES } from '@/lib/constants'
import { useStore } from '@/lib/store'

function stripeBg(seed: number): string {
  const palette = PALETTES[seed % PALETTES.length]
  const angle = 30 + (seed * 17) % 60
  return `repeating-linear-gradient(${angle}deg, ${palette[0]} 0 18px, ${palette[1]} 18px 36px)`
}

export default function GridCard({ video }: { video: Video }) {
  const openVideo = useStore((s) => s.openVideo)
  const seed = video.id.charCodeAt(0) + video.id.charCodeAt(video.id.length - 1)
  const isStriped = !video.thumbnail_url

  return (
    <div
      className="cursor-pointer group"
      onClick={() => openVideo(video)}
    >
      {/* Thumbnail */}
      <div
        className="relative w-full overflow-hidden rounded-xl"
        style={{ aspectRatio: '16/9' }}
      >
        {isStriped ? (
          <div className="w-full h-full" style={{ background: stripeBg(seed) }} />
        ) : (
          <img
            src={video.thumbnail_url!}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        )}

        {/* Duration badge */}
        <span
          className="absolute bottom-2 right-2 text-[11px] font-bold text-white px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(0,0,0,0.75)', fontFamily: 'var(--font-jetbrains)' }}
        >
          {video.duration_label || '—'}
        </span>
      </div>

      {/* Info */}
      <div className="mt-2 px-0.5">
        <div
          className="text-[13px] font-bold text-ink leading-snug"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {video.title}
        </div>
        <div className="text-[12px] text-ink-3 mt-0.5 truncate">{video.channel_title}</div>
      </div>
    </div>
  )
}
