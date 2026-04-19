import { getSupabase } from './supabase'
import type { Profile } from './types'

export async function getProfiles(): Promise<Profile[]> {
  const sb = getSupabase()
  if (!sb) return []

  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .order('sort_order')

  if (error) {
    console.error('getProfiles error:', error)
    return []
  }
  return (data ?? []) as Profile[]
}
