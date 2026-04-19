type Props = { small?: boolean }

export default function FamilyTVLogo({ small = false }: Props) {
  const size = small ? 24 : 36
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="text-accent flex-shrink-0"
        style={{ width: size, height: Math.round(size * 0.75) }}
      >
        <svg viewBox="0 0 32 24" width="100%" height="100%">
          <rect x="1" y="3" width="30" height="18" rx="4" fill="currentColor" />
          <polygon points="13,9 22,12 13,15" fill="#fff" />
        </svg>
      </span>
      <span
        className={`font-black text-ink ${small ? 'text-[18px]' : 'text-[28px]'}`}
        style={{ letterSpacing: '-0.02em' }}
      >
        <b>Family</b>
        <span className="text-accent">TV</span>
      </span>
    </span>
  )
}
