import { create } from 'zustand'
import { Appointment, fetchAppointments } from '@/lib/api/appointments'

interface AppointmentsState {
  appointments: Appointment[]
  loading: boolean
  error: string | null
  lastFetched: number | null
  cacheDuration: number // in milliseconds (e.g., 5 minutes = 300000)
  currentEndpoint: string | null
  selectedPatientId: number | null
  
  // Actions
  fetchAppointments: (apiEndpoint?: string, forceRefresh?: boolean) => Promise<void>
  fetchPatientAppointments: (patientId: number, forceRefresh?: boolean) => Promise<void>
  setSelectedPatient: (patientId: number | null) => void
  clearCache: () => void
  setCacheDuration: (duration: number) => void
}

export const useAppointmentsStore = create<AppointmentsState>((set, get) => ({
  appointments: [],
  loading: false,
  error: null,
  lastFetched: null,
  cacheDuration: 5 * 60 * 1000, // 5 minutes default
  currentEndpoint: null,
  selectedPatientId: null,

  fetchAppointments: async (apiEndpoint = '/api/appointments', forceRefresh = false) => {
    const state = get()
    
    // Check if we should use cached data
    if (!forceRefresh && state.lastFetched && state.currentEndpoint === apiEndpoint && state.selectedPatientId === null) {
      const timeSinceLastFetch = Date.now() - state.lastFetched
      if (timeSinceLastFetch < state.cacheDuration) {
        // Data is still fresh, don't fetch
        console.log('📦 Using cached appointments data')
        return
      }
    }

    set({ loading: true, error: null, selectedPatientId: null })
    
    try {
      console.log('🔄 Fetching appointments from API...')
      const data = await fetchAppointments(apiEndpoint)
      set({ 
        appointments: data, 
        loading: false, 
        lastFetched: Date.now(),
        currentEndpoint: apiEndpoint,
        selectedPatientId: null,
        error: null 
      })
      console.log(`✅ Loaded ${data.length} appointments`)
    } catch (error: any) {
      console.error('❌ Error fetching appointments:', error)
      set({ 
        loading: false, 
        error: error.message || 'Failed to fetch appointments' 
      })
    }
  },

  fetchPatientAppointments: async (patientId: number, forceRefresh = false) => {
    const state = get()
    const endpoint = `/api/patients/${patientId}/appointments`
    
    // Check if we should use cached data
    if (!forceRefresh && state.lastFetched && state.currentEndpoint === endpoint && state.selectedPatientId === patientId) {
      const timeSinceLastFetch = Date.now() - state.lastFetched
      if (timeSinceLastFetch < state.cacheDuration) {
        console.log('📦 Using cached patient appointments data')
        return
      }
    }

    set({ loading: true, error: null, selectedPatientId: patientId })
    
    try {
      console.log(`🔄 Fetching appointments for patient ${patientId}...`)
      const data = await fetchAppointments(endpoint)
      set({ 
        appointments: data, 
        loading: false, 
        lastFetched: Date.now(),
        currentEndpoint: endpoint,
        selectedPatientId: patientId,
        error: null 
      })
      console.log(`✅ Loaded ${data.length} appointments for patient ${patientId}`)
    } catch (error: any) {
      console.error('❌ Error fetching patient appointments:', error)
      set({ 
        loading: false, 
        error: error.message || 'Failed to fetch patient appointments' 
      })
    }
  },

  setSelectedPatient: (patientId: number | null) => {
    set({ selectedPatientId: patientId })
    if (patientId === null) {
      // Reset to all appointments
      get().fetchAppointments('/api/appointments', true)
    } else {
      // Fetch patient-specific appointments
      get().fetchPatientAppointments(patientId, true)
    }
  },

  clearCache: () => {
    set({ appointments: [], lastFetched: null, currentEndpoint: null, selectedPatientId: null })
  },

  setCacheDuration: (duration: number) => {
    set({ cacheDuration: duration })
  }
}))

