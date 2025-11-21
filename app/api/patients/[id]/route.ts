import { NextResponse } from 'next/server'

const API_KEY = "1OCMWBALSS:ZxfDMeshZyERUySeqUlxW82P45aVg6uJnYPaQstuzBM"
const API_BASE = "https://hackathon-api.aheadafrica.org/v1"

/**
 * Delete a patient
 * DELETE /api/patients/[id]
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      )
    }

    console.log(`🗑️ Deleting patient ${id}...`)

    const response = await fetch(`${API_BASE}/patients/${id}`, {
      method: 'DELETE',
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
        {
          error: `Failed to delete patient: ${response.statusText}`,
          details: errorData
        },
        { status: response.status }
      )
    }

    // Handle 204 No Content response
    if (response.status === 204) {
      return NextResponse.json(
        {
          status: true,
          status_code: 204,
          message: 'success',
          id: parseInt(id)
        },
        { status: 200 }
      )
    }

    const data = await response.json()
    console.log(`✅ Patient ${id} deleted successfully`)
    
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('❌ Error deleting patient:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to delete patient' },
      { status: 500 }
    )
  }
}

