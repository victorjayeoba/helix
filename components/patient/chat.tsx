'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, User, Stethoscope, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { 
  createOrGetConversation, 
  sendMessage, 
  subscribeToMessages,
  ChatMessage 
} from '@/lib/firebase/chat'
import { toast } from 'sonner'

interface Message {
  id: string
  sender: 'user' | 'doctor'
  text: string
  timestamp: string
}

interface PatientChatProps {
  onMobileMenuToggle?: () => void
}

export default function PatientChat({ onMobileMenuToggle }: PatientChatProps = {}) {
  const { user, userData } = useAuth()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize doctor chat conversation
  useEffect(() => {
    if (user && userData) {
      initializeDoctorChat()
    }
  }, [user, userData])

  const initializeDoctorChat = async () => {
    if (!user || !userData) return

    try {
      setLoading(true)
      const convId = await createOrGetConversation(
        user.uid,
        userData.displayName || user.email || 'Patient',
        user.email || undefined
      )
      setConversationId(convId)

      // Subscribe to real-time messages
      const unsubscribe = subscribeToMessages(convId, (chatMessages: ChatMessage[]) => {
        const formattedMessages: Message[] = chatMessages.map((msg) => ({
          id: msg.id,
          sender: msg.senderType === 'patient' ? 'user' : 'doctor',
          text: msg.text,
          timestamp: new Date(msg.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }))

        if (formattedMessages.length === 0) {
          // Show welcome message
          setMessages([{
            id: 'welcome',
            sender: 'doctor',
            text: 'Hello! An available doctor will respond to your message shortly. Please describe your concern or question.',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          }])
        } else {
          setMessages(formattedMessages)
        }
      })

      return () => unsubscribe()
    } catch (error) {
      console.error('Error initializing doctor chat:', error)
      toast.error('Failed to connect to doctor chat')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || loading) return

    if (!user || !userData || !conversationId) {
      toast.error('Please sign in to chat with a doctor')
      return
    }

    const currentMessage = message
    setMessage('')

    try {
      setLoading(true)
      await sendMessage(
        conversationId,
        user.uid,
        'patient',
        userData.displayName || user.email || 'Patient',
        currentMessage
      )
      // Message will appear via real-time listener
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
      setMessage(currentMessage) // Restore message on error
    } finally {
      setLoading(false)
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
        {/* Header */}
        <div className="bg-helix-primary text-white p-4 md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Stethoscope className="w-6 h-6 md:w-8 md:h-8 shrink-0" />
            <div>
              <h1 className="text-xl md:text-2xl font-semibold">Chat with a Doctor</h1>
              <p className="text-sm text-white/80 mt-1">Any available doctor will respond</p>
            </div>
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
                : 'bg-green-500'
            }`}>
              {msg.sender === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Stethoscope className="w-5 h-5 text-white" />
              )}
            </div>

            {/* Message Bubble */}
            <div className={`flex flex-col max-w-[70%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-2xl px-4 py-3 ${
                msg.sender === 'user'
                  ? 'bg-helix-primary text-white rounded-tr-none'
                  : 'bg-white border border-helix-secondary text-slate-900 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
              <span className="text-xs text-slate-500 mt-1 px-2">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-slate-200 p-3 md:p-4 bg-white">
        <div className="flex gap-2 md:gap-3 max-w-5xl mx-auto">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message to a doctor..."
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
            disabled={loading || !message.trim()}
            className="bg-helix-primary hover:bg-helix-secondary px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-slate-500 text-center mt-2">
          An available doctor will respond to your message. Response time may vary.
        </p>
      </div>
    </div>
  )
}

