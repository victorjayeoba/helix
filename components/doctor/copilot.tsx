'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface AssistantResponse {
  plan?: any
  data?: any
  answer?: string
  error?: string
}

export default function DoctorCopilot() {
  const [message, setMessage] = useState("Summarize patient 42's last appointment.")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<AssistantResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sendRequest = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Request failed ${res.status}`)
      }

      const data = await res.json()
      setResponse(data)
    } catch (err: any) {
      setError(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 bg-white h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto py-8 px-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Doctor Copilot</h1>
          <p className="text-sm text-slate-600 mt-1">
            Ask the AI assistant questions about patients, encounters, and documentation.
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700">Your Request</label>
          <div className="relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none pr-10"
            />
            <Mic className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
          </div>
          <Button onClick={sendRequest} disabled={loading}>
            {loading ? 'Thinking...' : 'Ask Copilot'}
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        {response && (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">Answer</h2>
              <div className="prose prose-sm prose-slate max-w-none text-slate-800">
                {response.answer ? <ReactMarkdown>{response.answer}</ReactMarkdown> : '—'}
              </div>
            </div>

            <details className="border border-slate-200 rounded-lg bg-white">
              <summary className="px-4 py-2 text-sm font-medium cursor-pointer">See plan & raw data</summary>
              <div className="grid gap-3 px-4 py-3">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 mb-1">Plan JSON</h3>
                  <pre className="text-xs text-slate-800 bg-slate-50 p-3 rounded overflow-auto max-h-60">
                    {JSON.stringify(response.plan, null, 2)}
                  </pre>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 mb-1">Raw Data</h3>
                  <pre className="text-xs text-slate-800 bg-slate-50 p-3 rounded overflow-auto max-h-60">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}


