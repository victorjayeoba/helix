'use client'

import { useState } from 'react'
import { Send, Bot, User, Stethoscope, Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'

type ChatMode = 'doctor' | 'ai'

interface Message {
  id: number
  sender: 'user' | 'doctor' | 'ai'
  text: string
  timestamp: string
}

interface PatientChatProps {
  onMobileMenuToggle?: () => void
}

export default function PatientChat({ onMobileMenuToggle }: PatientChatProps = {}) {
  const [chatMode, setChatMode] = useState<ChatMode>('ai')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I\'m your AI Health Assistant. How can I help you today?',
      timestamp: '10:30 AM'
    }
  ])

  // Update greeting message when mode changes
  const handleModeChange = (mode: ChatMode) => {
    setChatMode(mode)
    const greetingText = mode === 'ai' 
      ? 'Hello! I\'m your AI Health Assistant. How can I help you today?'
      : 'Hello! I\'m connecting you with a medical professional. Please describe your concern.'
    setMessages([{
      id: 1,
      sender: mode,
      text: greetingText,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }])
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    const currentMessage = message
    setMessage('')

    // For AI mode, get response from API
    if (chatMode === 'ai') {
      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: currentMessage,
            conversationHistory: messages.slice(-10) // Last 10 messages for context
          })
        })

        const data = await response.json()

        const aiResponse: Message = {
          id: messages.length + 2,
          sender: 'ai',
          text: data.message || 'I apologize, but I could not generate a response. Please try again.',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }

        setMessages(prev => [...prev, aiResponse])
      } catch (error) {
        console.error('Chat error:', error)
        const errorMessage: Message = {
          id: messages.length + 2,
          sender: 'ai',
          text: 'I apologize, but I encountered an error. Please try again.',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } else {
      // For doctor mode, simulate response (real-time messaging would require WebSocket)
      setTimeout(() => {
        const response: Message = {
          id: messages.length + 2,
          sender: 'doctor',
          text: 'Thank you for reaching out. A doctor will be with you shortly. In the meantime, please provide more details about your symptoms.',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => [...prev, response])
      }, 1000)
    }
  }

  return (
    <div className="flex-1 bg-white h-full flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <img src="/helix.png" alt="Helix Logo" className="h-6 w-auto" />
          <h1 className="text-xl font-bold text-helix-primary">ELIX</h1>
        </div>
        <button
          onClick={onMobileMenuToggle}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <Menu className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      <div className="p-4 md:p-6 bg-slate-50">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search chat history or medical topics..."
            className="pl-10 bg-white"
          />
        </div>

        {/* Header */}
        <div className="bg-helix-primary text-white p-4 md:p-6 rounded-xl">
        <h1 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Medical Consultation</h1>
        
        {/* Mode Selection */}
        <div className="grid grid-cols-2 gap-2 md:gap-4 w-full">
          <button
            onClick={() => handleModeChange('doctor')}
            className={`flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-medium transition-all border-2 ${
              chatMode === 'doctor'
                ? 'bg-white text-helix-primary border-white shadow-lg'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            <Stethoscope className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
            <div className="text-center sm:text-left">
              <div className="font-semibold text-sm md:text-base">Chat with Doctor</div>
              <div className={`text-xs ${chatMode === 'doctor' ? 'text-helix-primary/70' : 'text-white/70'} hidden sm:block`}>
                Connect with a medical professional
              </div>
            </div>
          </button>

          <button
            onClick={() => handleModeChange('ai')}
            className={`flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-medium transition-all border-2 ${
              chatMode === 'ai'
                ? 'bg-white text-helix-primary border-white shadow-lg'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            <Bot className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
            <div className="text-center sm:text-left">
              <div className="font-semibold text-sm md:text-base">AI Doctor</div>
              <div className={`text-xs ${chatMode === 'ai' ? 'text-helix-primary/70' : 'text-white/70'} hidden sm:block`}>
                Get instant AI-powered advice
              </div>
            </div>
          </button>
        </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              msg.sender === 'user' 
                ? 'bg-helix-primary' 
                : msg.sender === 'ai'
                ? 'bg-purple-500'
                : 'bg-green-500'
            }`}>
              {msg.sender === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : msg.sender === 'ai' ? (
                <Bot className="w-5 h-5 text-white" />
              ) : (
                <Stethoscope className="w-5 h-5 text-white" />
              )}
            </div>

            {/* Message Bubble */}
            <div className={`flex flex-col max-w-[70%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-2xl px-4 py-3 ${
                msg.sender === 'user'
                  ? 'bg-helix-primary text-white rounded-tr-none'
                  : msg.sender === 'ai'
                  ? 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
                  : 'bg-white border border-helix-secondary text-slate-900 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
              <span className="text-xs text-slate-500 mt-1 px-2">{msg.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="border-t border-slate-200 p-3 md:p-4 bg-white">
        <div className="flex gap-2 md:gap-3 max-w-5xl mx-auto">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={chatMode === 'doctor' ? 'Type your message to the doctor...' : 'Ask AI Doctor anything...'}
            className="resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-helix-primary hover:bg-helix-secondary px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-slate-500 text-center mt-2">
          {chatMode === 'ai' 
            ? 'AI responses are for informational purposes only. Consult a doctor for medical advice.'
            : 'Connected to on-call doctor. Response time may vary.'
          }
        </p>
      </div>
    </div>
  )
}

