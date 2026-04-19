'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import type { Video } from '@/lib/types'
import { useStore } from '@/lib/store'
import GridCard from '@/components/cards/GridCard'

type Props = { videos: Video[] }

export default function SearchClient({ videos }: Props) {
  const searchParams = useSearchParams()
  const openVideo = useStore((s) => s.openVideo)
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return videos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q) ||
        v.channel_title?.toLowerCase().includes(q)
    )
  }, [videos, query])

  return (
    <div className="px-4 py-4 max-w-[1400px] mx-auto">
      {/* Search bar */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--ink-4)' }} />
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search videos, channels…"
          className="w-full pl-10 pr-4 rounded-full text-[14px] outline-none"
          style={{ height: 44, background: 'var(--surface-2)', color: 'var(--ink)', border: '1.5px solid transparent' }}
        />
      </div>

      {/* Results grid */}
      {query.trim() ? (
        results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {results.map((v) => <GridCard key={v.id} video={v} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-ink-3 text-[15px]">Nothing matches that. Try another word!</div>
        )
      ) : (
        <div className="text-center py-20 text-ink-3 text-[15px]">Start typing to search</div>
      )}
    </div>
  )
}
