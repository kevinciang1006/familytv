import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')!
const YT_BASE = 'https://www.googleapis.com/youtube/v3'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// ─── Types ────────────────────────────────────────────────────────────────────

type Channel = {
  channel_id: string
  name: string
  category: string
  is_kids: boolean
  sort_order: number
}

type ShowRecord = {
  id: string
  name: string
  slug: string
}

type VideoRow = {
  youtube_id: string
  channel_id: string
  show_id: string | null
  title: string
  description: string | null
  thumbnail_url: string | null
  duration_seconds: number
  duration_label: string
  view_count: number
  view_count_label: string
  channel_title: string
  category: string
  is_kids: boolean
  is_featured: boolean
  is_short: boolean
  published_at: string
  fetched_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseISO8601Duration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const h = parseInt(match[1] ?? '0')
  const m = parseInt(match[2] ?? '0')
  const s = parseInt(match[3] ?? '0')
  return h * 3600 + m * 60 + s
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatViewCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function bestThumb(thumbnails: Record<string, { url: string }> | undefined): string | null {
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    null
  )
}

// ─── Show matching ────────────────────────────────────────────────────────────

function getShowKeywords(slug: string): string[] {
  const map: Record<string, string[]> = {
    'cory-carson':   ['cory carson', 'go! go! cory', 'cory'],
    'trash-truck':   ['trash truck'],
    'ms-rachel':     ['ms. rachel', 'ms rachel'],
    'tom-and-jerry': ['tom and jerry', 'tom & jerry'],
    'looney-tunes':  ['looney tunes', 'bugs bunny', 'daffy duck', 'tweety', 'yosemite sam', 'foghorn', 'road runner', 'wile e', 'tasmanian'],
    'pixar-cars':    ['cars', 'lightning mcqueen', 'mater', 'pixar cars'],
    'bluey':         ['bluey'],
    'snoopy':        ['snoopy', 'peanuts', 'charlie brown'],
    'veritasium':    ['veritasium'],
    'kurzgesagt':    ['kurzgesagt'],
  }
  return map[slug] ?? []
}

function findShowId(title: string, channelShows: ShowRecord[]): string | null {
  const lower = title.toLowerCase()
  for (const show of channelShows) {
    const keywords = getShowKeywords(show.slug)
    if (keywords.some((k) => lower.includes(k))) return show.id
  }
  if (channelShows.length === 1) return channelShows[0].id
  return null
}

// ─── YouTube fetch pipeline ───────────────────────────────────────────────────

async function fetchChannelVideos(channel: Channel, channelShows: ShowRecord[]): Promise<VideoRow[]> {
  // Step 1 — get uploads playlist ID
  const chRes = await fetch(
    `${YT_BASE}/channels?part=contentDetails&id=${channel.channel_id}&key=${YOUTUBE_API_KEY}`
  )
  if (!chRes.ok) throw new Error(`channels API ${chRes.status}`)
  const chData = await chRes.json()
  const uploadsId = chData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
  if (!uploadsId) throw new Error('No uploads playlist found')

  // Step 2 — get video IDs (max 50)
  const plRes = await fetch(
    `${YT_BASE}/playlistItems?part=snippet&playlistId=${uploadsId}&maxResults=50&key=${YOUTUBE_API_KEY}`
  )
  if (!plRes.ok) throw new Error(`playlistItems API ${plRes.status}`)
  const plData = await plRes.json()

  const items: Array<{ videoId: string; publishedAt: string }> = (plData.items ?? []).map(
    (item: { snippet: { resourceId: { videoId: string }; publishedAt: string } }) => ({
      videoId: item.snippet.resourceId.videoId,
      publishedAt: item.snippet.publishedAt,
    })
  )
  if (items.length === 0) return []

  const publishedMap: Record<string, string> = Object.fromEntries(
    items.map((i) => [i.videoId, i.publishedAt])
  )

  // Step 3 — full metadata in one call
  const ids = items.map((i) => i.videoId).join(',')
  const vRes = await fetch(
    `${YT_BASE}/videos?part=snippet,contentDetails,statistics&id=${ids}&key=${YOUTUBE_API_KEY}`
  )
  if (!vRes.ok) throw new Error(`videos API ${vRes.status}`)
  const vData = await vRes.json()

  // Step 4 — map to DB rows
  return (vData.items ?? []).map((item: {
    id: string
    snippet: {
      title: string
      description: string
      thumbnails: Record<string, { url: string }>
      channelTitle: string
      publishedAt: string
    }
    contentDetails: { duration: string }
    statistics: { viewCount: string }
  }): VideoRow => {
    const durationSec = parseISO8601Duration(item.contentDetails?.duration ?? '')
    const viewCount = parseInt(item.statistics?.viewCount ?? '0')
    const title = item.snippet.title
    return {
      youtube_id: item.id,
      channel_id: channel.channel_id,
      show_id: findShowId(title, channelShows),
      title,
      description: item.snippet.description?.slice(0, 500) ?? null,
      thumbnail_url: bestThumb(item.snippet.thumbnails),
      duration_seconds: durationSec,
      duration_label: formatDuration(durationSec),
      view_count: viewCount,
      view_count_label: formatViewCount(viewCount),
      channel_title: item.snippet.channelTitle,
      category: channel.category,
      is_kids: channel.is_kids,
      is_featured: false,
      is_short: durationSec < 60,
      published_at: publishedMap[item.id] ?? item.snippet.publishedAt,
      fetched_at: new Date().toISOString(),
    }
  })
}

// ─── Handler ─────────────────────────────────────────────────────────────────

Deno.serve(async () => {
  const { data: channels, error: chErr } = await supabase
    .from('channels')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (chErr) {
    return new Response(JSON.stringify({ ok: false, error: chErr.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const results: Array<{ channel_id: string; status: string; count: number }> = []

  for (const channel of channels ?? []) {
    try {
      const { data: channelShows } = await supabase
        .from('shows')
        .select('id, name, slug')
        .eq('channel_id', channel.channel_id)

      const videos = await fetchChannelVideos(channel, channelShows ?? [])
      const { error } = await supabase.from('videos').upsert(videos, {
        onConflict: 'youtube_id',
        ignoreDuplicates: false,
      })

      await supabase.from('channel_sync_log').insert({
        channel_id: channel.channel_id,
        videos_added: videos.length,
        status: error ? 'error' : 'success',
        error_message: error?.message ?? null,
      })

      results.push({ channel_id: channel.channel_id, status: error ? 'error' : 'success', count: videos.length })
    } catch (err) {
      await supabase.from('channel_sync_log').insert({
        channel_id: channel.channel_id,
        videos_added: 0,
        status: 'error',
        error_message: String(err),
      })
      results.push({ channel_id: channel.channel_id, status: 'error', count: 0 })
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
