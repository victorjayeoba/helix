import { NextResponse } from 'next/server'
import { API_KEY, API_BASE } from '@/lib/api/config'

const API_URL = `${API_BASE}/ai/emr`

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body?.prompt || !body?.patient) {
      return NextResponse.json(
        { error: 'prompt and patient are required' },
        { status: 400 }
      )
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
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
        { error: `Failed to create AI EMR record: ${response.statusText}`, details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('❌ Error calling AI EMR record endpoint:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to create AI EMR record' },
      { status: 500 }
    )
  }
}


