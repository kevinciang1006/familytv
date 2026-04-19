'use client'

type Props = { youtubeId: string }

export default function VideoPlayer({ youtubeId }: Props) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  const embedUrl = `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&iv_load_policy=3&fs=1&color=white&origin=${origin}`

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: '16/9', borderRadius: 'var(--radius-lg)', background: '#000' }}
    >
      <iframe
        src={embedUrl}
        title="Video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
      {/* Covers bottom control bar — blocks clicks and blurs YouTube branding */}
      <div className="absolute bottom-0 left-0 right-0 h-[9%] pointer-events-auto backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.4)' }} />
    </div>
  )
}
