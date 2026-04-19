'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import type { Video, Channel } from '@/lib/types'
import GridCard from '@/components/cards/GridCard'

export default function ChannelDetailPage() {
  const { channel_id } = useParams<{ channel_id: string }>()
  const router = useRouter()
  const [channel, setChannel] = useState<Channel | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sb = getSupabase()
    if (!sb || !channel_id) { setLoading(false); return }

    Promise.all([
      sb.from('channels').select('*').eq('channel_id', channel_id).single(),
      sb.from('videos').select('*').eq('channel_id', channel_id).eq('is_short', false).order('published_at', { ascending: false }).limit(100),
    ]).then(([ch, vids]) => {
      setChannel((ch.data ?? null) as Channel | null)
      setVideos((vids.data ?? []) as Video[])
      setLoading(false)
    })
  }, [channel_id])

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

        {channel && (
          <>
            {channel.thumbnail_url ? (
              <img src={channel.thumbnail_url} alt={channel.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[16px] flex-shrink-0" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                {channel.name.charAt(0)}
              </div>
            )}
            <h1 className="text-[20px] font-black text-ink" style={{ letterSpacing: '-0.02em' }}>{channel.name}</h1>
          </>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--ink-4)' }} />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-24 text-ink-3">No videos from this channel yet.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {videos.map((v) => <GridCard key={v.id} video={v} />)}
        </div>
      )}
    </div>
  )
}
