'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Show, Video } from '@/lib/types'
import { getShowVideos } from '@/lib/shows'
import VideoCard from '@/components/cards/VideoCard'

type Props = {
  show: Show & { videos: Video[] }
}

export default function ShowRow({ show }: Props) {
  const [videos, setVideos] = useState(show.videos)
  const [offset, setOffset] = useState(show.videos.length)
  const [hasMore, setHasMore] = useState(show.videos.length === 10)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  async function loadMore() {
    if (loading || !hasMore) return
    setLoading(true)
    const more = await getShowVideos(show.id, 10, offset)
    if (more.length < 10) setHasMore(false)
    setVideos((v) => [...v, ...more])
    setOffset((o) => o + more.length)
    setLoading(false)
  }

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, hasMore, loading])

  const channelName = show.channels?.name ?? null

  return (
    <div className="mb-8">
      {/* Row header */}
      <div className="flex items-start justify-between px-4 sm:px-6 mb-3">
        <div>
          <h2
            className="text-ink leading-tight"
            style={{ fontSize: 18, fontWeight: 800 }}
          >
            {show.name}
          </h2>
          {channelName && (
            <div className="text-ink-3 mt-0.5" style={{ fontSize: 12 }}>
              {channelName}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4 mt-0.5">
          <span
            className="px-2 py-0.5 rounded-full text-ink-3"
            style={{ background: 'var(--surface-2)', fontSize: 12 }}
          >
            {videos.length}{hasMore ? '+' : ''} videos
          </span>
          <Link
            href={`/channels/shows/${show.slug}`}
            className="flex items-center gap-0.5 text-ink-3 hover:text-ink transition-colors"
            style={{ fontSize: 13, fontWeight: 600 }}
          >
            See all <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div
        className="relative"
        style={{
          maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
        }}
      >
        <div
          className="flex gap-3 overflow-x-auto px-4 sm:px-6 pb-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} style="landscape" />
          ))}
          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="flex-shrink-0 w-1" />
        </div>
      </div>
    </div>
  )
}
