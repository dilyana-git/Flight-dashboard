import { useState } from 'react'

export default function ApiKeySetup({ apiKey, onSave, onClose, onDemo, required }) {
  const [value, setValue] = useState(apiKey ?? '')
  const [error, setError] = useState('')

  const handleSave = () => {
    const trimmed = value.trim()
    if (!trimmed) {
      setError('Please enter your RapidAPI key or use demo mode.')
      return
    }
    onSave(trimmed)
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#0a0e17]/80 backdrop-blur-sm p-4">
      <div className="bg-[#111827] border border-[#243047] rounded-2xl p-8 max-w-md w-full shadow-2xl">
        {/* Icon */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
          </div>
          <div>
            <div className="font-syne font-bold text-[#e2e8f0] text-lg">API Key Setup</div>
            <div className="text-xs text-[#64748b]">RapidAPI · Sky Scrapper (Skyscanner data)</div>
          </div>
        </div>

        {/* Steps */}
        <ol className="text-sm text-[#64748b] mb-5 space-y-2 leading-relaxed">
          <li className="flex gap-2">
            <span className="text-amber-500 font-mono font-bold flex-shrink-0">1.</span>
            Sign up free at <span className="font-mono text-[#e2e8f0] text-xs">rapidapi.com</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-500 font-mono font-bold flex-shrink-0">2.</span>
            Search for <span className="font-mono text-[#e2e8f0] text-xs">"Sky Scrapper"</span> and subscribe to the free plan
          </li>
          <li className="flex gap-2">
            <span className="text-amber-500 font-mono font-bold flex-shrink-0">3.</span>
            Copy your <span className="font-mono text-[#e2e8f0] text-xs">X-RapidAPI-Key</span> from the API console
          </li>
        </ol>

        <div className="bg-[#1a2235] border border-[#243047] rounded-lg p-3 mb-5 text-xs text-[#64748b] font-mono">
          Free tier: <span className="text-amber-500">100 requests / month</span>
          <span className="mx-2 text-[#243047]">|</span>
          ~8 searches/month with caching
        </div>

        <div className="space-y-3 mb-5">
          <div className="text-xs text-[#64748b] font-mono uppercase tracking-wider">Your RapidAPI Key</div>
          <input
            type="text"
            value={value}
            onChange={e => { setValue(e.target.value); setError('') }}
            placeholder="Paste your X-RapidAPI-Key here..."
            className="w-full bg-[#1a2235] border border-[#243047] rounded-lg px-4 py-3 text-sm text-[#e2e8f0] font-mono placeholder-[#64748b] focus:outline-none focus:border-amber-500 transition-colors"
          />
          {error && <div className="text-xs text-red-400">{error}</div>}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDemo}
            className="flex-1 py-2.5 rounded-lg border border-[#243047] text-sm text-[#64748b] hover:text-[#e2e8f0] hover:border-[#64748b] transition-colors font-sans"
          >
            Use Demo Mode
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0a0e17] font-semibold text-sm transition-colors font-sans"
          >
            Save &amp; Start
          </button>
        </div>

        {!required && (
          <button
            onClick={onClose}
            className="mt-4 w-full text-center text-xs text-[#64748b] hover:text-[#e2e8f0] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
