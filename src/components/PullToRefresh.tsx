'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

const THRESHOLD = 72

type Props = {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

export default function PullToRefresh({ onRefresh, children }: Props) {
  const [pullY, setPullY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startYRef = useRef(0)
  const pullingRef = useRef(false)

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0) return
      startYRef.current = e.touches[0].clientY
      pullingRef.current = true
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!pullingRef.current || refreshing) return
      const delta = e.touches[0].clientY - startYRef.current
      if (delta > 0 && window.scrollY === 0) {
        setPullY(Math.min(delta * 0.45, THRESHOLD + 16))
      }
    }

    const onTouchEnd = async () => {
      if (!pullingRef.current) return
      pullingRef.current = false
      const captured = pullY
      if (captured >= THRESHOLD) {
        setRefreshing(true)
        setPullY(THRESHOLD)
        await onRefresh()
        setRefreshing(false)
      }
      setPullY(0)
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [pullY, refreshing, onRefresh])

  const progress = Math.min(pullY / THRESHOLD, 1)
  const active = pullY >= THRESHOLD || refreshing

  return (
    <div style={{ position: 'relative', overflowX: 'hidden' }}>
      {/* Pull indicator */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          height: pullY || (refreshing ? THRESHOLD : 0),
          transition: pullY === 0 ? 'height 300ms ease' : 'none',
          pointerEvents: 'none',
          zIndex: 50,
          paddingBottom: 8,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--surface)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: progress,
            transform: `scale(${0.6 + progress * 0.4})`,
            transition: pullY === 0 ? 'opacity 300ms ease, transform 300ms ease' : 'none',
          }}
        >
          <Loader2
            size={16}
            style={{
              color: 'var(--accent)',
              transform: refreshing ? undefined : `rotate(${progress * 270}deg)`,
            }}
            className={refreshing ? 'animate-spin' : ''}
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div
        style={{
          transform: `translateY(${pullY}px)`,
          transition: pullY === 0 ? 'transform 300ms ease' : 'none',
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  )
}
