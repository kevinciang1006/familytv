'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import type { Video, CardStyle } from '@/lib/types'
import VideoCard from '@/components/cards/VideoCard'
import ContinueCard from '@/components/cards/ContinueCard'
import { CONTINUE_IDS } from '@/lib/constants'

type Props = {
  title: string
  videos: Video[]
  cardStyle?: CardStyle
  isContinue?: boolean
  subLabel?: string
  channelHref?: string
  channelAvatar?: string
}

export default function Row({
  title,
  videos,
  cardStyle = 'landscape',
  isContinue = false,
  subLabel,
  channelHref,
  channelAvatar,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [rowHover, setRowHover] = useState(false)

  function scroll(dir: number) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  const continueMap = Object.fromEntries(CONTINUE_IDS.map((c) => [c.id, c.progress]))

  if (videos.length === 0) return null

  return (
    <section
      className="relative"
      style={{ marginBottom: 'var(--row-gap)' }}
      onMouseEnter={() => setRowHover(true)}
      onMouseLeave={() => setRowHover(false)}
    >
      <div className="flex items-center justify-between px-6 mb-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-[20px] font-black text-ink" style={{ letterSpacing: '-0.02em' }}>
            {title}
          </h2>
          {subLabel && <span className="text-[13px] text-ink-3">{subLabel}</span>}
        </div>

        {channelHref && (
          <a
            href={channelHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-3 hover:text-accent transition-colors flex-shrink-0"
          >
            {channelAvatar && (
              <img
                src={channelAvatar}
                alt=""
                className="w-5 h-5 rounded-full object-cover"
              />
            )}
            View channel
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-md-val)',
            opacity: rowHover ? 1 : 0,
            pointerEvents: rowHover ? 'auto' : 'none',
            transform: `translateY(-50%) translateX(${rowHover ? 0 : -8}px)`,
            transition: 'opacity 200ms ease, transform 200ms ease',
          }}
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} style={{ color: 'var(--ink)' }} />
        </button>

        {/* Scroller */}
        <div className="overflow-x-auto hide-scrollbar row-mask">
          <div
            ref={scrollerRef}
            className="flex overflow-x-auto hide-scrollbar"
            style={{ gap: 'var(--gap)', paddingLeft: 'var(--pad)', paddingRight: 'var(--pad)' }}
          >
            {videos.map((v) =>
              isContinue && continueMap[v.id] !== undefined ? (
                <ContinueCard key={v.id} video={v} progress={continueMap[v.id]} />
              ) : (
                <VideoCard key={v.id} video={v} style={cardStyle} />
              )
            )}
          </div>
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-md-val)',
            opacity: rowHover ? 1 : 0,
            pointerEvents: rowHover ? 'auto' : 'none',
            transform: `translateY(-50%) translateX(${rowHover ? 0 : 8}px)`,
            transition: 'opacity 200ms ease, transform 200ms ease',
          }}
          aria-label="Scroll right"
        >
          <ChevronRight size={18} style={{ color: 'var(--ink)' }} />
        </button>
      </div>
    </section>
  )
}
