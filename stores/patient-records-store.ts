import { create } from 'zustand'
import { Appointment, fetchPatientAppointments } from '@/lib/api/appointments'
import { Encounter, fetchPatientEncounters } from '@/lib/api/encounters'

interface PatientRecordsState {
  patientId: number | null
  appointments: Appointment[]
  appointmentsLoading: boolean
  appointmentsError: string | null
  lastFetchedAppointments: number | null

  encounters: Encounter[]
  encountersLoading: boolean
  encountersError: string | null
  lastFetchedEncounters: number | null

  cacheDuration: number

  fetchAppointments: (patientId: number, forceRefresh?: boolean) => Promise<void>
  fetchEncounters: (patientId: number, forceRefresh?: boolean) => Promise<void>
  clear: () => void
  setCacheDuration: (duration: number) => void
}

export const usePatientRecordsStore = create<PatientRecordsState>((set, get) => ({
  patientId: null,
  appointments: [],
  appointmentsLoading: false,
  appointmentsError: null,
  lastFetchedAppointments: null,

  encounters: [],
  encountersLoading: false,
  encountersError: null,
  lastFetchedEncounters: null,

  cacheDuration: 5 * 60 * 1000, // 5 minutes

  fetchAppointments: async (patientId: number, forceRefresh = false) => {
    const { lastFetchedAppointments, cacheDuration, patientId: currentId } = get()

    if (
      !forceRefresh &&
      currentId === patientId &&
      lastFetchedAppointments &&
      Date.now() - lastFetchedAppointments < cacheDuration
    ) {
      return
    }

    set({
      appointmentsLoading: true,
      appointmentsError: null,
      patientId
    })

    try {
      const data = await fetchPatientAppointments(patientId)
      set({
        appointments: data.results || [],
        appointmentsLoading: false,
        lastFetchedAppointments: Date.now(),
        patientId,
        appointmentsError: null
      })
    } catch (error: any) {
      set({
        appointmentsLoading: false,
        appointmentsError: error.message || 'Failed to load appointments',
        patientId
      })
    }
  },

  fetchEncounters: async (patientId: number, forceRefresh = false) => {
    const { lastFetchedEncounters, cacheDuration, patientId: currentId } = get()

    if (
      !forceRefresh &&
      currentId === patientId &&
      lastFetchedEncounters &&
      Date.now() - lastFetchedEncounters < cacheDuration
    ) {
      return
    }

    set({
      encountersLoading: true,
      encountersError: null,
      patientId
    })

    try {
      const data = await fetchPatientEncounters(patientId)
      set({
        encounters: data.results || [],
        encountersLoading: false,
        lastFetchedEncounters: Date.now(),
        patientId,
        encountersError: null
      })
    } catch (error: any) {
      set({
        encountersLoading: false,
        encountersError: error.message || 'Failed to load encounters',
        patientId
      })
    }
  },

  clear: () => {
    set({
      patientId: null,
      appointments: [],
      encounters: [],
      appointmentsError: null,
      encountersError: null,
      appointmentsLoading: false,
      encountersLoading: false,
      lastFetchedAppointments: null,
      lastFetchedEncounters: null
    })
  },

  setCacheDuration: (duration: number) => {
    set({ cacheDuration: duration })
  }
}))


