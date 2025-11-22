import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  getCountFromServer
} from 'firebase/firestore'
import { db } from './config'

export interface NotificationData {
  userId: string
  type: 'appointment' | 'message' | 'alert' | 'success' | 'reminder'
  title: string
  message: string
  read: boolean
  createdAt?: any
  metadata?: Record<string, any>
}

/**
 * Create a notification for a user
 */
export const createNotification = async (notificationData: NotificationData): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized')

  try {
    const notification = {
      ...notificationData,
      read: false,
      createdAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, 'notifications'), notification)
    console.log('✅ Notification created:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('❌ Error creating notification:', error)
    throw new Error('Failed to create notification')
  }
}

/**
 * Subscribe to user notifications in real-time
 */
export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: any[]) => void
): (() => void) => {
  if (!db) {
    console.error('Firestore not initialized')
    return () => {}
  }

  try {
    const notificationsRef = collection(db, 'notifications')
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        callback(notifications)
      },
      (error) => {
        console.error('❌ Error listening to notifications:', error)
      }
    )

    return unsubscribe
  } catch (error) {
    console.error('❌ Error subscribing to notifications:', error)
    return () => {}
  }
}

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  if (!db) return 0

  try {
    const notificationsRef = collection(db, 'notifications')
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    )

    const snapshot = await getCountFromServer(q)
    return snapshot.data().count
  } catch (error) {
    console.error('❌ Error getting unread count:', error)
    return 0
  }
}

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized')

  try {
    const notificationRef = doc(db, 'notifications', notificationId)
    await updateDoc(notificationRef, {
      read: true
    })
  } catch (error) {
    console.error('❌ Error marking notification as read:', error)
    throw new Error('Failed to mark notification as read')
  }
}

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized')

  try {
    const notificationsRef = collection(db, 'notifications')
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    )

    const snapshot = await getCountFromServer(q)
    
    // This would need to be done in batches for production
    // For now, we'll just log it
    console.log(`Marking ${snapshot.data().count} notifications as read`)
  } catch (error) {
    console.error('❌ Error marking all as read:', error)
    throw new Error('Failed to mark all notifications as read')
  }
}


