import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { subscribeToNotifications, getUnreadNotificationCount } from '@/lib/firebase/notifications'

export const useNotifications = () => {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    // Subscribe to notifications
    const unsubscribe = subscribeToNotifications(user.uid, (notifs) => {
      setNotifications(notifs)
      
      // Count unread
      const unread = notifs.filter(n => !n.read).length
      setUnreadCount(unread)
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  return {
    notifications,
    unreadCount,
    loading
  }
}


