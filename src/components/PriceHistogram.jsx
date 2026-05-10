import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts'

const BUCKET_SIZE = 50

export default function PriceHistogram({ flights, selectedRange, onRangeSelect }) {
  const buckets = useMemo(() => {
    if (!flights.length) return []
    const max = Math.max(...flights.map(f => f.price))
    const count = Math.ceil(max / BUCKET_SIZE)
    const data = Array.from({ length: count }, (_, i) => ({
      range: `€${i * BUCKET_SIZE}–${(i + 1) * BUCKET_SIZE}`,
      from: i * BUCKET_SIZE,
      to: (i + 1) * BUCKET_SIZE,
      count: 0,
    }))
    for (const f of flights) {
      const idx = Math.floor(f.price / BUCKET_SIZE)
      if (data[idx]) data[idx].count++
    }
    return data.filter(b => b.count > 0)
  }, [flights])

  if (!buckets.length) return null

  const isSelected = (bucket) =>
    selectedRange && selectedRange[0] === bucket.from && selectedRange[1] === bucket.to

  const handleClick = (data) => {
    if (!data?.activePayload?.[0]) return
    const b = data.activePayload[0].payload
    if (isSelected(b)) {
      onRangeSelect(null)
    } else {
      onRangeSelect([b.from, b.to])
    }
  }

  return (
    <div className="flex-shrink-0 bg-[#111827] border-b border-[#1a2235] px-4 pt-2 pb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-[#64748b] font-mono uppercase tracking-wider">Price distribution</span>
        {selectedRange && (
          <button
            onClick={() => onRangeSelect(null)}
            className="text-[10px] text-amber-500 hover:text-amber-400 font-mono"
          >
            Clear filter
          </button>
        )}
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <BarChart data={buckets} onClick={handleClick} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="range"
            tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'DM Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #243047', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#e2e8f0', fontFamily: 'DM Mono' }}
            itemStyle={{ color: '#f59e0b' }}
            formatter={(v) => [v, 'Flights']}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]} cursor="pointer">
            {buckets.map((b, i) => (
              <Cell
                key={i}
                fill={isSelected(b) ? '#f59e0b' : selectedRange ? '#243047' : '#f59e0b80'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
