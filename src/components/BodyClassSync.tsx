'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'

export default function BodyClassSync() {
  const accent = useStore((s) => s.accent)
  const density = useStore((s) => s.density)
  const kidsMode = useStore((s) => s.kidsMode)

  useEffect(() => {
    const body = document.body
    body.classList.remove('accent-red', 'accent-orange', 'accent-purple', 'accent-teal')
    body.classList.add(`accent-${accent}`)
  }, [accent])

  useEffect(() => {
    const body = document.body
    body.classList.remove('density-cozy', 'density-compact')
    body.classList.add(`density-${density}`)
  }, [density])

  useEffect(() => {
    document.body.classList.toggle('is-kids', kidsMode)
  }, [kidsMode])

  return null
}
