'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { getVideo } from '@/lib/videos'

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const openVideo = useStore((s) => s.openVideo)

  useEffect(() => {
    const youtubeId = params.youtube_id as string
    getVideo(youtubeId).then((video) => {
      router.replace('/home')
      if (video) openVideo(video)
    })
  }, [])

  return null
}
