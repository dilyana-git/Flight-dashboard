export const AIRLINES = {
  W6: { name: 'Wizz Air',  color: '#8b5cf6', bg: '#2d1b69', iata: 'W6', emoji: '💜' },
  FR: { name: 'Ryanair',  color: '#f59e0b', bg: '#451a03', iata: 'FR', emoji: '💛' },
  U2: { name: 'easyJet',  color: '#f97316', bg: '#431407', iata: 'U2', emoji: '🧡' },
}

export const ALL_AIRLINE_CODES = ['W6', 'FR', 'U2']

export function getAirlineColor(airlineCode) {
  return AIRLINES[airlineCode]?.color ?? '#ffffff'
}

export function getMarkerColor(airlines) {
  const codes = Array.isArray(airlines) ? airlines : [airlines]
  const unique = [...new Set(codes)]
  if (unique.length === 1) return AIRLINES[unique[0]]?.color ?? '#ffffff'
  return '#ffffff'
}
