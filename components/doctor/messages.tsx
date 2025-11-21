'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, User, Stethoscope, Clock, CheckCheck, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import {
  Conversation,
  ChatMessage,
  subscribeToDoctorConversations,
  subscribeToMessages,
  sendMessage,
  assignDoctorToConversation,
  closeConversation
} from '@/lib/firebase/chat'
import { toast } from 'sonner'

export default function Messages() {
  const { user, userData } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'waiting' | 'active'>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Subscribe to all conversations for this doctor
  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToDoctorConversations(undefined, (convs) => {
      setConversations(convs)
    })

    return () => unsubscribe()
  }, [user])

  // Subscribe to messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return

    const unsubscribe = subscribeToMessages(selectedConversation.id, (msgs) => {
      setMessages(msgs)
    })

    return () => unsubscribe()
  }, [selectedConversation])

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation)

    // If the conversation is waiting and not assigned to anyone, assign this doctor
    if (conversation.status === 'waiting' && !conversation.doctorId && user && userData) {
      try {
        await assignDoctorToConversation(
          conversation.id,
          user.uid,
          userData.displayName || user.email || 'Doctor',
          user.email || undefined
        )
        toast.success('You are now handling this conversation')
      } catch (error) {
        console.error('Error assigning doctor:', error)
      }
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !user || !userData) return

    try {
      setLoading(true)
      await sendMessage(
        selectedConversation.id,
        user.uid,
        'doctor',
        userData.displayName || user.email || 'Doctor',
        messageText
      )
      setMessageText('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseConversation = async () => {
    if (!selectedConversation) return

    try {
      await closeConversation(selectedConversation.id)
      toast.success('Conversation closed')
      setSelectedConversation(null)
    } catch (error) {
      console.error('Error closing conversation:', error)
      toast.error('Failed to close conversation')
    }
  }

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      searchQuery === '' ||
      conv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filterStatus === 'all' ||
      conv.status === filterStatus

    return matchesSearch && matchesFilter
  })

  return (
    <div className="flex-1 bg-white h-full flex">
      {/* Conversations List */}
      <div className="w-80 border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Patient Messages</h2>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
              className="flex-1"
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'waiting' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('waiting')}
              className="flex-1"
            >
              Waiting
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('active')}
              className="flex-1"
            >
              Active
            </Button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              <p>No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={`p-4 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition ${
                  selectedConversation?.id === conversation.id ? 'bg-slate-100' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-helix-primary flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{conversation.patientName}</h3>
                      <p className="text-xs text-slate-500">
                        {conversation.patientEmail || 'No email'}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      conversation.status === 'waiting'
                        ? 'destructive'
                        : conversation.status === 'active'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {conversation.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 truncate mb-1">{conversation.lastMessage}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {new Date(conversation.lastMessageAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-helix-primary flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">{selectedConversation.patientName}</h2>
                <p className="text-sm text-slate-600">{selectedConversation.patientEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  selectedConversation.status === 'waiting'
                    ? 'destructive'
                    : selectedConversation.status === 'active'
                    ? 'default'
                    : 'secondary'
                }
              >
                {selectedConversation.status}
              </Badge>
              {selectedConversation.status !== 'closed' && (
                <Button variant="outline" size="sm" onClick={handleCloseConversation}>
                  Close Chat
                </Button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.length === 0 ? (
              <div className="text-center text-slate-500 mt-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.senderType === 'doctor' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      msg.senderType === 'doctor' ? 'bg-green-500' : 'bg-helix-primary'
                    }`}
                  >
                    {msg.senderType === 'doctor' ? (
                      <Stethoscope className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`flex flex-col max-w-[70%] ${
                      msg.senderType === 'doctor' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        msg.senderType === 'doctor'
                          ? 'bg-green-500 text-white rounded-tr-none'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">{msg.senderName}</p>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-2">
                      <span className="text-xs text-slate-500">
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {msg.read && msg.senderType === 'doctor' && (
                        <CheckCheck className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          {selectedConversation.status !== 'closed' && (
            <div className="border-t border-slate-200 p-4 bg-white">
              <div className="flex gap-3">
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message to the patient..."
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
                  disabled={loading || !messageText.trim()}
                  className="bg-green-600 hover:bg-green-700 px-6"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-slate-50">
          <div className="text-center text-slate-500">
            <Stethoscope className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium mb-2">Select a Conversation</h3>
            <p className="text-sm">Choose a patient conversation from the list to start messaging</p>
          </div>
        </div>
      )}
    </div>
  )
}
