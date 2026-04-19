import { getVideos, getKidsVideos } from '@/lib/videos'
import KidsClient from '@/components/kids/KidsClient'

export default async function KidsPage() {
  const all = await getVideos()
  const kids = getKidsVideos(all)
  return <KidsClient videos={kids} />
}
