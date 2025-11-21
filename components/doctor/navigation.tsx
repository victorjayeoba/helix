'use client'

import { useState } from 'react'
import { User, Bot, Mic } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useTabs } from '@/contexts/TabContext'
import ReactMarkdown from 'react-markdown'

const navTabs = [
  'Calendar',
  'Finder',
  'Appointments',
  'Messages',
  'Copilot'
]

export default function DoctorNavigation() {
  const { openTab } = useTabs()
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)

  const handleNavClick = (tab: string) => {
    // Map tab names to display labels
    const labelMap: Record<string, string> = {
      'Calendar': 'Calendar',
      'Finder': 'Patient Finder',
      'Appointments': 'Appointments',
      'Messages': 'Message Center',
      'Copilot': 'Doctor Copilot'
    }
    openTab(tab, labelMap[tab] || tab)
  }

  return (
    <nav className="bg-slate-700 text-white sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-2.5">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {navTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleNavClick(tab)}
              className="px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors hover:bg-slate-600 rounded"
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Copilot Quick Prompt */}
        <div className="flex items-center gap-4 relative">
          <button
            className="p-2 hover:bg-slate-600 rounded-lg transition flex items-center gap-2"
            onClick={() => {
              setCopilotOpen((prev) => !prev)
              setError(null)
              setAnswer(null)
            }}
          >
            <Bot className="w-5 h-5 text-white" />
            <span className="hidden sm:inline text-sm font-medium">Quick Copilot</span>
          </button>

          {copilotOpen && (
            <div className="absolute right-12 top-10 w-80 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-4 z-50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-900">Copilot Prompt</p>
                <button className="p-1 hover:bg-slate-100 rounded" onClick={() => setCopilotOpen(false)}>
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="pr-10 resize-none"
                    placeholder="Ask Copilot..."
                  />
                  <Mic className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                </div>
                <Button
                  className="w-full bg-helix-primary hover:bg-helix-primary/90"
                  disabled={loading || prompt.trim().length === 0}
                  onClick={async () => {
                    if (!prompt.trim()) return
                    setLoading(true)
                    setError(null)
                    setAnswer(null)
                    try {
                      const res = await fetch('/api/assistant', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ message: prompt })
                      })
                      if (!res.ok) {
                        throw new Error(await res.text())
                      }
                      const data = await res.json()
                      setAnswer(typeof data.answer === 'string' ? data.answer : JSON.stringify(data.answer))
                    } catch (err: any) {
                      setError(err.message || 'Failed to contact copilot')
                    } finally {
                      setLoading(false)
                    }
                  }}
                >
                  {loading ? 'Thinking...' : 'Send'}
                </Button>
                {error && <p className="text-xs text-red-600">{error}</p>}
                {answer && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 max-h-40 overflow-auto prose prose-sm prose-slate">
                    <ReactMarkdown>{answer}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}

          <button className="p-2 hover:bg-slate-600 rounded-lg transition">
            <User className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </nav>
  )
}

