import { useEffect, useState } from 'react'
import { getMeta } from '../data/destinationMeta'
import { AIRLINES } from '../data/airlineConfig'
import { formatPrice, formatDuration, formatDate, formatTime } from '../utils/formatters'
import { buildDeepLink } from '../utils/buildKiwiUrl'

export default function DestinationDrawer({ flight, allFlights, onClose }) {
  const [visible, setVisible] = useState(false)
  const meta = getMeta(flight.flyTo)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const destFlights = allFlights
    .filter(f => f.flyTo === flight.flyTo)
    .sort((a, b) => a.price - b.price)

  const imageUrl = `https://source.unsplash.com/featured/600x200/?${encodeURIComponent(meta.city)},travel`

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1500] bg-black/50"
        onClick={onClose}
        style={{ backdropFilter: 'blur(2px)' }}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-[1600] w-[380px] max-w-full bg-[#111827] border-l border-[#243047] flex flex-col"
        style={{
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Hero image */}
        <div className="relative h-44 flex-shrink-0 overflow-hidden">
          <img
            src={imageUrl}
            alt={meta.city}
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#0a0e17]/70 flex items-center justify-center text-[#e2e8f0] hover:bg-[#0a0e17] transition-colors"
          >
            ×
          </button>
          <div className="absolute bottom-3 left-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{meta.flag}</span>
              <div>
                <div className="font-syne font-bold text-white text-xl">{meta.city}</div>
                <div className="text-xs text-white/60">{meta.country} &middot; {meta.region}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Flights list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-xs text-[#64748b] font-mono uppercase tracking-wider mb-1">
            {destFlights.length} flight{destFlights.length !== 1 ? 's' : ''} available
          </div>

          {destFlights.map(f => {
            const airline = AIRLINES[f.airlines?.[0]] ?? { name: 'Other', color: '#64748b', bg: '#1a2235' }
            return (
              <div
                key={f.id}
                className="rounded-xl border border-[#243047] bg-[#1a2235] p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-sans font-semibold"
                    style={{ backgroundColor: airline.bg, color: airline.color, border: `1px solid ${airline.color}40` }}
                  >
                    {airline.name}
                  </span>
                  <span className="font-mono font-bold text-amber-500 text-lg">{formatPrice(f.price)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#64748b] font-mono">
                  <span>{f.dTime ? `${formatDate(f.dTime)} ${formatTime(f.dTime)}` : 'Date TBC'}</span>
                  <span className="text-[#243047]">|</span>
                  <span>{formatDuration(f.duration?.departure ?? 0)}</span>
                  <span className={f.stops === 0 ? 'text-emerald-400' : ''}>
                    {f.stops === 0 ? 'Direct' : `${f.stops} stop`}
                  </span>
                </div>
                <a
                  href={buildDeepLink(f)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0a0e17] font-semibold transition-colors"
                >
                  Book on Kiwi
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
