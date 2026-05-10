import { useEffect, useState } from 'react'
import FlightCard from './FlightCard'

const SORT_OPTIONS = [
  { value: 'price_asc',  label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'duration',   label: 'Duration' },
  { value: 'dest_az',    label: 'A–Z' },
]

function SkeletonCard() {
  return (
    <div className="rounded-xl p-4 border border-[#1a2235] bg-[#111827] space-y-3">
      <div className="flex justify-between">
        <div className="flex gap-2">
          <div className="skeleton w-8 h-8 rounded-full" />
          <div className="space-y-1.5">
            <div className="skeleton w-28 h-4" />
            <div className="skeleton w-16 h-3" />
          </div>
        </div>
        <div className="skeleton w-14 h-6" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton w-20 h-5 rounded-full" />
        <div className="skeleton w-14 h-5 rounded-full" />
        <div className="skeleton w-10 h-5 ml-auto" />
      </div>
      <div className="flex justify-between">
        <div className="skeleton w-24 h-3" />
        <div className="skeleton w-16 h-6 rounded" />
      </div>
    </div>
  )
}

export default function ResultsGrid({ flights, loading, error, sortBy, onSortChange, onSelectFlight, selectedFlight, demoMode }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [flights])

  return (
    <div className="flex flex-col h-full">
      {/* Sort bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-[#1a2235]">
        <div className="flex gap-1">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                sortBy === opt.value
                  ? 'bg-amber-500 text-[#0a0e17] font-bold'
                  : 'text-[#64748b] hover:text-[#e2e8f0]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {demoMode && (
          <span className="text-[10px] font-mono text-amber-500/70 border border-amber-500/30 rounded px-2 py-0.5">DEMO</span>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex-shrink-0 mx-4 mt-3 p-3 rounded-lg bg-red-900/30 border border-red-700/50 text-xs text-red-300 font-sans">
          <div className="font-semibold mb-1">API Error</div>
          <div>{error}</div>
          <div className="mt-1 text-red-400/70">Showing demo data instead.</div>
        </div>
      )}

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : flights.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-4xl mb-4">✈️</div>
            <div className="font-syne font-bold text-[#e2e8f0] mb-2">No flights found</div>
            <div className="text-sm text-[#64748b] font-sans">
              Try widening your budget or changing the month.
            </div>
          </div>
        ) : (
          visible && flights.map((flight, i) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              selected={selectedFlight?.id === flight.id}
              onSelect={onSelectFlight}
              style={{ animationDelay: `${i * 30}ms` }}
            />
          ))
        )}
      </div>
    </div>
  )
}
