const YT_BASE = 'https://www.googleapis.com/youtube/v3'

export class QuotaExceededError extends Error {
  constructor() { super('YouTube API quota exceeded') }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type YouTubeMeta = {
  thumbnail_url: string
  duration: string
  view_count: string
  channel_title: string
}

export type YouTubeVideoItem = {
  youtube_id: string
  title: string
  description: string
  thumbnail_url: string
  duration: string
  view_count: string
  channel_title: string
  channel_id: string
  published_at: string
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return ''
  const h = parseInt(match[1] || '0')
  const m = parseInt(match[2] || '0')
  const s = parseInt(match[3] || '0')
  if (h > 0) return `${h}h ${m}m`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatViewCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function bestThumb(thumbnails: Record<string, { url: string }> | undefined): string {
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.default?.url ??
    ''
  )
}

// ─── fetchYouTubeMetadata ─────────────────────────────────────────────────────

export async function fetchYouTubeMetadata(ids: string[]): Promise<Record<string, YouTubeMeta>> {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
  if (!apiKey || ids.length === 0) return {}

  const results: Record<string, YouTubeMeta> = {}
  const batchSize = 50

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize)
    const url = `${YT_BASE}/videos?part=snippet,contentDetails,statistics&id=${batch.join(',')}&key=${apiKey}`
    try {
      const res = await fetch(url, { next: { revalidate: 300 } })
      if (!res.ok) continue
      const data = await res.json()
      for (const item of data.items ?? []) {
        results[item.id] = {
          thumbnail_url: bestThumb(item.snippet?.thumbnails),
          duration: formatDuration(item.contentDetails?.duration ?? ''),
          view_count: formatViewCount(parseInt(item.statistics?.viewCount ?? '0')),
          channel_title: item.snippet?.channelTitle ?? '',
        }
      }
    } catch {
      // skip on error
    }
  }
  return results
}

// ─── fetchChannelUploads ──────────────────────────────────────────────────────

export async function fetchChannelUploads(
  channelId: string,
  maxResults = 20
): Promise<YouTubeVideoItem[]> {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
  if (!apiKey) return []

  try {
    // 1. Get uploads playlist ID
    const chRes = await fetch(
      `${YT_BASE}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`,
      { next: { revalidate: 300 } }
    )
    if (chRes.status === 403) throw new QuotaExceededError()
    if (!chRes.ok) return []
    const chData = await chRes.json()
    const uploadsId = chData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
    if (!uploadsId) return []

    // 2. Get video IDs from uploads playlist
    const plRes = await fetch(
      `${YT_BASE}/playlistItems?part=snippet&playlistId=${uploadsId}&maxResults=${maxResults}&key=${apiKey}`,
      { next: { revalidate: 300 } }
    )
    if (plRes.status === 403) throw new QuotaExceededError()
    if (!plRes.ok) return []
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

    // 3. Fetch full metadata for all video IDs
    const ids = items.map((i) => i.videoId).join(',')
    const vRes = await fetch(
      `${YT_BASE}/videos?part=snippet,contentDetails,statistics&id=${ids}&key=${apiKey}`,
      { next: { revalidate: 300 } }
    )
    if (vRes.status === 403) throw new QuotaExceededError()
    if (!vRes.ok) return []
    const vData = await vRes.json()

    return (vData.items ?? []).map(
      (item: {
        id: string
        snippet: {
          title: string
          description: string
          thumbnails: Record<string, { url: string }>
          channelTitle: string
          channelId: string
        }
        contentDetails: { duration: string }
        statistics: { viewCount: string }
      }): YouTubeVideoItem => ({
        youtube_id: item.id,
        title: item.snippet.title,
        description: item.snippet.description ?? '',
        thumbnail_url: bestThumb(item.snippet.thumbnails),
        duration: formatDuration(item.contentDetails?.duration ?? ''),
        view_count: formatViewCount(parseInt(item.statistics?.viewCount ?? '0')),
        channel_title: item.snippet.channelTitle ?? '',
        channel_id: item.snippet.channelId ?? channelId,
        published_at: publishedMap[item.id] ?? new Date().toISOString(),
      })
    )
  } catch {
    return []
  }
}

// ─── fetchChannelMetadata ─────────────────────────────────────────────────────

export async function fetchChannelMetadata(
  channelId: string
): Promise<{ name: string; thumbnail_url: string; description: string } | null> {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch(
      `${YT_BASE}/channels?part=snippet&id=${channelId}&key=${apiKey}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const item = data.items?.[0]
    if (!item) return null
    return {
      name: item.snippet.title ?? '',
      thumbnail_url: bestThumb(item.snippet.thumbnails),
      description: item.snippet.description ?? '',
    }
  } catch {
    return null
  }
}
