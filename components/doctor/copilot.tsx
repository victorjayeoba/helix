'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface AssistantResponse {
  plan?: any
  data?: any
  answer?: string
  error?: string
}

// TypeScript declaration for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export default function DoctorCoBrain() {
  const [message, setMessage] = useState("Summarize patient 99's last appointment.")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<AssistantResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      // Clear the textarea when starting to record
      setMessage('')
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''

      // Build transcript from all results (not just new ones)
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      // Set the message with all final transcript plus any interim
      setMessage(finalTranscript + (interimTranscript ? `[listening...]` : ''))
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.')
      } else if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Please enable microphone access.')
      } else if (event.error === 'aborted') {
        // User stopped, don't show error
      } else {
        setError(`Speech recognition error: ${event.error}`)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      // Clean up any listening indicator
      setMessage((prev) => prev.replace(/\s*\[listening\.\.\.\]$/, '').trim())
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Error starting recognition:', error)
        setError('Failed to start voice recognition. Please try again.')
      }
    }
  }

  const sendRequest = async () => {
    // Stop listening if active
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }

    // Clean up any listening indicator text
    const cleanMessage = message.replace(/\s*\[listening\.\.\.\]$/, '')
    if (cleanMessage !== message) {
      setMessage(cleanMessage)
    }

    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: cleanMessage })
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
          <h1 className="text-2xl font-semibold text-slate-900">Helix CoBrain</h1>
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
            <button
              onClick={toggleListening}
              className={`absolute right-3 top-3 p-1.5 rounded-full transition-colors ${
                isListening 
                  ? 'bg-red-100 text-red-600 animate-pulse' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title={isListening ? 'Stop recording' : 'Start voice input'}
              type="button"
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>
          <Button onClick={sendRequest} disabled={loading || isListening}>
            {loading ? 'Thinking...' : 'Ask Helix CoBrain'}
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


