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

