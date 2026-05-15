import { useState, useCallback, useRef } from 'react'
import { MOCK_FLIGHTS } from '../data/mockFlights'

const RAPIDAPI_HOST = 'sky-scrapper.p.rapidapi.com'
const BASE_URL = `https://${RAPIDAPI_HOST}/api/v1/flights`

// Top LCC destinations from Sofia — kept to 10 to stay within the 100 req/month free tier.
// Each full search = 1 SOF lookup (cached) + 10 searchFlights calls.
const SEARCH_DESTINATIONS = [
  'STN', // London Stansted
  'VIE', // Vienna
  'CIA', // Rome Ciampino
  'BCN', // Barcelona
  'ATH', // Athens
  'BGY', // Milan Bergamo
  'WAW', // Warsaw
  'OTP', // Bucharest
  'PRG', // Prague
  'BUD', // Budapest
  'SKG', // Thessaloniki
  'BVA', // Paris Beauvais
]

// Map carrier names → IATA codes (Sky Scrapper uses alternateId but fallback on name)
const CARRIER_NAME_MAP = {
  'Wizz Air': 'W6',
  'Wizzair': 'W6',
  'Ryanair': 'FR',
  'easyJet': 'U2',
  'EasyJet': 'U2',
}

function resolveAirlineCode(carrier) {
  if (carrier?.alternateId) return carrier.alternateId
  return CARRIER_NAME_MAP[carrier?.name] ?? 'XX'
}

// Persist airport {skyId, entityId} across sessions to save API calls
function getCachedAirport(iata) {
  try {
    const item = localStorage.getItem(`sky_airport_${iata}`)
    return item ? JSON.parse(item) : null
  } catch { return null }
}

function setCachedAirport(iata, data) {
  try {
    localStorage.setItem(`sky_airport_${iata}`, JSON.stringify(data))
  } catch {}
}

async function resolveAirport(iata, apiKey, signal) {
  const cached = getCachedAirport(iata)
  if (cached) return cached

  const res = await fetch(
    `${BASE_URL}/searchAirport?query=${iata}&locale=en-US`,
    {
      headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': RAPIDAPI_HOST },
      signal,
    }
  )
  if (!res.ok) return null
  const data = await res.json()
  // Prefer an exact IATA match, fall back to first result
  const airport =
    data.data?.find(a => a.iata === iata || a.skyId === iata) ??
    data.data?.[0]
  if (!airport) return null

  const result = { skyId: airport.skyId, entityId: airport.entityId }
  setCachedAirport(iata, result)
  return result
}

function normalizeItinerary(itinerary, destIata) {
  const leg = itinerary.legs?.[0]
  if (!leg) return null

  const carrier = leg.carriers?.marketing?.[0]
  const airlineCode = resolveAirlineCode(carrier)

  return {
    id: itinerary.id ?? `${destIata}-${Date.now()}-${Math.random()}`,
    cityTo: leg.destination?.city ?? destIata,
    flyTo: destIata,
    price: Math.round(itinerary.price?.raw ?? 0),
    airlines: [airlineCode],
    dTime: leg.departure
      ? Math.floor(new Date(leg.departure).getTime() / 1000)
      : null,
    duration: { departure: (leg.durationInMinutes ?? 0) * 60 },
    stops: leg.stopCount ?? 0,
    deep_link: itinerary.deeplink ?? null,
  }
}

export default function useFlightSearch(apiKey, demoMode) {
  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const search = useCallback(async (filters) => {
    if (demoMode || !apiKey) {
      setFlights(MOCK_FLIGHTS)
      setError(null)
      return
    }

    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    setLoading(true)
    setError(null)
    setFlights([])

    // Use 1st of the selected month as the departure date
    const year = filters.year ?? new Date().getFullYear()
    const month = String((filters.month ?? 0) + 1).padStart(2, '0')
    const date = `${year}-${month}-01`

    try {
      // Resolve Sofia origin (cached after first call)
      const sofAirport = await resolveAirport('SOF', apiKey, signal)
      if (!sofAirport) throw new Error('Could not resolve Sofia airport (SOF). Check your API key.')

      const results = []

      // Search all destinations in parallel batches of 4
      for (let i = 0; i < SEARCH_DESTINATIONS.length; i += 4) {
        if (signal.aborted) break
        const batch = SEARCH_DESTINATIONS.slice(i, i + 4)

        const settled = await Promise.allSettled(
          batch.map(async (destIata) => {
            const destAirport = await resolveAirport(destIata, apiKey, signal)
            if (!destAirport || signal.aborted) return []

            const params = new URLSearchParams({
              originSkyId: sofAirport.skyId,
              destinationSkyId: destAirport.skyId,
              originEntityId: sofAirport.entityId,
              destinationEntityId: destAirport.entityId,
              date,
              adults: 1,
              currency: 'EUR',
              market: 'BG',
              locale: 'en-US',
              cabinClass: 'economy',
            })

            const res = await fetch(`${BASE_URL}/searchFlights?${params}`, {
              headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': RAPIDAPI_HOST,
              },
              signal,
            })

            if (res.status === 401 || res.status === 403) {
              throw new Error('Invalid RapidAPI key. Please check your key in settings.')
            }
            if (res.status === 429) {
              throw new Error('Rate limit reached. You may have used your free monthly quota.')
            }
            if (!res.ok) return []

            const data = await res.json()
            const itineraries = data.data?.itineraries ?? []

            return itineraries
              .map(it => normalizeItinerary(it, destIata))
              .filter(Boolean)
              .filter(f => f.price > 0 && f.price <= filters.budget)
              .filter(f =>
                !filters.airlines?.length ||
                filters.airlines.some(a => f.airlines.includes(a))
              )
              .filter(f =>
                filters.maxStops === 2 || f.stops <= filters.maxStops
              )
              .sort((a, b) => a.price - b.price)
              .slice(0, 1) // cheapest flight per destination
          })
        )

        for (const r of settled) {
          if (r.status === 'fulfilled') results.push(...r.value)
          // Propagate auth/rate errors immediately
          if (r.status === 'rejected' && r.reason?.message?.includes('RapidAPI')) {
            throw r.reason
          }
        }

        // Update results progressively as batches complete
        if (!signal.aborted) setFlights([...results])
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      console.error('Flight search error:', err)
      setError(err.message)
      setFlights(MOCK_FLIGHTS)
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, [apiKey, demoMode])

  return { flights, loading, error, search }
}
