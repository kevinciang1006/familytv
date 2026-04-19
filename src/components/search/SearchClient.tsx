'use client'

import { useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { Video } from '@/lib/types'
import { CATEGORIES, PALETTES } from '@/lib/constants'
import CategoryBar from '@/components/home/CategoryBar'

type Props = { videos: Video[] }

const SUGGESTIONS = ['cartoons for toddlers', 'bedtime stories', 'learning colors', 'pancake recipes', 'paper crafts', 'rainy day ideas']

function stripeBg(seed: number): string {
  const palette = PALETTES[seed % PALETTES.length]
  const angle = 30 + (seed * 17) % 60
  return `repeating-linear-gradient(${angle}deg, ${palette[0]} 0 18px, ${palette[1]} 18px 36px)`
}

export default function SearchClient({ videos }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQ = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initialQ)
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState('relevance')

  const results = useMemo(() => {
    let list = videos
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q) ||
          v.channel_title.toLowerCase().includes(q)
      )
    }
    if (cat !== 'all') list = list.filter((v) => v.category === cat)
    if (sort === 'views') {
      list = [...list].sort((a, b) => b.view_count - a.view_count)
    }
    return list
  }, [videos, query, cat, sort])

  const catLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-ink" style={{ letterSpacing: '-0.02em' }}>
          {query.trim() ? (
            <>Results for <span style={{ color: 'var(--accent)' }}>&ldquo;{query}&rdquo;</span></>
          ) : (
            'Search FamilyTV'
          )}
        </h1>
        <p className="text-ink-3 mt-1">
          {query.trim()
            ? `${results.length} ${results.length === 1 ? 'video' : 'videos'} found`
            : 'Find something everyone will enjoy.'}
        </p>
      </div>

      {!query.trim() && (
        <div className="mb-6">
          <div className="text-[13px] font-bold text-ink-3 mb-3">Try searching for</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setQuery(s); router.push(`/search?q=${encodeURIComponent(s)}`) }}
                className="px-4 py-1.5 rounded-full text-[13px] font-semibold border transition-colors hover:bg-surface-2"
                style={{ borderColor: 'var(--line-2)', color: 'var(--ink-2)' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <CategoryBar value={cat} onChange={setCat} />
        <div className="flex items-center gap-2 text-[13px] text-ink-3 flex-shrink-0">
          <label className="font-semibold">Sort by</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-[13px] font-semibold outline-none"
            style={{ background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--line)' }}
          >
            <option value="relevance">Relevance</option>
            <option value="views">Most viewed</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {results.map((v) => {
          const seed = v.id.charCodeAt(0) + v.id.charCodeAt(v.id.length - 1)
          const isStriped = !v.thumbnail_url
          return (
            <div
              key={v.id}
              className="flex gap-4 p-3 rounded-[var(--radius)] cursor-pointer transition-colors hover:bg-surface-2"
              onClick={() => router.push(`/watch/${v.youtube_id}`)}
            >
              <div
                className="flex-shrink-0 rounded-[var(--radius)] overflow-hidden"
                style={{ width: 200, aspectRatio: '16/9' }}
              >
                {isStriped ? (
                  <div className="w-full h-full" style={{ background: stripeBg(seed) }} />
                ) : (
                  <img src={v.thumbnail_url!} alt={v.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0 py-1">
                <div className="text-[15px] font-extrabold text-ink mb-1 truncate">{v.title}</div>
                <div className="text-[13px] text-ink-3 mb-2">
                  {v.channel_title}
                  {v.view_count_label && ` · ${v.view_count_label} views`}
                  {v.duration_label && ` · ${v.duration_label}`}
                </div>
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold"
                  style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}
                >
                  {catLabel(v.category)}
                </span>
                {v.description && (
                  <p className="text-[13px] text-ink-3 truncate mt-1">{v.description}</p>
                )}
              </div>
            </div>
          )
        })}
        {results.length === 0 && query.trim() && (
          <div className="text-center py-16 text-ink-3 text-[15px]">Nothing matches that. Try another word!</div>
        )}
      </div>
    </div>
  )
}
