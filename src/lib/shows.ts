import { getSupabase } from './supabase'
import type { Show, Video } from './types'

export async function getShows(): Promise<Show[]> {
  const sb = getSupabase()
  if (!sb) return []
  const { data, error } = await sb
    .from('shows')
    .select('*, channels(name, channel_id, sort_order)')
    .order('sort_order')
  if (error) throw error
  return data ?? []
}

export async function getShowVideos(showId: string, limit = 20, offset = 0): Promise<Video[]> {
  const sb = getSupabase()
  if (!sb) return []
  const { data, error } = await sb
    .from('videos')
    .select('*')
    .eq('show_id', showId)
    .eq('is_short', false)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (error) throw error
  return data ?? []
}

export async function getShowBySlug(slug: string): Promise<Show | null> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from('shows')
    .select('*, channels(name, channel_id, sort_order)')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function getShowsWithVideos(): Promise<Array<Show & { videos: Video[] }>> {
  const shows = await getShows()
  const withVideos = await Promise.all(
    shows.map(async (show) => ({
      ...show,
      videos: await getShowVideos(show.id, 10),
    }))
  )
  return withVideos.filter((s) => s.videos.length > 0)
}
