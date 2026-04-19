import { getVideos } from '@/lib/videos'
import HomeClient from '@/components/home/HomeClient'

export default async function HomePage() {
  const initialVideos = await getVideos(0, 20)
  return <HomeClient initialVideos={initialVideos} />
}
