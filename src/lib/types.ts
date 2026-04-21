export type Video = {
  id: string
  youtube_id: string
  channel_id: string
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
  published_at: string | null
  fetched_at: string
  created_at: string
}

export type Channel = {
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
  emoji: string
  color: string
  is_kids: boolean
  age: number | null
  sort_order: number
}

export type Show = {
  id: string
  slug: string
  name: string
  channel_id: string
  thumbnail_url: string | null
  sort_order: number
  created_at: string
  channels?: {
    name: string
    channel_id: string
    sort_order: number
  }
}

export type Density = 'cozy' | 'compact'
export type CardStyle = 'landscape' | 'poster'
export type Accent = 'red' | 'orange' | 'purple' | 'teal'
