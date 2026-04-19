import { getSupabase } from './supabase'
import type { Video, Channel } from './types'

const PAGE_SIZE = 20

// ─── Videos ──────────────────────────────────────────────────────────────────

export async function getVideos(page = 0, pageSize = PAGE_SIZE): Promise<Video[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const from = page * pageSize
  const to = from + pageSize - 1

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('is_short', false)
    .order('published_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('getVideos error:', error)
    return []
  }
  return (data ?? []) as Video[]
}

export async function getKidsVideos(page = 0, pageSize = 100): Promise<Video[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const from = page * pageSize
  const to = from + pageSize - 1

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('is_short', false)
    .eq('is_kids', true)
    .order('published_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('getKidsVideos error:', error)
    return []
  }
  return (data ?? []) as Video[]
}

export async function getVideo(youtubeId: string): Promise<Video | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('youtube_id', youtubeId)
    .single()

  if (error) return null
  return data as Video
}

export async function getVideosByChannelId(channelId: string, limit = 20): Promise<Video[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data } = await supabase
    .from('videos')
    .select('*')
    .eq('channel_id', channelId)
    .eq('is_short', false)
    .order('published_at', { ascending: false })
    .limit(limit)

  return (data ?? []) as Video[]
}

// ─── Channels ─────────────────────────────────────────────────────────────────

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

// ─── Sync helpers for client-side pagination ──────────────────────────────────

export { PAGE_SIZE }

// ─── Sync client helper (used by ChannelsClient for video counts) ─────────────

export function filterByChannel(videos: Video[], channelId: string): Video[] {
  return videos.filter((v) => v.channel_id === channelId)
}
