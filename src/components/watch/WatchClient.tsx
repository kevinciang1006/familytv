'use client'

import { useState } from 'react'
import { ThumbsUp, Bookmark, Share2, Cast, ExternalLink } from 'lucide-react'
import type { Video, Channel } from '@/lib/types'
import { CATEGORIES, COMMENTS, PALETTES } from '@/lib/constants'
import { useStore } from '@/lib/store'
import VideoPlayer from './VideoPlayer'
import VideoCard from '@/components/cards/VideoCard'

type Props = {
  video: Video
  related: Video[]
  channelMeta: Channel | null
}

const CHAPTERS = [
  { t: '0:00', label: 'Cold open' },
  { t: '3:45', label: 'Meet the crew' },
  { t: '10:20', label: 'Lost in the woods' },
  { t: '17:05', label: 'Finding the path' },
  { t: '22:40', label: 'Home for dinner' },
]

export default function WatchClient({ video, related, channelMeta }: Props) {
  const profile = useStore((s) => s.profile)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showComments, setShowComments] = useState(true)

  const catLabel = CATEGORIES.find((c) => c.id === video.category)?.label ?? video.category
  const idx = parseInt(video.id.replace(/\D/g, '')) || 0
  const avatarBg = PALETTES[idx % PALETTES.length][1]

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex gap-8" style={{ alignItems: 'flex-start' }}>
        {/* Main */}
        <div className="flex-1 min-w-0">
          <VideoPlayer youtubeId={video.youtube_id} />

          {/* Info */}
          <div className="mt-5">
            <h1
              className="text-[22px] font-black text-ink"
              style={{ letterSpacing: '-0.02em' }}
            >
              {video.title}
            </h1>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className="px-3 py-1 rounded-full text-[12px] font-bold"
                style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}
              >
                Ages {video.age_rating}
              </span>
              <span
                className="px-3 py-1 rounded-full text-[12px] font-bold"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}
              >
                {catLabel}
              </span>
              {video.view_count && video.view_count !== '—' && (
                <span className="text-[13px] text-ink-3">{video.view_count} views</span>
              )}
              {video.duration && (
                <>
                  <span className="text-ink-4">·</span>
                  <span className="text-[13px] text-ink-3">{video.duration}</span>
                </>
              )}
            </div>

            {/* Creator + actions */}
            <div
              className="flex items-center justify-between mt-4 p-4 rounded-[var(--radius)] flex-wrap gap-4"
              style={{ background: 'var(--surface-2)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-[14px]"
                  style={{ background: avatarBg, color: '#111' }}
                >
                  {video.channel_title?.charAt(0) ?? 'C'}
                </div>
                <div>
                  <div className="text-[14px] font-bold text-ink">{video.channel_title}</div>
                  <div className="text-[12px] text-ink-3">1.2M subscribers</div>
                </div>
                <a
                  href={
                    video.channel_id
                      ? `https://www.youtube.com/channel/${video.channel_id}`
                      : `https://www.youtube.com/@${encodeURIComponent(video.channel_title ?? '')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-[13px] text-white ml-2 transition-opacity hover:opacity-90"
                  style={{ background: 'var(--ink)' }}
                >
                  Subscribe
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="flex items-center gap-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                <button
                  onClick={() => setLiked(!liked)}
                  className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold transition-colors hover:bg-surface-2"
                  style={{ color: liked ? 'var(--accent)' : 'var(--ink-2)' }}
                >
                  <ThumbsUp size={15} fill={liked ? 'currentColor' : 'none'} />
                  {liked ? 'Liked' : 'Like'} · 14K
                </button>
                <div style={{ width: 1, height: 20, background: 'var(--line)' }} />
                <button
                  onClick={() => setSaved(!saved)}
                  className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold transition-colors hover:bg-surface-2"
                  style={{ color: saved ? 'var(--accent)' : 'var(--ink-2)' }}
                >
                  <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
                  {saved ? 'Saved' : 'Save'}
                </button>
                <div style={{ width: 1, height: 20, background: 'var(--line)' }} />
                <button className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-ink-2 transition-colors hover:bg-surface-2">
                  <Share2 size={15} /> Share
                </button>
                <div style={{ width: 1, height: 20, background: 'var(--line)' }} />
                <button className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-ink-2 transition-colors hover:bg-surface-2">
                  <Cast size={15} /> Cast
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 p-4 rounded-[var(--radius)]" style={{ background: 'var(--surface-2)' }}>
              <div className="flex items-center gap-2 text-[13px] text-ink-3 mb-2">
                <span>Premiered March 14, 2026</span>
                <span>·</span>
                <span>{video.view_count && video.view_count !== '—' ? `${video.view_count} views` : 'Original family movie'}</span>
              </div>
              <p className="text-[14px] text-ink-2 leading-relaxed">
                {video.description ?? `A wonderful ${video.category} pick from ${video.channel_title}. Great to watch together on the couch.`}
              </p>
              <div className="mt-4">
                <div className="text-[13px] font-bold text-ink mb-2">Chapters</div>
                <div className="flex flex-col gap-1.5">
                  {CHAPTERS.map((c) => (
                    <div key={c.t} className="flex items-center gap-3">
                      <span
                        className="text-[12px] font-bold w-12 flex-shrink-0"
                        style={{ color: 'var(--accent)', fontFamily: 'var(--font-jetbrains)' }}
                      >
                        {c.t}
                      </span>
                      <span className="text-[13px] font-semibold text-ink-2">{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[16px] font-bold text-ink">284 comments</div>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="text-[13px] font-semibold text-ink-3 hover:text-ink transition-colors"
                >
                  {showComments ? 'Hide' : 'Show'}
                </button>
              </div>

              {showComments && (
                <div className="flex flex-col gap-5">
                  {profile && (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: profile.color }}
                      >
                        <span>{profile.emoji}</span>
                      </div>
                      <input
                        placeholder="Add a kind comment…"
                        className="flex-1 py-2 px-4 rounded-full text-[14px] outline-none"
                        style={{ background: 'var(--surface-2)', border: '1.5px solid var(--line)' }}
                      />
                    </div>
                  )}

                  {COMMENTS.map((c, i) => (
                    <div key={i} className="flex gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-[13px] text-white flex-shrink-0"
                        style={{ background: c.color }}
                      >
                        {c.letter}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] font-bold text-ink">@{c.user}</span>
                          <span className="text-[12px] text-ink-4">{c.time} ago</span>
                        </div>
                        <p className="text-[14px] text-ink-2">{c.text}</p>
                        <div className="flex items-center gap-4 mt-1.5 text-[12px] text-ink-3">
                          <span>👍 {c.likes}</span>
                          <button className="hover:text-ink transition-colors">Reply</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-[380px] flex-shrink-0 hidden xl:block">
          {channelMeta ? (
            <div className="flex items-center justify-between mb-4">
              <div className="text-[16px] font-bold text-ink">More from {channelMeta.name}</div>
              <a
                href={`https://www.youtube.com/channel/${channelMeta.channel_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-semibold text-ink-3 hover:text-accent transition-colors flex items-center gap-1"
              >
                View channel <ExternalLink size={11} />
              </a>
            </div>
          ) : (
            <div className="text-[16px] font-bold text-ink mb-4">Up next</div>
          )}
          <div className="flex flex-col gap-4">
            {related.map((v) => (
              <VideoCard key={v.id} video={v} style="landscape" />
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
