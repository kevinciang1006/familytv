import { getKidsVideos } from '@/lib/videos'
import KidsClient from '@/components/kids/KidsClient'

export default async function KidsPage() {
  const videos = await getKidsVideos()
  return <KidsClient videos={videos} />
}
