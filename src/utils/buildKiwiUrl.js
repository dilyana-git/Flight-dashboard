export function buildKiwiUrl({ from = 'SOF', to, departure, returnDate }) {
  const base = 'https://www.kiwi.com/en/booking'
  const params = new URLSearchParams({ from, to })
  if (departure) params.set('departure', departure)
  if (returnDate) params.set('return', returnDate)
  return `${base}?${params}`
}

export function buildDeepLink(flight) {
  if (flight.deep_link) return flight.deep_link
  return buildKiwiUrl({
    from: 'SOF',
    to: flight.flyTo,
    departure: flight.dTime
      ? new Date(flight.dTime * 1000).toISOString().split('T')[0]
      : undefined,
  })
}
