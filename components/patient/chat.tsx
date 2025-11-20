'use client'

import { useState } from 'react'
import { Send, Bot, User, Stethoscope, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    setMessages([...messages, newMessage])
    setMessage('')

    // Simulate response
    setTimeout(() => {
      const response: Message = {
        id: messages.length + 2,
        sender: chatMode,
        text: chatMode === 'ai' 
          ? 'I understand your concern. Based on what you\'ve described, I recommend...' 
          : 'Thank you for reaching out. Let me review your symptoms...',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, response])
    }, 1000)
  }

  return (
    <div className="flex-1 bg-white h-full flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-helix-primary">Chat</h1>
        <button
          onClick={onMobileMenuToggle}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <Menu className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      {/* Header */}
      <div className="bg-helix-primary text-white px-4 md:px-6 py-3 md:py-4 border-b border-slate-200">
        <h1 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Medical Consultation</h1>
        
        {/* Mode Selection */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 max-w-2xl">
          <button
            onClick={() => setChatMode('doctor')}
            className={`flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-medium transition-all border-2 ${
              chatMode === 'doctor'
                ? 'bg-white text-helix-primary border-white shadow-lg'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            <Stethoscope className="w-5 h-5 md:w-6 md:h-6" />
            <div className="text-center sm:text-left">
              <div className="font-semibold text-sm md:text-lg">Chat with Doctor</div>
              <div className={`text-xs md:text-sm ${chatMode === 'doctor' ? 'text-helix-primary/70' : 'text-white/70'}`}>
                Connect with a medical professional
              </div>
            </div>
          </button>

          <button
            onClick={() => setChatMode('ai')}
            className={`flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-medium transition-all border-2 ${
              chatMode === 'ai'
                ? 'bg-white text-helix-primary border-white shadow-lg'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            <Bot className="w-5 h-5 md:w-6 md:h-6" />
            <div className="text-center sm:text-left">
              <div className="font-semibold text-sm md:text-lg">AI Doctor</div>
              <div className={`text-xs md:text-sm ${chatMode === 'ai' ? 'text-helix-primary/70' : 'text-white/70'}`}>
                Get instant AI-powered advice
              </div>
            </div>
          </button>
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
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                  : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
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

