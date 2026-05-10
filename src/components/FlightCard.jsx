import { AIRLINES } from '../data/airlineConfig'
import { getMeta } from '../data/destinationMeta'
import { formatPrice, formatDuration, formatDate, formatTime } from '../utils/formatters'
import { buildDeepLink } from '../utils/buildKiwiUrl'

export default function FlightCard({ flight, selected, onSelect, style }) {
  const meta = getMeta(flight.flyTo)
  const airline = AIRLINES[flight.airlines?.[0]] ?? { name: 'Other', color: '#64748b', bg: '#1a2235' }
  const deepLink = buildDeepLink(flight)

  return (
    <div
      className={`flight-card rounded-xl p-4 cursor-pointer border transition-all ${
        selected
          ? 'border-amber-500 bg-[#1a2235] shadow-lg shadow-amber-500/10'
          : 'border-[#243047] bg-[#111827] hover:border-[#64748b] hover:bg-[#1a2235]'
      }`}
      style={style}
      onClick={() => onSelect(flight)}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Destination */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl flex-shrink-0">{meta.flag}</span>
          <div className="min-w-0">
            <div className="font-syne font-bold text-[#e2e8f0] text-base leading-tight truncate">
              {flight.cityTo}
            </div>
            <div className="text-xs text-[#64748b] truncate">{meta.country}</div>
          </div>
        </div>

        {/* Price */}
        <div className="flex-shrink-0 text-right">
          <div className="font-mono font-bold text-amber-500 text-xl count-up">
            {formatPrice(flight.price)}
          </div>
          <div className="text-[10px] text-[#64748b] font-mono">per person</div>
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        {/* Airline badge */}
        <span
          className="text-xs px-2 py-0.5 rounded-full font-sans font-semibold"
          style={{ backgroundColor: airline.bg, color: airline.color, border: `1px solid ${airline.color}40` }}
        >
          {airline.name}
        </span>

        {/* Stops badge */}
        <span className={`text-xs px-2 py-0.5 rounded-full font-sans ${
          flight.stops === 0
            ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700/50'
            : 'bg-[#243047] text-[#64748b] border border-[#243047]'
        }`}>
          {flight.stops === 0 ? 'Direct' : `${flight.stops} stop`}
        </span>

        {/* Duration */}
        <span className="text-xs text-[#64748b] font-mono ml-auto">
          {formatDuration(flight.duration?.departure ?? 0)}
        </span>
      </div>

      {/* Date + time */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-[#64748b] font-mono">
          {flight.dTime ? `${formatDate(flight.dTime)} · ${formatTime(flight.dTime)}` : 'Date TBC'}
        </span>

        {/* Book link */}
        <a
          href={deepLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-xs px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-[#0a0e17] font-semibold font-sans transition-colors"
        >
          Book →
        </a>
      </div>
    </div>
  )
}
