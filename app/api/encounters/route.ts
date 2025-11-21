import { NextResponse } from 'next/server'
import { API_KEY, API_BASE } from '@/lib/api/config'

const API_URL = `${API_BASE}/encounters`

export async function POST(request: Request) {
  try {
    const body = await request.json()
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
        { error: `Failed to create encounter: ${response.statusText}`, details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('❌ Error creating encounter:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to create encounter' },
      { status: 500 }
    )
  }
}


