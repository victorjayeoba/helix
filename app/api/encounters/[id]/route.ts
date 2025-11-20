import { NextResponse } from 'next/server'

const API_KEY = "1OCMWBALSS:ZxfDMeshZyERUySeqUlxW82P45aVg6uJnYPaQstuzBM"
const API_BASE = "https://hackathon-api.aheadafrica.org/v1"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const url = `${API_BASE}/encounters/${id}`

    const response = await fetch(url, {
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
        { error: `Failed to fetch encounter: ${response.statusText}`, details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Error fetching encounter:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch encounter' },
      { status: 500 }
    )
  }
}


