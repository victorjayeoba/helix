import { create } from 'zustand'
import { Appointment, fetchPatientAppointments } from '@/lib/api/appointments'
import { Encounter, fetchPatientEncounters } from '@/lib/api/encounters'
import { PatientTest, fetchPatientTests } from '@/lib/api/tests'

interface PatientRecordsState {
  currentPatientId: number | null
  
  // Cached data keyed by patient ID
  appointmentsCache: Map<number, Appointment[]>
  encountersCache: Map<number, Encounter[]>
  testsCache: Map<number, PatientTest[]>
  appointmentsCacheTime: Map<number, number>
  encountersCacheTime: Map<number, number>
  testsCacheTime: Map<number, number>
  
  // Current patient's data (computed from cache)
  appointments: Appointment[]
  appointmentsLoading: boolean
  appointmentsError: string | null

  encounters: Encounter[]
  encountersLoading: boolean
  encountersError: string | null

  tests: PatientTest[]
  testsLoading: boolean
  testsError: string | null

  cacheDuration: number

  fetchAppointments: (patientId: number, forceRefresh?: boolean) => Promise<void>
  fetchEncounters: (patientId: number, forceRefresh?: boolean) => Promise<void>
  fetchTests: (patientId: number, forceRefresh?: boolean) => Promise<void>
  setCurrentPatient: (patientId: number | null) => void
  clear: () => void
  setCacheDuration: (duration: number) => void
}

export const usePatientRecordsStore = create<PatientRecordsState>((set, get) => ({
  currentPatientId: null,
  
  appointmentsCache: new Map(),
  encountersCache: new Map(),
  testsCache: new Map(),
  appointmentsCacheTime: new Map(),
  encountersCacheTime: new Map(),
  testsCacheTime: new Map(),

  appointments: [],
  appointmentsLoading: false,
  appointmentsError: null,

  encounters: [],
  encountersLoading: false,
  encountersError: null,

  tests: [],
  testsLoading: false,
  testsError: null,

  cacheDuration: 5 * 60 * 1000, // 5 minutes

  fetchAppointments: async (patientId: number, forceRefresh = false) => {
    const state = get()
    const { appointmentsCache, appointmentsCacheTime, cacheDuration } = state

    // Check cache for this specific patient
    const cachedTime = appointmentsCacheTime.get(patientId)
    const cachedData = appointmentsCache.get(patientId)

    if (
      !forceRefresh &&
      cachedData &&
      cachedTime &&
      Date.now() - cachedTime < cacheDuration
    ) {
      // Use cached data, update current patient and appointments array
      set({ 
        currentPatientId: patientId, 
        appointments: cachedData,
        appointmentsError: null 
      })
      return
    }

    set({
      appointmentsLoading: true,
      appointmentsError: null,
      currentPatientId: patientId
    })

    try {
      const data = await fetchPatientAppointments(patientId)
      const newCache = new Map(appointmentsCache)
      const newCacheTime = new Map(appointmentsCacheTime)
      
      newCache.set(patientId, data.results || [])
      newCacheTime.set(patientId, Date.now())

      const results = data.results || []
      set({
        appointmentsCache: newCache,
        appointmentsCacheTime: newCacheTime,
        appointments: results,
        appointmentsLoading: false,
        appointmentsError: null
      })
    } catch (error: any) {
      set({
        appointmentsLoading: false,
        appointmentsError: error.message || 'Failed to load appointments'
      })
    }
  },

  fetchEncounters: async (patientId: number, forceRefresh = false) => {
    const state = get()
    const { encountersCache, encountersCacheTime, cacheDuration } = state

    // Check cache for this specific patient
    const cachedTime = encountersCacheTime.get(patientId)
    const cachedData = encountersCache.get(patientId)

    if (
      !forceRefresh &&
      cachedData &&
      cachedTime &&
      Date.now() - cachedTime < cacheDuration
    ) {
      // Use cached data, update current patient and encounters array
      set({ 
        currentPatientId: patientId, 
        encounters: cachedData,
        encountersError: null 
      })
      return
    }

    set({
      encountersLoading: true,
      encountersError: null,
      currentPatientId: patientId
    })

    try {
      const data = await fetchPatientEncounters(patientId)
      const newCache = new Map(encountersCache)
      const newCacheTime = new Map(encountersCacheTime)
      
      newCache.set(patientId, data.results || [])
      newCacheTime.set(patientId, Date.now())

      const results = data.results || []
      set({
        encountersCache: newCache,
        encountersCacheTime: newCacheTime,
        encounters: results,
        encountersLoading: false,
        encountersError: null
      })
    } catch (error: any) {
      set({
        encountersLoading: false,
        encountersError: error.message || 'Failed to load encounters'
      })
    }
  },

  fetchTests: async (patientId: number, forceRefresh = false) => {
    const state = get()
    const { testsCache, testsCacheTime, cacheDuration } = state

    // Check cache for this specific patient
    const cachedTime = testsCacheTime.get(patientId)
    const cachedData = testsCache.get(patientId)

    if (
      !forceRefresh &&
      cachedData &&
      cachedTime &&
      Date.now() - cachedTime < cacheDuration
    ) {
      // Use cached data, update current patient and tests array
      set({ 
        currentPatientId: patientId, 
        tests: cachedData,
        testsError: null 
      })
      return
    }

    set({
      testsLoading: true,
      testsError: null,
      currentPatientId: patientId
    })

    try {
      const data = await fetchPatientTests(patientId)
      const newCache = new Map(testsCache)
      const newCacheTime = new Map(testsCacheTime)
      
      newCache.set(patientId, data.results || [])
      newCacheTime.set(patientId, Date.now())

      const results = data.results || []
      set({
        testsCache: newCache,
        testsCacheTime: newCacheTime,
        tests: results,
        testsLoading: false,
        testsError: null
      })
    } catch (error: any) {
      set({
        testsLoading: false,
        testsError: error.message || 'Failed to load tests'
      })
    }
  },

  setCurrentPatient: (patientId: number | null) => {
    const state = get()
    const appointments = patientId ? (state.appointmentsCache.get(patientId) || []) : []
    const encounters = patientId ? (state.encountersCache.get(patientId) || []) : []
    const tests = patientId ? (state.testsCache.get(patientId) || []) : []
    set({ 
      currentPatientId: patientId,
      appointments,
      encounters,
      tests
    })
  },

  clear: () => {
    set({
      currentPatientId: null,
      appointmentsCache: new Map(),
      encountersCache: new Map(),
      testsCache: new Map(),
      appointmentsCacheTime: new Map(),
      encountersCacheTime: new Map(),
      testsCacheTime: new Map(),
      appointmentsError: null,
      encountersError: null,
      testsError: null,
      appointmentsLoading: false,
      encountersLoading: false,
      testsLoading: false
    })
  },

  setCacheDuration: (duration: number) => {
    set({ cacheDuration: duration })
  }
}))


