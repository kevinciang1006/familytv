import { getSupabase } from './supabase'
import { fetchYouTubeMetadata, fetchChannelUploads, QuotaExceededError } from './youtube'
import { MOCK_VIDEOS, MOCK_DURATIONS, MOCK_CHANNELS, MOCK_VIEWS, PALETTES } from './constants'
import type { Video, Channel } from './types'

// ─── Cache ────────────────────────────────────────────────────────────────────

let cache: { videos: Video[]; fetchedAt: number } | null = null
const CACHE_TTL = 5 * 60 * 1000
let _quotaExceeded = false

export function wasQuotaExceeded(): boolean { return _quotaExceeded }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripeBg(seed: number): string {
  const palette = PALETTES[seed % PALETTES.length]
  const [a, b] = palette
  const angle = 30 + (seed * 17) % 60
  return `repeating-linear-gradient(${angle}deg, ${a} 0 18px, ${b} 18px 36px)`
}

function makePlaceholderThumb(index: number): string {
  return stripeBg(index)
}

// ─── getChannels ──────────────────────────────────────────────────────────────

export async function getChannels(): Promise<Channel[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error || !data) return []
  return data as Channel[]
}

// ─── getVideos ────────────────────────────────────────────────────────────────

export async function getVideos(): Promise<Video[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) return cache.videos
  _quotaExceeded = false

  const hasSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // ── 1. Manual (pinned) videos ──────────────────────────────────────────────
  let manualVideos: Video[] = []

  if (hasSupabase) {
    const supabase = getSupabase()!
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('source', 'manual')
      .order('sort_order', { ascending: true })

    if (!error && data && data.length > 0) {
      manualVideos = data as Video[]
    }
  }

  // Fall back to mock data when Supabase is empty or not configured
  if (manualVideos.length === 0) {
    manualVideos = MOCK_VIDEOS.map((v) => ({
      ...v,
      source: 'manual' as const,
      channel_id: null,
      published_at: null,
    }))
  }

  // Enrich manual videos with YouTube metadata
  const hasYoutube = !!process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
  if (hasYoutube) {
    const ids = manualVideos.map((v) => v.youtube_id)
    const meta = await fetchYouTubeMetadata(ids)
    manualVideos = manualVideos.map((v) => ({
      ...v,
      thumbnail_url: meta[v.youtube_id]?.thumbnail_url || v.thumbnail_url,
      duration: meta[v.youtube_id]?.duration || v.duration,
      view_count: meta[v.youtube_id]?.view_count || v.view_count,
      channel_title: meta[v.youtube_id]?.channel_title || v.channel_title,
    }))
  } else {
    manualVideos = manualVideos.map((v, i) => ({
      ...v,
      thumbnail_url: v.thumbnail_url ?? makePlaceholderThumb(i),
      duration: v.duration ?? MOCK_DURATIONS[v.id] ?? '—',
      view_count: v.view_count ?? MOCK_VIEWS[v.id] ?? '—',
      channel_title: v.channel_title ?? MOCK_CHANNELS[v.id] ?? '',
    }))
  }

  // ── 2. Channel videos ──────────────────────────────────────────────────────
  let channelVideos: Video[] = []

  if (hasSupabase && hasYoutube) {
    const channels = await getChannels()

    if (channels.length > 0) {
      const results = await Promise.allSettled(
        channels.map((ch) => fetchChannelUploads(ch.channel_id, 20))
      )

      results.forEach((result, idx) => {
        if (result.status === 'rejected') {
          if (result.reason instanceof QuotaExceededError) {
            _quotaExceeded = true
          } else {
            console.error(`Failed to fetch channel ${channels[idx].channel_id}:`, result.reason)
          }
          return
        }
        const ch = channels[idx]
        const items = result.value
        const mapped: Video[] = items.map((item, i) => ({
          id: `ch-${item.youtube_id}`,
          youtube_id: item.youtube_id,
          title: item.title,
          description: item.description || null,
          category: ch.category,
          age_rating: ch.is_kids ? '4+' : '10+',
          is_featured: false,
          is_kids: ch.is_kids,
          sort_order: ch.sort_order * 1000 + i,
          source: 'channel' as const,
          channel_id: ch.channel_id,
          published_at: item.published_at,
          created_at: item.published_at,
          thumbnail_url: item.thumbnail_url,
          duration: item.duration,
          view_count: item.view_count,
          channel_title: item.channel_title || ch.name,
        }))
        channelVideos = channelVideos.concat(mapped)
      })
    }
  }

  // ── 3. Merge — manual first, deduplicate by youtube_id ────────────────────
  const seen = new Set(manualVideos.map((v) => v.youtube_id))
  const dedupedChannel = channelVideos.filter((v) => !seen.has(v.youtube_id))

  const videos = [...manualVideos, ...dedupedChannel]
  cache = { videos, fetchedAt: Date.now() }
  return videos
}

// ─── Filter helpers ───────────────────────────────────────────────────────────

export function getVideosByCategory(videos: Video[], cat: string): Video[] {
  if (cat === 'all') return videos
  return videos.filter((v) => v.category === cat)
}

export function getKidsVideos(videos: Video[]): Video[] {
  return videos.filter((v) => v.is_kids)
}

export function getFeaturedVideo(videos: Video[]): Video | null {
  // Priority 1: explicitly featured manual video
  const featured = videos.find((v) => v.is_featured && v.source === 'manual')
  if (featured) return featured
  // Priority 2: most recent channel video (first channel video by sort_order)
  const channelVideo = videos.find((v) => v.source === 'channel')
  if (channelVideo) return channelVideo
  return videos[0] ?? null
}

export function getVideosByChannel(videos: Video[], channelId: string): Video[] {
  return videos.filter((v) => v.channel_id === channelId)
}

export function groupVideosByChannel(videos: Video[]): Record<string, Video[]> {
  return videos.reduce<Record<string, Video[]>>((acc, v) => {
    if (!v.channel_id) return acc
    if (!acc[v.channel_id]) acc[v.channel_id] = []
    acc[v.channel_id].push(v)
    return acc
  }, {})
}
