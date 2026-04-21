'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { getShowBySlug, getShowVideos } from '@/lib/shows'
import type { Show, Video } from '@/lib/types'
import GridCard from '@/components/cards/GridCard'

const PAGE_SIZE = 50

export default function ShowDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [show, setShow] = useState<Show | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const offsetRef = useRef(0)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!slug) return
    getShowBySlug(slug).then((s) => {
      if (!s) { setLoading(false); return }
      setShow(s)
      getShowVideos(s.id, PAGE_SIZE, 0).then((vids) => {
        setVideos(vids)
        offsetRef.current = vids.length
        setHasMore(vids.length === PAGE_SIZE)
        setLoading(false)
      })
    })
  }, [slug])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !show) return
    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting || loadingMore || !hasMore) return
        setLoadingMore(true)
        const more = await getShowVideos(show.id, PAGE_SIZE, offsetRef.current)
        if (more.length < PAGE_SIZE) setHasMore(false)
        setVideos((v) => [...v, ...more])
        offsetRef.current += more.length
        setLoadingMore(false)
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [show, loadingMore, hasMore])

  const channelName = show?.channels?.name ?? null

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
          style={{ background: 'var(--surface-2)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--ink)' }} />
        </button>

        {show && (
          <div className="min-w-0">
            <h1
              className="text-ink leading-tight"
              style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em' }}
            >
              {show.name}
            </h1>
            {channelName && (
              <div className="text-ink-3 mt-0.5" style={{ fontSize: 14 }}>
                {channelName} · {videos.length}{hasMore ? '+' : ''} video{videos.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--ink-4)' }} />
        </div>
      ) : !show ? (
        <div className="text-center py-24 text-ink-3">Show not found.</div>
      ) : videos.length === 0 ? (
        <div className="text-center py-24 text-ink-3">No videos for this show yet.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {videos.map((v) => <GridCard key={v.id} video={v} />)}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-8 flex items-center justify-center mt-4">
            {loadingMore && <Loader2 size={20} className="animate-spin" style={{ color: 'var(--ink-4)' }} />}
          </div>
        </>
      )}
    </div>
  )
}
