'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import PlayerWithControls from './PlayerWithControls'

export default function VideoDialog() {
  const videoDialogOpen = useStore((s) => s.videoDialogOpen)
  const activeVideo = useStore((s) => s.activeVideo)
  const closeVideo = useStore((s) => s.closeVideo)
  const [visible, setVisible] = useState(false)

  // Fade in on open, delay unmount for exit animation
  useEffect(() => {
    if (videoDialogOpen) {
      setVisible(true)
    } else {
      const t = setTimeout(() => setVisible(false), 150)
      return () => clearTimeout(t)
    }
  }, [videoDialogOpen])

  // Back button closes dialog instead of navigating away
  useEffect(() => {
    if (!videoDialogOpen) return
    window.history.pushState({ videoDialog: true }, '')
    const handlePopState = () => {
      if (useStore.getState().videoDialogOpen) closeVideo()
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [videoDialogOpen, closeVideo])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: videoDialogOpen ? 1 : 0,
        transition: 'opacity 200ms ease',
      }}
    >
      {activeVideo && <PlayerWithControls video={activeVideo} />}
    </div>
  )
}
