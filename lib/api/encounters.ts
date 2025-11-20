export interface EncounterMedication {
  id: number
  unique_id: string
  name: string
  dosage: string
  frequency: string
  start_date?: string
  end_date?: string
  duration?: string
  created_at?: string
  patient: number
  encounter: number
}

export interface EncounterTest {
  id: number
  unique_id: string
  name: string
  result?: string
  created_at?: string
  patient: number
  encounter: number
}

export interface Encounter {
  id: number
  patient: number
  date?: string
  encounter_type?: string
  status?: string
  summary?: string
  notes?: string
  provider_name?: string
  created_at?: string
  updated_at?: string
  [key: string]: any
}

export interface EncounterDetail extends Encounter {
  unique_id?: string
  weight?: string
  height?: string
  bmi?: string
  blood_pressure?: string
  heart_rate?: string
  temperature?: string
  symptoms?: string | null
  diagnosis?: string | null
  note?: string | null
  follow_up?: string | null
  consultation_reason?: string | null
  medical_history?: string | null
  vitals?: string | null
  medications?: string | null
  tests?: string | null
  encounter_medications?: EncounterMedication[]
  encounter_tests?: EncounterTest[]
}

export interface EncounterResponse {
  count: number
  next: string | null
  previous: string | null
  results: Encounter[]
}

interface PaginatedParams {
  ordering?: string
  page?: number
  search?: string
}

export async function fetchPatientEncounters(
  patientId: number,
  params: PaginatedParams = {}
): Promise<EncounterResponse> {
  try {
    const query = new URLSearchParams()
    if (params.ordering) query.append('ordering', params.ordering)
    if (params.page && params.page > 1) query.append('page', params.page.toString())
    if (params.search) query.append('search', params.search)

    const endpoint = `/api/patients/${patientId}/encounters${query.toString() ? `?${query.toString()}` : ''}`

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to fetch patient encounters: ${response.statusText}`)
    }

    const data: EncounterResponse = await response.json()
    return data
  } catch (error: any) {
    console.error('❌ Error fetching patient encounters:', error.message)
    throw error
  }
}

export async function fetchEncounterById(id: number): Promise<EncounterDetail> {
  try {
    const response = await fetch(`/api/encounters/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to fetch encounter: ${response.statusText}`)
    }

    return response.json()
  } catch (error: any) {
    console.error('❌ Error fetching encounter:', error.message)
    throw error
  }
}

