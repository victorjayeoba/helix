import { NextResponse } from 'next/server'
import { API_KEY, API_BASE } from '@/lib/api/config'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const ordering = searchParams.get('ordering') || ''
    const page = searchParams.get('page') || '1'
    const search = searchParams.get('search') || ''
    const { id: patientId } = await params

    const url = new URL(`${API_BASE}/patients/${patientId}/appointments`)

    if (ordering && ordering.trim()) url.searchParams.append('ordering', ordering)
    if (page && parseInt(page) > 1) url.searchParams.append('page', page)
    if (search && search.trim()) url.searchParams.append('search', search)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData = {}
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { raw: errorText }
      }
      return NextResponse.json(
        { error: `Failed to fetch patient appointments: ${response.statusText}`, details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Error fetching patient appointments:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch patient appointments' },
      { status: 500 }
    )
  }
}

