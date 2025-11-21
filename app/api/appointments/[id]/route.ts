import { NextResponse } from 'next/server'
import { API_KEY, API_BASE } from '@/lib/api/config'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Try without trailing slash first (matching GET route pattern)
    let url = `${API_BASE}/appointments/${id}`
    
    console.log(`🔄 PATCH ${url}`, body)

    let response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    // If 404, try with trailing slash (Django REST framework style)
    if (!response.ok && response.status === 404) {
      url = `${API_BASE}/appointments/${id}/`
      console.log(`🔄 Retrying PATCH ${url}`)
      response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
    }

    if (!response.ok) {
      const errorText = await response.text()
      let errorData = {}
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { raw: errorText }
      }
      console.error(`❌ PATCH failed: ${response.status} ${response.statusText}`, errorData)
      return NextResponse.json(
        { error: `Failed to update appointment: ${response.statusText}`, details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Error updating appointment:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to update appointment' },
      { status: 500 }
    )
  }
}

