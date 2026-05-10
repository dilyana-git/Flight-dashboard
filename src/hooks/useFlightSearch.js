import { useState, useCallback, useRef } from 'react'
import { MOCK_FLIGHTS } from '../data/mockFlights'
import { getMeta } from '../data/destinationMeta'

const BASE_URL = 'https://tequila.kiwi.com'

function buildDateRange(month, year) {
  const pad = n => String(n).padStart(2, '0')
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const fmt = d => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  return { date_from: fmt(firstDay), date_to: fmt(lastDay) }
}

function normalizeKiwiFlight(raw) {
  return {
    id: raw.id,
    cityTo: raw.cityTo,
    flyTo: raw.flyTo,
    price: raw.price,
    airlines: raw.airlines ?? [],
    dTime: raw.dTime,
    duration: raw.duration,
    stops: (raw.route?.length ?? 1) - 1,
    deep_link: raw.deep_link,
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

    setLoading(true)
    setError(null)

    const { date_from, date_to } = buildDateRange(filters.month, filters.year)

    const params = new URLSearchParams({
      fly_from: 'SOF',
      date_from,
      date_to,
      price_to: filters.budget,
      curr: 'EUR',
      limit: 50,
      partner_market: 'bg',
      vehicle_type: 'aircraft',
      max_stopovers: filters.maxStops === 2 ? 2 : filters.maxStops,
    })

    if (filters.airlines?.length > 0) {
      params.set('select_airlines', filters.airlines.join(','))
    }

    if (filters.tripType === 'return') {
      const returnFrom = new Date(filters.year, filters.month, 1)
      returnFrom.setDate(returnFrom.getDate() + 7)
      const returnTo = new Date(filters.year, filters.month + 1, 0)
      params.set('return_from', `${String(returnFrom.getDate()).padStart(2,'0')}/${String(returnFrom.getMonth()+1).padStart(2,'0')}/${returnFrom.getFullYear()}`)
      params.set('return_to', `${String(returnTo.getDate()).padStart(2,'0')}/${String(returnTo.getMonth()+1).padStart(2,'0')}/${returnTo.getFullYear()}`)
    }

    try {
      const res = await fetch(`${BASE_URL}/v2/search?${params}`, {
        headers: { apikey: apiKey },
        signal: abortRef.current.signal,
      })

      if (res.status === 401 || res.status === 403) {
        throw new Error('Invalid API key. Please check your Kiwi Tequila API key.')
      }
      if (res.status === 429) {
        throw new Error('Rate limit reached. Please wait a moment and try again.')
      }
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const data = await res.json()
      const normalized = (data.data ?? []).map(normalizeKiwiFlight)
      setFlights(normalized)
    } catch (err) {
      if (err.name === 'AbortError') return
      console.error('Flight search error:', err)
      setError(err.message)
      setFlights(MOCK_FLIGHTS)
    } finally {
      setLoading(false)
    }
  }, [apiKey, demoMode])

  return { flights, loading, error, search }
}
