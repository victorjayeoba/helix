import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore'
import { db } from './config'

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderType: 'patient' | 'doctor'
  senderName: string
  text: string
  timestamp: Date
  read: boolean
}

export interface Conversation {
  id: string
  patientId: string
  patientName: string
  patientEmail?: string
  doctorId?: string
  doctorName?: string
  doctorEmail?: string
  lastMessage: string
  lastMessageAt: Date
  status: 'active' | 'closed' | 'waiting'
  unreadCount?: number
}

/**
 * Create a new conversation or get existing one
 */
export const createOrGetConversation = async (
  patientId: string,
  patientName: string,
  patientEmail?: string
): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized')

  try {
    // Check if conversation already exists for this patient
    const conversationsRef = collection(db, 'conversations')
    const q = query(
      conversationsRef,
      where('patientId', '==', patientId),
      where('status', '==', 'active'),
      limit(1)
    )

    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      // Return existing conversation
      return querySnapshot.docs[0].id
    }

    // Create new conversation
    const newConversation = {
      patientId,
      patientName,
      patientEmail: patientEmail || '',
      doctorId: null,
      doctorName: null,
      doctorEmail: null,
      lastMessage: 'Conversation started',
      lastMessageAt: serverTimestamp(),
      status: 'waiting',
      createdAt: serverTimestamp()
    }

    const docRef = await addDoc(conversationsRef, newConversation)
    return docRef.id
  } catch (error) {
    console.error('Error creating conversation:', error)
    throw new Error('Failed to create conversation')
  }
}

/**
 * Send a message in a conversation
 */
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  senderType: 'patient' | 'doctor',
  senderName: string,
  text: string
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized')

  try {
    // Add message to messages subcollection
    const messagesRef = collection(db, 'conversations', conversationId, 'messages')
    await addDoc(messagesRef, {
      senderId,
      senderType,
      senderName,
      text,
      timestamp: serverTimestamp(),
      read: false
    })

    // Update conversation's last message
    const conversationRef = doc(db, 'conversations', conversationId)
    await updateDoc(conversationRef, {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      status: 'active'
    })
  } catch (error) {
    console.error('Error sending message:', error)
    throw new Error('Failed to send message')
  }
}

/**
 * Listen to messages in real-time
 */
export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  if (!db) {
    console.error('Firestore not initialized')
    return () => {}
  }

  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages')
    const q = query(messagesRef, orderBy('timestamp', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const messages: ChatMessage[] = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            conversationId,
            senderId: data.senderId || '',
            senderType: data.senderType || 'patient',
            senderName: data.senderName || 'Unknown',
            text: data.text || '',
            timestamp: data.timestamp?.toDate() || new Date(),
            read: data.read || false
          }
        })
        callback(messages)
      },
      (error) => {
        console.error('Error listening to messages:', error)
      }
    )

    return unsubscribe
  } catch (error) {
    console.error('Error subscribing to messages:', error)
    return () => {}
  }
}

/**
 * Get all conversations for a doctor
 */
export const getDoctorConversations = async (doctorId?: string): Promise<Conversation[]> => {
  if (!db) throw new Error('Firestore not initialized')

  try {
    const conversationsRef = collection(db, 'conversations')
    let q

    if (doctorId) {
      // Get conversations assigned to this doctor
      q = query(
        conversationsRef,
        where('doctorId', '==', doctorId),
        orderBy('lastMessageAt', 'desc')
      )
    } else {
      // Get all active/waiting conversations (for unassigned cases)
      q = query(
        conversationsRef,
        where('status', 'in', ['active', 'waiting']),
        orderBy('lastMessageAt', 'desc')
      )
    }

    const querySnapshot = await getDocs(q)
    const conversations: Conversation[] = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        patientId: data.patientId || '',
        patientName: data.patientName || 'Unknown Patient',
        patientEmail: data.patientEmail || '',
        doctorId: data.doctorId || undefined,
        doctorName: data.doctorName || undefined,
        doctorEmail: data.doctorEmail || undefined,
        lastMessage: data.lastMessage || '',
        lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
        status: data.status || 'waiting'
      }
    })

    return conversations
  } catch (error) {
    console.error('Error getting conversations:', error)
    throw new Error('Failed to get conversations')
  }
}

/**
 * Subscribe to conversations for a doctor
 */
export const subscribeToDoctorConversations = (
  doctorId: string | undefined,
  callback: (conversations: Conversation[]) => void
): (() => void) => {
  if (!db) {
    console.error('Firestore not initialized')
    return () => {}
  }

  try {
    const conversationsRef = collection(db, 'conversations')
    let q

    if (doctorId) {
      q = query(
        conversationsRef,
        where('doctorId', '==', doctorId),
        orderBy('lastMessageAt', 'desc')
      )
    } else {
      q = query(
        conversationsRef,
        where('status', 'in', ['active', 'waiting']),
        orderBy('lastMessageAt', 'desc'),
        limit(50)
      )
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const conversations: Conversation[] = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            patientId: data.patientId || '',
            patientName: data.patientName || 'Unknown Patient',
            patientEmail: data.patientEmail || '',
            doctorId: data.doctorId || undefined,
            doctorName: data.doctorName || undefined,
            doctorEmail: data.doctorEmail || undefined,
            lastMessage: data.lastMessage || '',
            lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
            status: data.status || 'waiting'
          }
        })
        callback(conversations)
      },
      (error) => {
        console.error('Error listening to conversations:', error)
      }
    )

    return unsubscribe
  } catch (error) {
    console.error('Error subscribing to conversations:', error)
    return () => {}
  }
}

/**
 * Assign a doctor to a conversation
 */
export const assignDoctorToConversation = async (
  conversationId: string,
  doctorId: string,
  doctorName: string,
  doctorEmail?: string
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized')

  try {
    const conversationRef = doc(db, 'conversations', conversationId)
    await updateDoc(conversationRef, {
      doctorId,
      doctorName,
      doctorEmail: doctorEmail || '',
      status: 'active'
    })
  } catch (error) {
    console.error('Error assigning doctor:', error)
    throw new Error('Failed to assign doctor')
  }
}

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized')

  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages')
    const q = query(
      messagesRef,
      where('senderId', '!=', userId),
      where('read', '==', false)
    )

    const querySnapshot = await getDocs(q)
    const updatePromises = querySnapshot.docs.map((document) =>
      updateDoc(doc(db!, 'conversations', conversationId, 'messages', document.id), {
        read: true
      })
    )

    await Promise.all(updatePromises)
  } catch (error) {
    console.error('Error marking messages as read:', error)
  }
}

/**
 * Close a conversation
 */
export const closeConversation = async (conversationId: string): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized')

  try {
    const conversationRef = doc(db, 'conversations', conversationId)
    await updateDoc(conversationRef, {
      status: 'closed',
      closedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error closing conversation:', error)
    throw new Error('Failed to close conversation')
  }
}

