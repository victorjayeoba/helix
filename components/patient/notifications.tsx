'use client'

import { useEffect, useState } from 'react'
import { Bell, Calendar, MessageSquare, AlertCircle, CheckCircle, Clock, Menu, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { getFirestore, collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { requestNotificationPermission, onMessageListener, storeFCMToken } from '@/lib/firebase/messaging'
import { toast } from 'sonner'

interface PatientNotificationsProps {
  onMobileMenuToggle?: () => void
}

interface Notification {
  id: string
  type: string
  icon: any
  title: string
  message: string
  time: string
  read: boolean
  color: string
  bg: string
  createdAt?: any
}

export default function PatientNotifications({ onMobileMenuToggle }: PatientNotificationsProps = {}) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [fcmEnabled, setFcmEnabled] = useState(false)

  // Request FCM permission on mount
  useEffect(() => {
    const setupFCM = async () => {
      if (user) {
        const token = await requestNotificationPermission()
        if (token) {
          await storeFCMToken(user.uid, token)
          setFcmEnabled(true)
          toast.success('Notifications enabled!')
        }
      }
    }

    setupFCM()
  }, [user])

  // Listen for real-time notifications from Firestore
  useEffect(() => {
    if (!user) {
      setLoading(false)
      setNotifications([])
      return
    }

    const db = getFirestore()
    const notificationsRef = collection(db, 'notifications')
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifs: Notification[] = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            type: data.type || 'info',
            icon: getIconForType(data.type),
            title: data.title,
            message: data.message,
            time: formatTime(data.createdAt),
            read: data.read || false,
            color: getColorForType(data.type),
            bg: getBgForType(data.type),
            createdAt: data.createdAt
          }
        })

        setNotifications(notifs)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching notifications:', error)
        setNotifications([])
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  // Listen for foreground FCM messages
  useEffect(() => {
    if (fcmEnabled) {
      onMessageListener()
        .then((payload: any) => {
          console.log('Received foreground message:', payload)
          toast.success(payload.notification?.title || 'New notification', {
            description: payload.notification?.body
          })
        })
        .catch((err) => console.error('Failed to receive message:', err))
    }
  }, [fcmEnabled])

  // Helper functions
  const getIconForType = (type: string) => {
    switch (type) {
      case 'appointment':
        return Calendar
      case 'message':
        return MessageSquare
      case 'alert':
        return AlertCircle
      case 'success':
        return CheckCircle
      default:
        return Clock
    }
  }

  const getColorForType = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'text-blue-600'
      case 'message':
        return 'text-green-600'
      case 'alert':
        return 'text-orange-600'
      case 'success':
        return 'text-green-600'
      default:
        return 'text-purple-600'
    }
  }

  const getBgForType = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-50'
      case 'message':
        return 'bg-green-50'
      case 'alert':
        return 'bg-orange-50'
      case 'success':
        return 'bg-green-50'
      default:
        return 'bg-purple-50'
    }
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Just now'
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return

    try {
      const db = getFirestore()
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return

    try {
      const db = getFirestore()
      const unreadNotifs = notifications.filter((n) => !n.read)
      
      await Promise.all(
        unreadNotifs.map((n) =>
          updateDoc(doc(db, 'notifications', n.id), { read: true })
        )
      )

      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Failed to mark notifications as read')
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Notifications</h1>
            <p className="text-sm text-white/80">Stay updated on your health journey</p>
          </div>
          <Button 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 border-2"
            onClick={markAllAsRead}
            disabled={loading || notifications.every((n) => n.read)}
          >
            Mark all as read
          </Button>
        </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-helix-primary" />
          </div>
        ) : (
          <>
        {notifications.map((notification) => {
          const Icon = notification.icon
          return (
            <Card
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`rounded-xl ${notification.read ? 'opacity-60' : 'border-2 border-helix-primary/20'} hover:shadow-md transition-shadow cursor-pointer`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 ${notification.bg} rounded-full flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${notification.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1.5"></span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{notification.message}</p>
                    <p className="text-xs text-slate-500">{notification.time}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
          </>
        )}

        {!loading && notifications.length === 0 && (
          <Card className="rounded-xl">
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">No notifications yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

