import { getVideos, getChannels } from '@/lib/videos'
import WatchClient from '@/components/watch/WatchClient'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ youtube_id: string }> }

export default async function WatchPage({ params }: Props) {
  const { youtube_id } = await params
  const [videos, channels] = await Promise.all([getVideos(), getChannels()])
  const video = videos.find((v) => v.youtube_id === youtube_id)

  if (!video) notFound()

  // Same-channel videos first, then same-category, deduplicated
  const sameChannel = video.channel_id
    ? videos.filter((v) => v.youtube_id !== youtube_id && v.channel_id === video.channel_id)
    : []
  const otherCat = videos.filter(
    (v) => v.youtube_id !== youtube_id &&
      v.channel_id !== video.channel_id &&
      v.category === video.category
  )
  const related = [...sameChannel, ...otherCat].slice(0, 8)

  const channelMeta = video.channel_id
    ? channels.find((ch) => ch.channel_id === video.channel_id) ?? null
    : null

  return <WatchClient video={video} related={related} channelMeta={channelMeta} />
}
