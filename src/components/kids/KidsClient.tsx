'use client'

import { useRef } from 'react'
import type { Video } from '@/lib/types'
import { useStore } from '@/lib/store'
import Row from '@/components/home/Row'

type Props = { videos: Video[] }

const TILES = [
  { id: 'cartoons', label: 'Cartoons',   color: '#FFC2A3', emoji: '🎨' },
  { id: 'learning', label: 'Learning',   color: '#A8D8EA', emoji: '📚' },
  { id: 'music',    label: 'Sing-alongs',color: '#FFE089', emoji: '🎵' },
  { id: 'nature',   label: 'Nature',     color: '#B5E7A0', emoji: '🌿' },
  { id: 'bedtime',  label: 'Bedtime',    color: '#D5B7F5', emoji: '🌙' },
  { id: 'crafts',   label: 'Crafts',     color: '#FFB5AD', emoji: '✂️' },
]

export default function KidsClient({ videos }: Props) {
  const cardStyle = useStore((s) => s.cardStyle)
  const rowRefs = useRef<Record<string, HTMLElement | null>>({})

  function scrollToRow(id: string) {
    rowRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const byCat = (cat: string) => videos.filter((v) => v.category === cat)
  const short = videos.filter((v) => v.duration_seconds < 900)

  return (
    <div>
      {/* Header */}
      <div
        className="relative overflow-hidden px-8 py-10 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #FFF8DC 0%, #FFE89A 100%)' }}
      >
        <div className="max-w-md">
          <div
            className="text-[12px] font-black uppercase tracking-widest mb-2"
            style={{ color: 'var(--accent)' }}
          >
            Kids Zone
          </div>
          <h1
            className="text-4xl font-black text-ink mb-2"
            style={{ letterSpacing: '-0.02em' }}
          >
            Pick what you want to watch!
          </h1>
          <p className="text-[15px] text-ink-3">A safe, grown-up-approved list just for you.</p>
        </div>

        {/* Mascot */}
        <div
          aria-hidden
          className="w-28 h-28 rounded-full flex items-center justify-center flex-shrink-0 mr-8"
          style={{ background: 'radial-gradient(circle at 40% 35%, #FFE089, #F4A338)' }}
        >
          <svg width="60" height="50" viewBox="0 0 60 50">
            <circle cx="19" cy="20" r="5" fill="#111" />
            <circle cx="41" cy="20" r="5" fill="#111" />
            <path d="M16 34 Q30 44 44 34" stroke="#111" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Category tiles */}
      <div className="grid grid-cols-3 gap-4 px-8 py-8 md:grid-cols-6">
        {TILES.map((t) => (
          <button
            key={t.id}
            onClick={() => scrollToRow(t.id)}
            className="flex flex-col items-center gap-2 py-5 px-3 rounded-2xl font-bold text-ink transition-shadow hover:shadow-md kids-tile-hover"
            style={{ background: t.color, borderRadius: '20px' }}
          >
            <span className="text-4xl">{t.emoji}</span>
            <span className="text-[13px]">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Rows */}
      <div className="pb-12">
        <Row title="Made for today" videos={videos.slice(0, 10)} cardStyle={cardStyle} />
        <Row title="Short & sweet" videos={short.slice(0, 10)} cardStyle={cardStyle} />

        {TILES.map((t) => {
          const list = byCat(t.id)
          if (list.length === 0) return null
          return (
            <div key={t.id} ref={(el) => { rowRefs.current[t.id] = el }}>
              <Row title={t.label} videos={list} cardStyle={cardStyle} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
