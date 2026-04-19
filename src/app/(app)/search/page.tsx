import { Suspense } from 'react'
import { getVideos } from '@/lib/videos'
import SearchClient from '@/components/search/SearchClient'

export default async function SearchPage() {
  const videos = await getVideos(0, 200)
  return (
    <Suspense>
      <SearchClient videos={videos} />
    </Suspense>
  )
}
