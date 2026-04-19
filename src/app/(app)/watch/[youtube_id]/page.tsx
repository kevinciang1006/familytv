import { getVideo } from '@/lib/videos'
import WatchClient from '@/components/watch/WatchClient'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ youtube_id: string }> }

export default async function WatchPage({ params }: Props) {
  const { youtube_id } = await params
  const video = await getVideo(youtube_id)
  if (!video) notFound()
  return <WatchClient video={video} />
}
