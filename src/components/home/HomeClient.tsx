'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import type { Video } from '@/lib/types'
import { CATEGORIES } from '@/lib/constants'
import { getSupabase, } from '@/lib/supabase'
import GridCard from '@/components/cards/GridCard'
import CategoryBar from './CategoryBar'

const PAGE_SIZE = 20

type Props = { initialVideos: Video[] }

export default function HomeClient({ initialVideos }: Props) {
  const [cat, setCat] = useState('all')
  const [videos, setVideos] = useState<Video[]>(initialVideos)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialVideos.length === PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(
    () => cat === 'all' ? videos : videos.filter((v) => v.category === cat),
    [videos, cat]
  )

  const fetchMore = useCallback(async (nextPage: number, category: string) => {
    const supabase = getSupabase()
    if (!supabase) return

    setLoading(true)
    const from = nextPage * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from('videos')
      .select('*')
      .eq('is_short', false)
      .order('published_at', { ascending: false })
      .range(from, to)

    if (category !== 'all') {
      query = query.eq('category', category)
    }

    const { data } = await query
    const newVideos = (data ?? []) as Video[]

    setVideos((prev) => nextPage === 0 ? newVideos : [...prev, ...newVideos])
    setHasMore(newVideos.length === PAGE_SIZE)
    setLoading(false)
  }, [])

  // Reset when category changes
  useEffect(() => {
    setPage(0)
    fetchMore(0, cat)
  }, [cat, fetchMore])

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const next = page + 1
          setPage(next)
          fetchMore(next, cat)
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, page, cat, fetchMore])

  const isEmpty = !loading && filtered.length === 0

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
      <CategoryBar value={cat} onChange={setCat} />

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="text-5xl">📺</div>
          <h2 className="text-xl font-black text-ink">No videos yet</h2>
          <p className="text-ink-3 max-w-sm text-[14px]">
            Videos are loading… check back in a moment. If this persists, trigger a sync from the edge function.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
          {filtered.map((v) => (
            <GridCard key={v.id} video={v} />
          ))}
        </div>
      )}

      {/* Sentinel + spinner */}
      <div ref={sentinelRef} className="h-4" />
      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--ink-4)' }} />
        </div>
      )}
    </div>
  )
}
