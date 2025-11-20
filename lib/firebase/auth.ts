import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  User,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './config'

export type UserType = 'doctor' | 'patient'

export interface UserData {
  uid: string
  email: string
  displayName?: string
  userType: UserType
  createdAt: Date
}

export const signUp = async (
  email: string, 
  password: string, 
  userType: UserType,
  displayName?: string
): Promise<User> => {
  try {
    if (!auth) {
      throw new Error('Firebase auth not initialized')
    }
    if (!db) {
      throw new Error('Firestore not initialized')
    }

    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update display name if provided
    if (displayName) {
      await updateProfile(user, { displayName })
    }

    // Store user type in Firestore
    const userData: UserData = {
      uid: user.uid,
      email: user.email || '',
      displayName: displayName || user.displayName || '',
      userType,
      createdAt: new Date()
    }

    await setDoc(doc(db, 'users', user.uid), userData)

    return user
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create account')
  }
}

export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    if (!auth) {
      throw new Error('Firebase auth not initialized')
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in')
  }
}

export const logOut = async (): Promise<void> => {
  try {
    if (!auth) {
      throw new Error('Firebase auth not initialized')
    }
    await signOut(auth)
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign out')
  }
}

export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    if (!db) {
      console.error('Firestore not initialized')
      return null
    }
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      const data = userDoc.data()
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      } as UserData
    }
    return null
  } catch (error: any) {
    console.error('Error getting user data:', error)
    // If it's a permissions error, return null instead of throwing
    // This allows the app to continue working while rules are being set up
    if (error.code === 'permission-denied' || error.message?.includes('permissions')) {
      console.warn('Firestore permissions not set up yet. Please configure Firestore security rules.')
      return null
    }
    throw new Error(error.message || 'Failed to get user data')
  }
}

