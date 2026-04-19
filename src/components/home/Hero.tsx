'use client'

import { useRouter } from 'next/navigation'
import { Play, Plus, Info } from 'lucide-react'
import type { Video } from '@/lib/types'
import { PALETTES, CATEGORIES } from '@/lib/constants'
import { useStore } from '@/lib/store'

type Props = { video: Video }

function stripeBg(seed: number): string {
  const palette = PALETTES[(seed + 2) % PALETTES.length]
  const [a, b] = palette
  const angle = 30 + (seed * 17) % 60
  return `repeating-linear-gradient(${angle}deg, ${a} 0 18px, ${b} 18px 36px)`
}

export default function Hero({ video }: Props) {
  const router = useRouter()
  const profile = useStore((s) => s.profile)
  const idx = parseInt(video.id.replace(/\D/g, '')) || 0
  const isStriped = !video.thumbnail_url || video.thumbnail_url.startsWith('repeating-linear-gradient')
  const catLabel = CATEGORIES.find((c) => c.id === video.category)?.label ?? video.category

  return (
    <div
      className="relative overflow-hidden"
      style={{ minHeight: 440 }}
    >
      {/* Background */}
      {isStriped ? (
        <div className="absolute inset-0" style={{ background: stripeBg(idx) }} />
      ) : (
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full px-12 py-12" style={{ minHeight: 440 }}>
        <div className="max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider text-white mb-4"
            style={{ background: 'var(--accent)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            Featured for {profile?.name ?? 'the family'}
          </div>

          <h1
            className="text-5xl font-black text-white mb-3"
            style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            {video.title}
          </h1>

          <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: 'rgba(255,255,255,0.2)' }}>
              {catLabel}
            </span>
            {video.duration && <span>{video.duration}</span>}
            {video.duration && <span>·</span>}
            <span>Ages {video.age_rating}</span>
            {video.channel_title && <><span>·</span><span>{video.channel_title}</span></>}
          </div>

          {video.description && (
            <p
              className="text-white/80 text-sm mb-6 max-w-md"
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {video.description}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/watch/${video.youtube_id}`)}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-[15px] text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)' }}
            >
              <Play size={18} fill="white" />
              Play
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-[15px] text-white border border-white/50 hover:bg-white/10 transition-colors"
            >
              <Plus size={18} />
              My list
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-[15px] text-white border border-white/50 hover:bg-white/10 transition-colors"
            >
              <Info size={18} />
              More info
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
