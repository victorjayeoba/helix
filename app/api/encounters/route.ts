import { NextResponse } from 'next/server'

const API_KEY = "1OCMWBALSS:ZxfDMeshZyERUySeqUlxW82P45aVg6uJnYPaQstuzBM"
const API_URL = "https://hackathon-api.aheadafrica.org/v1/encounters"

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


