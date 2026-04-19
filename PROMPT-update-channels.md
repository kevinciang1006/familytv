# FamilyTV — Update Prompt: Channel-Based Content

## What this update does
Replaces the manual `videos` (by YouTube ID) content source with a **channels table**.
The app owner adds YouTube channel IDs to Supabase. The app fetches recent uploads from
those channels via the YouTube Data API and merges them with any manually pinned videos
from the existing `videos` table.

No Google OAuth. No login for family members. Profile picker stays as-is.

---

## Step 1 — Supabase: new `channels` table

Run this in your Supabase SQL editor:

```sql
create table channels (
  id uuid primary key default gen_random_uuid(),
  channel_id text not null unique,        -- YouTube channel ID e.g. UCbmNph6atAoGfqLoCL_duAg
  name text not null,                     -- Display name e.g. "Kurzgesagt"
  description text,
  thumbnail_url text,                     -- Channel avatar, fetched from YouTube API
  category text not null default 'general', -- Maps to FamilyTV categories
  is_kids boolean not null default false,
  is_active boolean not null default true, -- Set false to hide without deleting
  sort_order integer default 0,
  created_at timestamptz not null default now()
);

-- Seed a few example channels (replace channel_ids with real ones you want)
insert into channels (channel_id, name, category, is_kids, is_active) values
  ('UCbmNph6atAoGfqLoCL_duAg', 'Kurzgesagt', 'science', false, true),
  ('UC7IcJI8PUf5Z3zKxnZvTBog', 'Cocomelon', 'cartoons', true, true),
  ('UCsooa4yRKGN_zEE8iknghZA', 'TED-Ed', 'learning', false, true);
```

Also add a `source` column to the existing `videos` table to distinguish pinned vs channel videos:

```sql
alter table videos add column if not exists source text not null default 'manual';
-- source values: 'manual' (existing pinned videos) | 'channel' (fetched from channels table)
alter table videos add column if not exists channel_id text references channels(channel_id);
alter table videos add column if not exists published_at timestamptz;
```

---

## Step 2 — New type: `Channel`

In `src/lib/types.ts`, add:

```ts
export type Channel = {
  id: string
  channel_id: string
  name: string
  description: string | null
  thumbnail_url: string | null
  category: string
  is_kids: boolean
  is_active: boolean
  sort_order: number
  created_at: string
}

// Extend Video type
export type Video = {
  id: string
  youtube_id: string
  title: string
  description: string | null
  category: string
  age_rating: string
  is_featured: boolean
  is_kids: boolean
  sort_order: number
  source: 'manual' | 'channel'
  channel_id: string | null
  published_at: string | null
  created_at: string
  // Enriched from YouTube API:
  thumbnail_url?: string
  duration?: string
  view_count?: string
  channel_title?: string
}
```

---

## Step 3 — YouTube API helpers (`src/lib/youtube.ts`)

Extend the existing file with two new functions:

### `fetchChannelUploads(channelId: string, maxResults = 20): Promise<YouTubeVideoItem[]>`

Implementation steps:
1. First call `channels.list` with `part=contentDetails&id={channelId}` to get the channel's uploads playlist ID (`contentDetails.relatedPlaylists.uploads`)
2. Then call `playlistItems.list` with `part=snippet&playlistId={uploadsPlaylistId}&maxResults={maxResults}` to get video IDs + basic info
3. Then call `videos.list` with `part=snippet,contentDetails,statistics&id={comma-joined video IDs}` to get full metadata
4. Return array of enriched video items

```ts
type YouTubeVideoItem = {
  youtube_id: string
  title: string
  description: string
  thumbnail_url: string
  duration: string          // formatted: "12:34" or "1h 24m"
  view_count: string        // formatted: "2.1M"
  channel_title: string
  channel_id: string
  published_at: string      // ISO string
}
```

### `fetchChannelMetadata(channelId: string): Promise<{ name: string; thumbnail_url: string; description: string }>`

Calls `channels.list` with `part=snippet&id={channelId}`. Returns display name, avatar thumbnail URL, and description. Used when owner adds a new channel to auto-populate the Supabase row.

**ISO 8601 duration parser** (PT1H24M12S → "1h 24m" or "12:34"):
```ts
function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return ''
  const h = parseInt(match[1] || '0')
  const m = parseInt(match[2] || '0')
  const s = parseInt(match[3] || '0')
  if (h > 0) return `${h}h ${m}m`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
```

**View count formatter** (1234567 → "1.2M"):
```ts
function formatViewCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}
```

---

## Step 4 — Data layer (`src/lib/videos.ts`)

