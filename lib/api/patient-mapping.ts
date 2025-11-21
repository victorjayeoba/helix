/**
 * Patient Mapping Utilities
 * Maps Firebase Auth users to Dorra API patient IDs
 */

import { getFirestore, getDoc, setDoc, doc } from 'firebase/firestore'

export interface PatientMapping {
  firebaseUid: string
  dorraPatientId: number
  createdAt: string
  updatedAt: string
}

/**
 * Get Dorra patient ID for a Firebase user
 */
export async function getDorraPatientId(firebaseUid: string): Promise<number | null> {
  try {
    const db = getFirestore()
    const mappingDoc = await getDoc(doc(db, 'userMappings', firebaseUid))
    
    if (mappingDoc.exists()) {
      const data = mappingDoc.data()
      return data.dorraPatientId || null
    }
    return null
  } catch (error) {
    console.error('Error getting Dorra patient ID:', error)
    return null
  }
}

/**
 * Store mapping between Firebase UID and Dorra patient ID
 */
export async function storeDorraPatientMapping(
  firebaseUid: string,
  dorraPatientId: number
): Promise<void> {
  try {
    const db = getFirestore()
    const now = new Date().toISOString()
    
    await setDoc(doc(db, 'userMappings', firebaseUid), {
      firebaseUid,
      dorraPatientId,
      createdAt: now,
      updatedAt: now
    })
    
    console.log(`✅ Stored mapping: ${firebaseUid} -> Patient #${dorraPatientId}`)
  } catch (error) {
    console.error('Error storing patient mapping:', error)
    throw error
  }
}

/**
 * Check if a Firebase user has a Dorra patient ID
 */
export async function hasDorraPatient(firebaseUid: string): Promise<boolean> {
  const patientId = await getDorraPatientId(firebaseUid)
  return patientId !== null
}

