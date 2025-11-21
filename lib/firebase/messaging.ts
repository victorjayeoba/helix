/**
 * Firebase Cloud Messaging Setup
 * Real-time notifications for patients
 */

import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging'
import app from './config'

let messaging: Messaging | null = null

// Initialize Firebase Messaging
export const initializeMessaging = async () => {
  if (typeof window === 'undefined') return null

  try {
    messaging = getMessaging(app)
    return messaging
  } catch (error) {
    console.error('Error initializing messaging:', error)
    return null
  }
}

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return null
    }

    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      console.log('Notification permission granted')
      
      if (!messaging) {
        await initializeMessaging()
      }

      if (messaging) {
        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        })

        if (token) {
          console.log('FCM Token:', token)
          return token
        } else {
          console.log('No registration token available')
          return null
        }
      }
    } else if (permission === 'denied') {
      console.log('Notification permission denied')
    }

    return null
  } catch (error) {
    console.error('Error getting notification permission:', error)
    return null
  }
}

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) {
      initializeMessaging().then((msg) => {
        if (msg) {
          onMessage(msg, (payload) => {
            resolve(payload)
          })
        }
      })
    } else {
      onMessage(messaging, (payload) => {
        resolve(payload)
      })
    }
  })

// Store FCM token in Firestore
export const storeFCMToken = async (userId: string, token: string) => {
  try {
    const { getFirestore, setDoc, doc } = await import('firebase/firestore')
    const db = getFirestore()
    
    await setDoc(
      doc(db, 'fcmTokens', userId),
      {
        token,
        updatedAt: new Date().toISOString(),
        platform: 'web'
      },
      { merge: true }
    )

    console.log('FCM token stored successfully')
  } catch (error) {
    console.error('Error storing FCM token:', error)
  }
}

