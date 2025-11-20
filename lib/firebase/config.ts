import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBsZBo_l3g_SuK22sAvd1Nlh6j9_Z1AuBs",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "helix-9fce1.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "helix-9fce1",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "helix-9fce1.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1006418972324",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1006418972324:web:e468e5843a38a828002031",
}

// Initialize Firebase
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }

  // Initialize services
  auth = getAuth(app)
  db = getFirestore(app)
} catch (error) {
  console.error('Firebase initialization error:', error)
}

export { auth, db }
export default app