Replace the existing `getVideos()` with a merged approach:

```ts
// src/lib/videos.ts

export async function getVideos(): Promise<Video[]>
```

Implementation:
1. Fetch all active channels from Supabase: `select * from channels where is_active = true order by sort_order`
2. For each channel, call `fetchChannelUploads(channel.channel_id, 20)` — run all channels **in parallel** with `Promise.all`
3. Map each YouTube result to a `Video` object, inheriting `category` and `is_kids` from the matching `channel` row
4. Fetch manual videos from Supabase `videos` table (source = 'manual'), enrich with `fetchYouTubeMetadata`
5. Merge: put manual videos first, then channel videos. Deduplicate by `youtube_id` (manual wins if same ID appears in both)
6. Cache the merged result in a module-level variable for the session. Key the cache by a timestamp — invalidate after 5 minutes.

```ts
// Cache shape
let cache: { videos: Video[]; fetchedAt: number } | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getVideos(): Promise<Video[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) return cache.videos
  // ... fetch, merge, set cache
}
```

Also add:

```ts
export async function getChannels(): Promise<Channel[]>
// Fetches all is_active channels from Supabase, ordered by sort_order

export function groupVideosByChannel(videos: Video[]): Record<string, Video[]>
// Groups videos by channel_id — used for channel-based rows on home page

export function getVideosByChannel(videos: Video[], channelId: string): Video[]
```

---

## Step 5 — Update Home page (`/home`)

### 5.1 Content rows — channel-based

Replace the hardcoded category rows with **dynamic channel rows**.

For each active channel, render one Row:
- Row title = channel name (e.g. "From Kurzgesagt")
- Videos = `getVideosByChannel(videos, channel.channel_id)` limited to 10
- Row subtitle (right-aligned): small channel avatar + "View channel →" link to `https://youtube.com/channel/{channel_id}` (opens in new tab)

Keep the existing hardcoded rows (Keep Watching, Trending) at the top. Channel rows appear below.

Category filter pills still work — filter across all videos regardless of source.

### 5.2 Featured video logic

Priority order for hero:
1. Any `is_featured: true` video from the manual `videos` table
2. If none, use the most recent video from the channel with the lowest `sort_order`

---

## Step 6 — Update Watch page (`/watch/[youtube_id]`)

In the sidebar "Up next" section:

- If the video has a `channel_id`, show other videos from the same channel first, then fill remaining slots from other channels
- Show the channel name + small avatar above the "Up next" list as "More from {channel name}"

In the info section below the player:
- Creator row: show channel name. "Subscribe" button links to `https://youtube.com/channel/{channel_id}` — open in new tab (replaces the dead placeholder link)

---

## Step 7 — New: Channels page (`/channels`)

Create `src/app/(app)/channels/page.tsx`.

A simple page for the app owner to see all configured channels.

Layout: page title "Channels", subtitle "Content sources for FamilyTV"

Channel grid (auto-fit, min 280px):
- Each card: channel avatar (thumbnail_url), channel name, category chip, is_kids badge, video count, "Active / Paused" status
- No edit functionality in MVP — owner manages channels directly in Supabase

Add "Channels" link to the TopNav (desktop only, between Search and Screentime).

---

## Step 8 — Error & empty states

Handle these cases gracefully:

**No channels configured** (channels table is empty):
- Home page shows an empty state: icon + "No channels added yet" + "Add channels in your Supabase dashboard to get started"

**YouTube API quota exceeded** (HTTP 403):
- Show a toast: "Couldn't load latest videos — try again later"
- Fall back to whatever is in the manual `videos` table only

**Channel fetch fails** (one channel errors, others succeed):
- Log the error, skip that channel silently, continue with the rest
- Do not let one bad channel break the whole home page

**No videos from a channel** (channel exists but returns 0 videos):
- Skip rendering that channel's row entirely (don't show an empty row)

---

## Step 9 — Environment variable

No new env vars needed — YouTube Data API key already exists as `NEXT_PUBLIC_YOUTUBE_API_KEY`.

Note: YouTube Data API v3 has a daily quota of 10,000 units. Each `channels.list` call = 1 unit, each `playlistItems.list` call = 1 unit, each `videos.list` call = 1 unit. For 10 channels fetching 20 videos each = ~30 units per full refresh. With 5-minute client-side cache this is well within limits.

---

## What NOT to change
- Profile picker — stays exactly as is
- Zustand store — no changes needed
- Screentime feature — no changes needed
- Parental controls — no changes needed
- Kids zone — still filters by `is_kids`, now sourced from channel rows too
- `videos` table — keep it, manual picks still work alongside channel videos
