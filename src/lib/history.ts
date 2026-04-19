import { getSupabase } from './supabase'
import type { Video } from './types'

export type HistoryRow = {
  profile_id: string
  youtube_id: string
  progress_seconds: number
  duration_seconds: number
  completed: boolean
  watched_at: string
  updated_at: string
  videos?: Video
}

export async function upsertWatchHistory({
  profileId,
  youtubeId,
  progressSeconds,
  durationSeconds,
}: {
  profileId: string
  youtubeId: string
  progressSeconds: number
  durationSeconds: number
}): Promise<void> {
  const sb = getSupabase()
  if (!sb) return

  const completed = durationSeconds > 0 ? progressSeconds / durationSeconds >= 0.9 : false

  await sb.from('watch_history').upsert(
    {
      profile_id: profileId,
      youtube_id: youtubeId,
      progress_seconds: progressSeconds,
      duration_seconds: durationSeconds,
      completed,
      watched_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id,youtube_id' }
  )
}

export async function getWatchedIds(profileId: string): Promise<string[]> {
  const sb = getSupabase()
  if (!sb) return []

  const { data } = await sb
    .from('watch_history')
    .select('youtube_id')
    .eq('profile_id', profileId)

  return (data ?? []).map((r) => r.youtube_id)
}

export async function getWatchHistory(profileId: string): Promise<HistoryRow[]> {
  const sb = getSupabase()
  if (!sb) return []

  const { data } = await sb
    .from('watch_history')
    .select('*, videos(*)')
    .eq('profile_id', profileId)
    .order('updated_at', { ascending: false })
    .limit(50)

  return (data ?? []) as HistoryRow[]
}

export async function getContinueWatching(profileId: string): Promise<HistoryRow[]> {
  const sb = getSupabase()
  if (!sb) return []

  const { data } = await sb
    .from('watch_history')
    .select('*, videos(*)')
    .eq('profile_id', profileId)
    .eq('completed', false)
    .gt('progress_seconds', 5)
    .order('updated_at', { ascending: false })
    .limit(10)

  return (data ?? []) as HistoryRow[]
}

export async function getProfileStats(profileId: string): Promise<{ count: number; totalSeconds: number }> {
  const sb = getSupabase()
  if (!sb) return { count: 0, totalSeconds: 0 }

  const { data } = await sb
    .from('watch_history')
    .select('progress_seconds')
    .eq('profile_id', profileId)

  const rows = data ?? []
  return {
    count: rows.length,
    totalSeconds: rows.reduce((acc, r) => acc + (r.progress_seconds ?? 0), 0),
  }
}
