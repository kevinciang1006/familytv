'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import type { Video } from '@/lib/types'
import { CATEGORIES, PALETTES } from '@/lib/constants'
import CategoryBar from '@/components/home/CategoryBar'

type Props = { videos: Video[] }

const SUGGESTIONS = ['cartoons for toddlers', 'bedtime stories', 'learning colors', 'pancake recipes', 'paper crafts', 'rainy day ideas']

function stripeBg(seed: number): string {
  const palette = PALETTES[seed % PALETTES.length]
  const [a, b] = palette
  const angle = 30 + (seed * 17) % 60
  return `repeating-linear-gradient(${angle}deg, ${a} 0 18px, ${b} 18px 36px)`
}

export default function SearchClient({ videos }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const kidsMode = useStore((s) => s.kidsMode)
  const initialQ = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initialQ)
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState('relevance')

  const results = useMemo(() => {
    let list = kidsMode ? videos.filter((v) => v.is_kids) : videos
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q) ||
          v.channel_title?.toLowerCase().includes(q)
      )
    }
    if (cat !== 'all') list = list.filter((v) => v.category === cat)
    if (sort === 'views') {
      list = [...list].sort((a, b) => {
        const pa = parseFloat((a.view_count ?? '0').replace(/[KM]/g, (m) => m === 'K' ? '000' : '000000'))
        const pb = parseFloat((b.view_count ?? '0').replace(/[KM]/g, (m) => m === 'K' ? '000' : '000000'))
        return pb - pa
      })
    }
    return list
  }, [videos, query, cat, sort, kidsMode])

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
        <CategoryBar value={cat} onChange={setCat} kidsMode={kidsMode} />
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
          const idx = parseInt(v.id.replace(/\D/g, '')) || 0
          const isStriped = !v.thumbnail_url || v.thumbnail_url.startsWith('repeating-linear-gradient')
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
                  <div className="w-full h-full" style={{ background: stripeBg(idx) }} />
                ) : (
                  <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0 py-1">
                <div className="text-[15px] font-extrabold text-ink mb-1 truncate">{v.title}</div>
                <div className="text-[13px] text-ink-3 mb-2">
                  {v.channel_title}
                  {v.view_count && v.view_count !== '—' && ` · ${v.view_count} views`}
                  {v.duration && ` · ${v.duration}`}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: 'var(--surface-2)', color: 'var(--ink-3)' }}>
                    Ages {v.age_rating}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}>
                    {catLabel(v.category)}
                  </span>
                </div>
                {v.description && (
                  <p className="text-[13px] text-ink-3 truncate">{v.description}</p>
                )}
              </div>
            </div>
          )
        })}
        {results.length === 0 && (
          <div className="text-center py-16 text-ink-3 text-[15px]">Nothing matches that. Try another word!</div>
        )}
      </div>
    </div>
  )
}
