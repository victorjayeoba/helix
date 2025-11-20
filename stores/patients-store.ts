import { create } from 'zustand'
import { Patient, fetchPatients, PatientsResponse } from '@/lib/api/patients'

interface PatientsState {
  patients: Patient[]
  loading: boolean
  error: string | null
  lastFetched: number | null
  cacheDuration: number
  count: number
  next: string | null
  previous: string | null
  
  // Actions
  fetchPatients: (params?: { ordering?: string; page?: number; search?: string }, forceRefresh?: boolean) => Promise<void>
  clearCache: () => void
  setCacheDuration: (duration: number) => void
}

export const usePatientsStore = create<PatientsState>((set, get) => ({
  patients: [],
  loading: false,
  error: null,
  lastFetched: null,
  cacheDuration: 5 * 60 * 1000, // 5 minutes default
  count: 0,
  next: null,
  previous: null,

  fetchPatients: async (params = {}, forceRefresh = false) => {
    const state = get()
    
    // Check if we should use cached data
    if (!forceRefresh && state.lastFetched) {
      const timeSinceLastFetch = Date.now() - state.lastFetched
      if (timeSinceLastFetch < state.cacheDuration) {
        console.log('📦 Using cached patients data')
        return
      }
    }

    set({ loading: true, error: null })
    
    try {
      console.log('🔄 Fetching patients from API...')
      const data = await fetchPatients(params)
      set({ 
        patients: data.results || [], 
        count: data.count || 0,
        next: data.next,
        previous: data.previous,
        loading: false, 
        lastFetched: Date.now(),
        error: null 
      })
      console.log(`✅ Loaded ${data.results?.length || 0} patients`)
    } catch (error: any) {
      console.error('❌ Error fetching patients:', error)
      set({ 
        loading: false, 
        error: error.message || 'Failed to fetch patients' 
      })
    }
  },

  clearCache: () => {
    set({ patients: [], lastFetched: null, count: 0, next: null, previous: null })
  },

  setCacheDuration: (duration: number) => {
    set({ cacheDuration: duration })
  }
}))

