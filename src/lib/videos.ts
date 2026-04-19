import { getSupabase } from './supabase'
import type { Video, Channel } from './types'

// ─── Videos ──────────────────────────────────────────────────────────────────

export async function getVideos(profileId?: string): Promise<Video[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  let excludedChannelIds: string[] = []
  if (profileId) {
    const { data: excl } = await supabase
      .from('profile_channel_exclusions')
      .select('channel_id')
      .eq('profile_id', profileId)
    excludedChannelIds = (excl ?? []).map((r: { channel_id: string }) => r.channel_id)
  }

  let query = supabase
    .from('videos')
    .select('*')
    .eq('is_short', false)
    .order('published_at', { ascending: false })
    .limit(500)

  if (excludedChannelIds.length > 0) {
    query = query.not('channel_id', 'in', `(${excludedChannelIds.join(',')})`)
  }

  const { data, error } = await query
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

// ─── Sync client helper (used by ChannelsClient for video counts) ─────────────

export function filterByChannel(videos: Video[], channelId: string): Video[] {
  return videos.filter((v) => v.channel_id === channelId)
}
