'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface AssistantResponse {
  plan?: any
  data?: any
  answer?: string
  error?: string
}

export default function AssistantTestPage() {
  const [message, setMessage] = useState("Show me patient 99's last two encounters")
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
    <div className="flex-1 h-full bg-white">
      <div className="max-w-3xl mx-auto py-10 px-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Assistant API Tester</h1>
          <p className="text-sm text-slate-600 mt-1">
            Send a message to <code>/api/assistant</code> and inspect the plan/data/answer payload.
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700">Doctor Message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <Button onClick={sendRequest} disabled={loading}>
            {loading ? 'Sending...' : 'Send to Assistant'}
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        {response && (
          <div className="grid gap-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">Plan</h2>
              <pre className="text-xs text-slate-800 overflow-auto max-h-64">
                {JSON.stringify(response.plan, null, 2)}
              </pre>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">Data</h2>
              <pre className="text-xs text-slate-800 overflow-auto max-h-64">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-white">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">Answer</h2>
              <div className="prose prose-sm prose-slate max-w-none text-slate-800">
                {response.answer ? <ReactMarkdown>{response.answer}</ReactMarkdown> : '—'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


