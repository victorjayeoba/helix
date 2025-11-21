// Firebase Cloud Messaging Service Worker
// This file must be at the root of your public directory

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: 'AIzaSyBsZBo_l3g_SuK22sAvd1Nlh6j9_Z1AuBs',
  authDomain: 'helix-9fce1.firebaseapp.com',
  projectId: 'helix-9fce1',
  storageBucket: 'helix-9fce1.firebasestorage.app',
  messagingSenderId: '1006418972324',
  appId: '1:1006418972324:web:e468e5843a38a828002031'
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload)

  const notificationTitle = payload.notification?.title || 'Helix Health'
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/helix.png',
    badge: '/icon-dark-32x32.png',
    data: payload.data,
    tag: payload.data?.type || 'notification'
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  event.notification.close()

  // Open the app or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('/patient-dashboard') && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/patient-dashboard')
      }
    })
  )
})

