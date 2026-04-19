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

export type Profile = {
  id: string
  name: string
  color: string
  emoji: string
  kids: boolean
  age?: number
}

export type Density = 'cozy' | 'compact'
export type CardStyle = 'landscape' | 'poster'
export type Accent = 'red' | 'orange' | 'purple' | 'teal'
