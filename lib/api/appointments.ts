export interface Appointment {
  id: number
  date: string // ISO format: '2025-11-20T09:00:00Z'
  reason: string
  summary: string
  status: string
  patient: number
  created_at: string
  updated_at: string
}

export interface AppointmentsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Appointment[]
}

interface PaginatedParams {
  ordering?: string
  page?: number
  search?: string
}

export async function fetchAppointments(apiEndpoint: string = '/api/appointments'): Promise<Appointment[]> {
  try {
    // Call Next.js API route instead of external API directly (avoids CORS)
    const response = await fetch(apiEndpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to fetch appointments: ${response.statusText}`)
    }

    const data: AppointmentsResponse = await response.json()
    return data.results || []
  } catch (error: any) {
    console.error("❌ Error fetching appointments:", error.message)
    throw error
  }
}

export async function fetchPatientAppointments(
  patientId: number,
  params: PaginatedParams = {}
): Promise<AppointmentsResponse> {
  try {
    const query = new URLSearchParams()
    if (params.ordering) query.append('ordering', params.ordering)
    if (params.page && params.page > 1) query.append('page', params.page.toString())
    if (params.search) query.append('search', params.search)

    const endpoint = `/api/patients/${patientId}/appointments${query.toString() ? `?${query.toString()}` : ''}`
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to fetch patient appointments: ${response.statusText}`)
    }

    const data: AppointmentsResponse = await response.json()
    return data
  } catch (error: any) {
    console.error('❌ Error fetching patient appointments:', error.message)
    throw error
  }
}

export interface UpdateAppointmentData {
  date?: string
  reason?: string | null
  summary?: string | null
  status?: 'active' | 'completed'
  patient?: number | null
}

export async function updateAppointment(
  appointmentId: number,
  data: UpdateAppointmentData
): Promise<Appointment> {
  try {
    const response = await fetch(`/api/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to update appointment: ${response.statusText}`)
    }

    return response.json()
  } catch (error: any) {
    console.error('❌ Error updating appointment:', error.message)
    throw error
  }
}

