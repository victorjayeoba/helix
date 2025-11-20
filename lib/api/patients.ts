export interface Patient {
  id: number
  first_name: string
  last_name: string
  email?: string
  phone?: string
  date_of_birth?: string
  gender?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface PatientsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Patient[]
}

export async function fetchPatients(params?: {
  ordering?: string
  page?: number
  search?: string
}): Promise<PatientsResponse> {
  try {
    const { ordering = '', page = 1, search = '' } = params || {}
    
    const url = new URL('/api/patients', window.location.origin)
    if (ordering && ordering.trim()) url.searchParams.append('ordering', ordering)
    if (page > 1) url.searchParams.append('page', page.toString())
    if (search && search.trim()) url.searchParams.append('search', search)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to fetch patients: ${response.statusText}`)
    }

    const data: PatientsResponse = await response.json()
    return data
  } catch (error: any) {
    console.error('❌ Error fetching patients:', error.message)
    throw error
  }
}

