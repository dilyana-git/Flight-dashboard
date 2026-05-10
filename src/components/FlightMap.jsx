import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { getMeta } from '../data/destinationMeta'
import { getMarkerColor, AIRLINES } from '../data/airlineConfig'
import { formatPrice, formatDuration, formatDate } from '../utils/formatters'
import { buildDeepLink } from '../utils/buildKiwiUrl'

const SOF_COORDS = [42.6952, 23.4014]

function createPriceIcon(price, color) {
  const html = `<div class="price-marker" style="background:${color};color:#fff">${formatPrice(price)}</div>`
  return L.divIcon({ html, className: '', iconAnchor: [30, 16] })
}

const sofIcon = L.divIcon({
  html: `<div style="
    width:32px;height:32px;
    background:#f59e0b;
    border:3px solid #fff;
    border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-size:16px;
    box-shadow:0 0 12px rgba(245,158,11,0.7);
  ">&#9733;</div>`,
  className: '',
  iconAnchor: [16, 16],
})

function FitBounds({ flights }) {
  const map = useMap()
  useEffect(() => {
    if (!flights.length) return
    const points = flights.map(f => {
      const m = getMeta(f.flyTo)
      return [m.lat, m.lon]
    }).filter(([lat, lon]) => lat && lon)
    if (!points.length) return
    points.push(SOF_COORDS)
    try {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 8 })
    } catch {}
  }, [flights, map])
  return null
}

export default function FlightMap({ flights, loading, onSelectFlight, selectedFlight }) {
  const groupedByDest = {}
  for (const f of flights) {
    const key = f.flyTo
    if (!groupedByDest[key]) groupedByDest[key] = []
    groupedByDest[key].push(f)
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={SOF_COORDS}
        zoom={4}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />

        {/* Sofia origin marker */}
        <Marker position={SOF_COORDS} icon={sofIcon}>
          <Popup>
            <div className="text-center">
              <div className="font-syne font-bold text-[#e2e8f0]">Sofia (SOF)</div>
              <div className="text-xs text-[#64748b]">Origin airport</div>
            </div>
          </Popup>
        </Marker>

        {/* Destination markers */}
        {Object.entries(groupedByDest).map(([iata, destFlights]) => {
          const cheapest = destFlights.reduce((a, b) => a.price < b.price ? a : b)
          const meta = getMeta(iata)
          if (!meta.lat || !meta.lon) return null
          const airlines = [...new Set(destFlights.flatMap(f => f.airlines))]
          const color = getMarkerColor(airlines)
          const icon = createPriceIcon(cheapest.price, color)
          const airline = AIRLINES[airlines[0]] ?? { name: 'Multiple carriers' }
          const isSelected = selectedFlight?.flyTo === iata

          return (
            <Marker
              key={iata}
              position={[meta.lat, meta.lon]}
              icon={icon}
              eventHandlers={{ click: () => onSelectFlight(cheapest) }}
            >
              <Popup>
                <div className="min-w-[160px] p-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{meta.flag}</span>
                    <div>
                      <div className="font-syne font-bold text-[#e2e8f0]">{meta.city}</div>
                      <div className="text-xs text-[#64748b]">{meta.country}</div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-amber-500 text-lg">{formatPrice(cheapest.price)}</div>
                  <div className="text-xs text-[#64748b] mt-1">
                    {airline.name} &middot; {formatDuration(cheapest.duration?.departure ?? 0)}
                  </div>
                  {cheapest.dTime && (
                    <div className="text-xs text-[#64748b]">{formatDate(cheapest.dTime)}</div>
                  )}
                  <a
                    href={buildDeepLink(cheapest)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-center text-xs px-3 py-1 rounded bg-amber-500 text-[#0a0e17] font-semibold hover:bg-amber-400"
                  >
                    View deal
                  </a>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {flights.length > 0 && <FitBounds flights={flights} />}
      </MapContainer>

      {/* Price legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-[#111827]/90 backdrop-blur rounded-lg p-3 border border-[#243047]">
        <div className="text-[10px] text-[#64748b] font-mono uppercase tracking-wider mb-2">Airlines</div>
        <div className="space-y-1">
          {[['#8b5cf6', 'Wizz Air'], ['#f59e0b', 'Ryanair'], ['#f97316', 'easyJet'], ['#ffffff', 'Multiple']].map(([color, name]) => (
            <div key={name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs text-[#e2e8f0] font-sans">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#0a0e17]/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-xs text-[#64748b] font-mono">Searching flights...</div>
          </div>
        </div>
      )}
    </div>
  )
}
