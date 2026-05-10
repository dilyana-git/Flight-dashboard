import { AIRLINES, ALL_AIRLINE_CODES } from '../data/airlineConfig'
import { MONTHS_SHORT } from '../utils/formatters'

const BUDGET_TICKS = [0, 50, 100, 150, 200, 300, 400, 500]

export default function FilterBar({ filters, onChange, onSearch, loading, histogramOpen, onToggleHistogram, resultCount }) {
  const currentYear = new Date().getFullYear()
  const months = MONTHS_SHORT.map((m, i) => ({ label: m, index: i }))

  const toggleAirline = (code) => {
    const current = filters.airlines ?? ALL_AIRLINE_CODES
    const next = current.includes(code)
      ? current.filter(c => c !== code)
      : [...current, code]
    onChange('airlines', next.length ? next : ALL_AIRLINE_CODES)
  }

  const allSelected = ALL_AIRLINE_CODES.every(c => (filters.airlines ?? []).includes(c))

  return (
    <div className="flex-shrink-0 bg-[#111827] border-b border-[#1a2235] px-4 py-3 space-y-3">
      {/* Row 1: Month picker */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-[#64748b] font-mono uppercase tracking-wider w-14 flex-shrink-0">Month</span>
        <div className="flex gap-1 flex-wrap">
          {months.map(({ label, index }) => {
            const selected = filters.month === index
            return (
              <button
                key={index}
                onClick={() => onChange('month', index)}
                className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                  selected
                    ? 'bg-amber-500 text-[#0a0e17] font-bold'
                    : 'bg-[#1a2235] text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#243047]'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={filters.year ?? currentYear}
            onChange={e => onChange('year', Number(e.target.value))}
            className="bg-[#1a2235] text-[#e2e8f0] text-xs rounded px-2 py-1 border border-[#243047] font-mono"
          >
            {[currentYear, currentYear + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Budget + airlines + trip type + stops */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Budget slider */}
        <div className="flex items-center gap-2 min-w-[220px]">
          <span className="text-xs text-[#64748b] font-mono uppercase tracking-wider w-14 flex-shrink-0">Budget</span>
          <div className="flex-1 relative">
            <input
              type="range"
              min={0}
              max={500}
              step={10}
              value={filters.budget}
              onChange={e => onChange('budget', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#64748b] font-mono mt-0.5">
              {BUDGET_TICKS.map(t => <span key={t}>{t}</span>)}
            </div>
          </div>
          <span className="text-amber-500 font-mono font-bold text-sm w-16 text-right">
            €{filters.budget}
          </span>
        </div>

        {/* Airline toggles */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[#64748b] font-mono uppercase tracking-wider mr-1">Airlines</span>
          <button
            onClick={() => onChange('airlines', ALL_AIRLINE_CODES)}
            className={`px-2.5 py-1 rounded-full text-xs font-sans transition-all border ${
              allSelected
                ? 'bg-white text-[#0a0e17] border-white font-semibold'
                : 'bg-transparent text-[#64748b] border-[#243047] hover:border-[#64748b]'
            }`}
          >
            All
          </button>
          {ALL_AIRLINE_CODES.map(code => {
            const airline = AIRLINES[code]
            const active = (filters.airlines ?? []).includes(code)
            return (
              <button
                key={code}
                onClick={() => toggleAirline(code)}
                className="px-2.5 py-1 rounded-full text-xs font-sans transition-all border"
                style={active ? {
                  backgroundColor: airline.color,
                  borderColor: airline.color,
                  color: '#fff',
                  fontWeight: 600,
                } : {
                  backgroundColor: 'transparent',
                  borderColor: '#243047',
                  color: '#64748b',
                }}
              >
                {airline.name}
              </button>
            )
          })}
        </div>

        {/* Trip type */}
        <div className="flex items-center gap-1">
          {['oneway', 'return'].map(t => (
            <button
              key={t}
              onClick={() => onChange('tripType', t)}
              className={`px-2.5 py-1 rounded text-xs font-sans capitalize transition-colors ${
                filters.tripType === t
                  ? 'bg-amber-500 text-[#0a0e17] font-semibold'
                  : 'bg-[#1a2235] text-[#64748b] hover:text-[#e2e8f0]'
              }`}
            >
              {t === 'oneway' ? 'One-way' : 'Return'}
            </button>
          ))}
        </div>

        {/* Max stops */}
        <div className="flex items-center gap-1">
          {[{ label: 'Direct', value: 0 }, { label: '1 stop', value: 1 }, { label: 'Any', value: 2 }].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onChange('maxStops', value)}
              className={`px-2.5 py-1 rounded text-xs font-sans transition-colors ${
                filters.maxStops === value
                  ? 'bg-amber-500 text-[#0a0e17] font-semibold'
                  : 'bg-[#1a2235] text-[#64748b] hover:text-[#e2e8f0]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search + histogram toggle */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onToggleHistogram}
            title="Toggle price histogram"
            className={`p-1.5 rounded transition-colors ${
              histogramOpen ? 'bg-amber-500 text-[#0a0e17]' : 'bg-[#1a2235] text-[#64748b] hover:text-[#e2e8f0]'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="10" width="4" height="12"/>
              <rect x="9" y="6" width="4" height="16"/>
              <rect x="16" y="2" width="4" height="20"/>
            </svg>
          </button>
          <button
            onClick={onSearch}
            disabled={loading}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-[#0a0e17] font-semibold text-sm rounded transition-colors font-sans flex items-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-3 h-3 border-2 border-[#0a0e17] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            )}
            Search
            {resultCount > 0 && !loading && (
              <span className="bg-[#0a0e17] bg-opacity-30 text-xs rounded px-1.5 py-0.5 font-mono">{resultCount}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
