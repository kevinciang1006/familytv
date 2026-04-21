import { getShowsWithVideos } from '@/lib/shows'
import ShowRow from '@/components/channels/ShowRow'

export default async function ChannelsPage() {
  const shows = await getShowsWithVideos()

  return (
    <div className="max-w-[1400px] mx-auto py-8">
      <h1
        className="text-ink px-4 sm:px-6 mb-6"
        style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em' }}
      >
        Shows
      </h1>

      {shows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-6">
          <p className="text-ink-3" style={{ fontSize: 15 }}>No shows available yet.</p>
        </div>
      ) : (
        shows.map((show) => <ShowRow key={show.id} show={show} />)
      )}
    </div>
  )
}
