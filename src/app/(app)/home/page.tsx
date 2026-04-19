import { getVideos, getChannels, wasQuotaExceeded } from '@/lib/videos'
import HomeClient from '@/components/home/HomeClient'

export default async function HomePage() {
  const [videos, channels] = await Promise.all([getVideos(), getChannels()])
  return <HomeClient videos={videos} channels={channels} quotaExceeded={wasQuotaExceeded()} />
}
