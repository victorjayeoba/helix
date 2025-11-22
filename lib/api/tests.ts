export interface PatientTest {
  id: number
  unique_id: string
  name: string
  result: string
  created_at: string
  patient: number
  encounter?: number | null
  patient_name?: string | null
}

export interface TestsResponse {
  count: number
  next: string | null
  previous: string | null
  results: PatientTest[]
}

interface PaginatedParams {
  ordering?: string
  page?: number
  search?: string
  created_at__date?: string
  patient?: number
}

export async function fetchPatientTests(
  patientId: number,
  params: PaginatedParams = {}
): Promise<TestsResponse> {
  try {
    const query = new URLSearchParams()
    if (params.ordering) query.append('ordering', params.ordering)
    if (params.page && params.page > 1) query.append('page', params.page.toString())
    if (params.search) query.append('search', params.search)
    if (params.created_at__date) query.append('created_at__date', params.created_at__date)
    if (params.patient) query.append('patient', params.patient.toString())

    const endpoint = `/api/patients/${patientId}/tests${query.toString() ? `?${query.toString()}` : ''}`
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to fetch patient tests: ${response.statusText}`)
    }

    const data: TestsResponse = await response.json()
    return data
  } catch (error: any) {
    console.error('❌ Error fetching patient tests:', error.message)
    throw error
  }
}

