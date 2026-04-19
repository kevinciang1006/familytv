'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { getVideos } from '@/lib/videos'
import { getWatchedIds } from '@/lib/history'
import type { Video } from '@/lib/types'
import { CATEGORIES } from '@/lib/constants'
import GridCard from '@/components/cards/GridCard'
import CategoryBar from './CategoryBar'

const PAGE_SIZE = 20

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function HomeClient() {
  const router = useRouter()
  const profile = useStore((s) => s.profile)
  const [cat, setCat] = useState('all')
  const [query, setQuery] = useState('')
  const [allVideos, setAllVideos] = useState<Video[]>([])
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set())
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async (profileId: string | undefined) => {
    setLoading(true)
    const [videos, wIds] = await Promise.all([
      getVideos(profileId),
      profileId ? getWatchedIds(profileId) : Promise.resolve([]),
    ])
    setAllVideos(videos)
    setWatchedIds(new Set(wIds))
    setDisplayCount(PAGE_SIZE)
    setLoading(false)
  }, [])

  useEffect(() => {
    load(profile?.id)
  }, [profile?.id, load])

  const { unwatched, watched } = useMemo(() => {
    const base = cat === 'all' ? allVideos : allVideos.filter((v) => v.category === cat)
    return {
      unwatched: shuffle(base.filter((v) => !watchedIds.has(v.youtube_id))),
      watched: shuffle(base.filter((v) => watchedIds.has(v.youtube_id))),
    }
  }, [allVideos, watchedIds, cat])

  const total = unwatched.length + watched.length
  const visibleUnwatched = unwatched.slice(0, Math.min(displayCount, unwatched.length))
  const watchedStart = unwatched.length
  const visibleWatched = displayCount > watchedStart
    ? watched.slice(0, displayCount - watchedStart)
    : []

  useEffect(() => {
    if (!sentinelRef.current) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && displayCount < total) {
          setDisplayCount((c) => c + PAGE_SIZE)
        }
      },
      { rootMargin: '200px' }
    )
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [displayCount, total])

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
      {/* Search bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        }}
        className="relative mb-4"
      >
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--ink-4)' }} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => router.push('/search')}
          placeholder="Search videos, topics…"
          className="w-full pl-10 pr-4 rounded-full text-[14px] outline-none"
          style={{ height: 44, background: 'var(--surface-2)', color: 'var(--ink)', border: '1.5px solid transparent' }}
        />
      </form>

      <CategoryBar value={cat} onChange={(c) => { setCat(c); setDisplayCount(PAGE_SIZE) }} />

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--ink-4)' }} />
        </div>
      ) : total === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="text-5xl">📺</div>
          <h2 className="text-xl font-black text-ink">No videos yet</h2>
          <p className="text-ink-3 max-w-sm text-[14px]">
            Videos are loading… check back in a moment. If this persists, trigger a sync from the edge function.
          </p>
        </div>
      ) : (
        <>
          {/* Unwatched grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
            {visibleUnwatched.map((v) => <GridCard key={v.id} video={v} />)}
          </div>

          {/* "You've seen these" divider + watched grid */}
          {visibleWatched.length > 0 && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
                <span className="text-[12px] font-semibold text-ink-4 flex-shrink-0">You&apos;ve seen these</span>
                <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {visibleWatched.map((v) => <GridCard key={v.id} video={v} />)}
              </div>
            </>
          )}
        </>
      )}

      <div ref={sentinelRef} className="h-4 mt-4" />
      {!loading && displayCount < total && (
        <div className="flex justify-center py-4">
          <Loader2 size={20} className="animate-spin" style={{ color: 'var(--ink-4)' }} />
        </div>
      )}
    </div>
  )
}
