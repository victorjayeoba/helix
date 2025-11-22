'use client'

import { useState, useRef, useEffect } from 'react'
import { User, Bot, Mic, MicOff } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useTabs } from '@/contexts/TabContext'
import ReactMarkdown from 'react-markdown'

// TypeScript declaration for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

const navTabs = [
  'Calendar',
  'Finder',
  'Appointments',
  'Messages',
  'CoBrain'
]

export default function DoctorNavigation() {
  const { openTab } = useTabs()
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      // Clear the prompt when starting to record
      setPrompt('')
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      // Build transcript from all results (not just new ones)
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' '
        }
      }
      if (finalTranscript) {
        setPrompt(finalTranscript.trim())
      }
    }

    recognition.onerror = (event: any) => {
      setIsListening(false)
      if (event.error === 'not-allowed') {
        setError('Microphone permission denied.')
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setError(`Speech recognition error: ${event.error}`)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
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
      setError('Speech recognition not supported in your browser.')
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
        setError('Failed to start voice recognition.')
      }
    }
  }

  const handleNavClick = (tab: string) => {
    // Map tab names to display labels
    const labelMap: Record<string, string> = {
      'Calendar': 'Calendar',
      'Finder': 'Patient Finder',
      'Appointments': 'Appointments',
      'Messages': 'Message Center',
      'CoBrain': 'Helix CoBrain'
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

        {/* Helix CoBrain Quick Prompt */}
        <div className="flex items-center gap-4 relative">
          <button
            className="p-2 hover:bg-slate-600 rounded-lg transition flex items-center gap-2"
            onClick={() => {
              // Stop listening if active when closing
              if (isListening && recognitionRef.current) {
                recognitionRef.current.stop()
                setIsListening(false)
              }
              setCopilotOpen((prev) => !prev)
              setError(null)
              setAnswer(null)
            }}
          >
            <Bot className="w-5 h-5 text-white" />
            <span className="hidden sm:inline text-sm font-medium">Quick CoBrain</span>
          </button>

          {copilotOpen && (
            <div className="absolute right-12 top-10 w-80 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-4 z-50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-900">Helix CoBrain</p>
                <button 
                  className="p-1 hover:bg-slate-100 rounded" 
                  onClick={() => {
                    // Stop listening if active when closing
                    if (isListening && recognitionRef.current) {
                      recognitionRef.current.stop()
                      setIsListening(false)
                    }
                    setCopilotOpen(false)
                  }}
                >
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
                    placeholder="Ask Helix CoBrain..."
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
                <Button
                  className="w-full bg-helix-primary hover:bg-helix-primary/90"
                  disabled={loading || prompt.trim().length === 0 || isListening}
                  onClick={async () => {
                    if (!prompt.trim()) return
                    
                    // Stop listening if active
                    if (isListening) {
                      recognitionRef.current?.stop()
                      setIsListening(false)
                    }

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
                      setError(err.message || 'Failed to contact Helix CoBrain')
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

