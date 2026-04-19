'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Video } from '@/lib/types'
import VideoPlayer from './VideoPlayer'

type Props = { video: Video }

export default function WatchClient({ video }: Props) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)

  const publishedDate = video.published_at
    ? new Date(video.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="bg-black min-h-screen">
      {/* Player — full viewport on mobile/tablet, aspect-video on desktop */}
      <div className="relative w-full lg:aspect-video" style={{ height: 'var(--player-h, 100dvh)' }}>
        <style>{`@media (min-width: 1024px) { :root { --player-h: auto; } }`}</style>
        <VideoPlayer youtubeId={video.youtube_id} />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-20 flex items-center justify-center w-9 h-9 rounded-full"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          aria-label="Go back"
        >
          <ChevronLeft size={20} color="white" />
        </button>
      </div>

      {/* Info panel */}
      <div
        className="px-4 sm:px-6 py-5 max-w-[860px]"
        style={{ background: 'var(--surface)' }}
      >
        <h1
          className="text-[18px] font-extrabold text-ink leading-snug"
          style={{ letterSpacing: '-0.01em' }}
        >
          {video.title}
        </h1>

        <div className="flex items-center gap-1.5 mt-2 text-[13px] text-ink-3">
          <span className="font-semibold text-ink-2">{video.channel_title}</span>
          {publishedDate && (
            <>
              <span>·</span>
              <span>{publishedDate}</span>
            </>
          )}
        </div>

        {video.description && (
          <div className="mt-4">
            <p
              className="text-[14px] text-ink-2 leading-relaxed whitespace-pre-line"
              style={
                expanded
                  ? undefined
                  : {
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }
              }
            >
              {video.description}
            </p>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-[13px] font-semibold text-ink-3 hover:text-ink transition-colors"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
