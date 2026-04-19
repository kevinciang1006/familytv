import { getChannels, getVideos } from '@/lib/videos'
import ChannelsClient from '@/components/channels/ChannelsClient'

export default async function ChannelsPage() {
  const [channels, videos] = await Promise.all([getChannels(), getVideos()])
  return <ChannelsClient channels={channels} videos={videos} />
}
