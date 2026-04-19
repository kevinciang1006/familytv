'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Tv2 } from 'lucide-react'
import type { Video, Channel } from '@/lib/types'
import { CATEGORIES } from '@/lib/constants'
import { filterByChannel } from '@/lib/videos'

type Props = { channels: Channel[]; videos: Video[] }

export default function ChannelsClient({ channels, videos }: Props) {
  const router = useRouter()
  const [cat, setCat] = useState('all')

  const visible = useMemo(() => {
    return channels.filter((ch) => {
      if (cat !== 'all' && ch.category !== cat) return false
      return true
    })
  }, [channels, cat])

  const usedCats = useMemo(() => {
    const ids = new Set(channels.map((ch) => ch.category))
    return [{ id: 'all', label: 'All' }, ...CATEGORIES.filter((c) => ids.has(c.id))]
  }, [channels])

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <h1 className="text-[28px] font-black text-ink mb-1" style={{ letterSpacing: '-0.03em' }}>
        Channels
      </h1>
      <p className="text-[14px] text-ink-3 mb-6">Curated YouTube channels for your family</p>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {usedCats.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className="px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors"
            style={{
              background: cat === c.id ? 'var(--ink)' : 'var(--surface-2)',
              color: cat === c.id ? 'white' : 'var(--ink-2)',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <Tv2 size={48} style={{ color: 'var(--ink-4)' }} />
          <p className="text-ink-3 text-[15px]">No channels match this filter.</p>
        </div>
      ) : (
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {visible.map((ch) => {
            const chVideos = filterByChannel(videos, ch.channel_id)
            const catLabel = CATEGORIES.find((c) => c.id === ch.category)?.label ?? ch.category
            return (
              <div
                key={ch.channel_id}
                className="rounded-[var(--radius)] overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                style={{ background: 'var(--surface)', border: '1.5px solid var(--line)' }}
                onClick={() => router.push(`/channels/${ch.channel_id}`)}
              >
                {/* Header */}
                <div className="p-5 flex items-center gap-4">
                  {ch.thumbnail_url ? (
                    <img
                      src={ch.thumbnail_url}
                      alt={ch.name}
                      className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-[20px] flex-shrink-0"
                      style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                    >
                      {ch.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-[15px] text-ink truncate">{ch.name}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                        style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}
                      >
                        {catLabel}
                      </span>
                      {ch.is_kids && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                          style={{ background: '#fef9c3', color: '#854d0e' }}
                        >
                          Kids
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {ch.description && (
                  <p className="px-5 text-[13px] text-ink-3 leading-relaxed line-clamp-2">
                    {ch.description}
                  </p>
                )}

                {/* Footer */}
                <div
                  className="mt-auto flex items-center px-5 py-3"
                  style={{ borderTop: '1px solid var(--line)' }}
                >
                  <span className="text-[12px] text-ink-3">
                    {chVideos.length} video{chVideos.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
