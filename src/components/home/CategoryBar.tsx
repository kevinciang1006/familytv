'use client'

import { CATEGORIES } from '@/lib/constants'

type Props = {
  value: string
  onChange: (cat: string) => void
  kidsMode?: boolean
}

const KIDS_CATS = ['all', 'cartoons', 'learning', 'music', 'bedtime', 'crafts', 'nature', 'science']

export default function CategoryBar({ value, onChange, kidsMode }: Props) {
  const cats = kidsMode ? CATEGORIES.filter((c) => KIDS_CATS.includes(c.id)) : CATEGORIES

  return (
    <div
      className="flex items-center gap-2 overflow-x-auto hide-scrollbar px-6 pb-4"
      style={{ paddingTop: '4px' }}
    >
      {cats.map((c) => {
        const active = c.id === value
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-[14px] font-semibold transition-colors"
            style={{
              background: active ? 'var(--ink)' : 'var(--surface-2)',
              color: active ? 'white' : 'var(--ink-2)',
            }}
          >
            {c.label}
          </button>
        )
      })}
    </div>
  )
}
