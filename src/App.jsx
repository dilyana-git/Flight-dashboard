import { useState, useCallback } from 'react'
import FilterBar from './components/FilterBar'
import FlightMap from './components/FlightMap'
import ResultsGrid from './components/ResultsGrid'
import PriceHistogram from './components/PriceHistogram'
import ApiKeySetup from './components/ApiKeySetup'
import DestinationDrawer from './components/DestinationDrawer'
import useFlightSearch from './hooks/useFlightSearch'
import useLocalStorage from './hooks/useLocalStorage'
import { AIRLINES } from './data/airlineConfig'

const DEFAULT_FILTERS = {
  month: new Date().getMonth(),
  year: new Date().getFullYear(),
  budget: 300,
  airlines: ['W6', 'FR', 'U2'],
  tripType: 'oneway',
  maxStops: 2,
}

export default function App() {
  const [apiKey, setApiKey] = useLocalStorage('kiwi_api_key', '')
  const [demoMode, setDemoMode] = useLocalStorage('demo_mode', false)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [pendingFilters, setPendingFilters] = useState(DEFAULT_FILTERS)
  const [priceRange, setPriceRange] = useState(null)
  const [sortBy, setSortBy] = useState('price_asc')
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [histogramOpen, setHistogramOpen] = useState(false)
  const [showApiSetup, setShowApiSetup] = useState(false)

  const { flights, loading, error, search } = useFlightSearch(apiKey, demoMode)

  const handleSearch = useCallback(() => {
    setFilters(pendingFilters)
    setPriceRange(null)
    search(pendingFilters)
  }, [pendingFilters, search])

  const handleFilterChange = useCallback((key, value) => {
    setPendingFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const needsApiKey = !apiKey && !demoMode

  const filteredFlights = priceRange
    ? flights.filter(f => f.price >= priceRange[0] && f.price < priceRange[1])
    : flights

  const sortedFlights = [...filteredFlights].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':  return a.price - b.price
      case 'price_desc': return b.price - a.price
      case 'duration':   return a.duration - b.duration
      case 'dest_az':    return a.cityTo.localeCompare(b.cityTo)
      default:           return 0
    }
  })

  return (
    <div className="flex flex-col h-screen bg-[#0a0e17] overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[#1a2235] flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✈</span>
          <span className="font-syne font-bold text-lg tracking-widest text-[#e2e8f0] uppercase">
            Sofia Departures
          </span>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs text-[#64748b] font-mono">DEMO</span>
            <div
              onClick={() => setDemoMode(d => !d)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                demoMode ? 'bg-amber-500' : 'bg-[#243047]'
              }`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                demoMode ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </div>
          </label>
          <button
            onClick={() => setShowApiSetup(true)}
            className="p-2 text-[#64748b] hover:text-[#e2e8f0] transition-colors"
            title="API Key Settings"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar
        filters={pendingFilters}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        loading={loading}
        histogramOpen={histogramOpen}
        onToggleHistogram={() => setHistogramOpen(h => !h)}
        resultCount={sortedFlights.length}
      />

      {/* Price Histogram */}
      {histogramOpen && (
        <PriceHistogram
          flights={flights}
          selectedRange={priceRange}
          onRangeSelect={setPriceRange}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="w-[60%] flex-shrink-0 bg-[#1a2235] relative">
          <FlightMap
            flights={sortedFlights}
            loading={loading}
            onSelectFlight={setSelectedFlight}
            selectedFlight={selectedFlight}
          />
        </div>

        {/* Results grid */}
        <div className="w-[40%] flex flex-col overflow-hidden border-l border-[#1a2235]">
          <ResultsGrid
            flights={sortedFlights}
            loading={loading}
            error={error}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onSelectFlight={setSelectedFlight}
            selectedFlight={selectedFlight}
            demoMode={demoMode}
          />
        </div>
      </div>

      {/* API Key setup modal */}
      {(showApiSetup || needsApiKey) && (
        <ApiKeySetup
          apiKey={apiKey}
          onSave={(key) => { setApiKey(key); setShowApiSetup(false) }}
          onClose={() => setShowApiSetup(false)}
          onDemo={() => { setDemoMode(true); setShowApiSetup(false) }}
          required={needsApiKey && !showApiSetup}
        />
      )}

      {/* Destination Drawer */}
      {selectedFlight && (
        <DestinationDrawer
          flight={selectedFlight}
          allFlights={flights}
          onClose={() => setSelectedFlight(null)}
        />
      )}
    </div>
  )
}
