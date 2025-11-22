import { NextResponse } from 'next/server'
import { API_KEY, API_BASE } from '@/lib/api/config'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appointmentId } = await params

    console.log('📥 Cancelling appointment:', appointmentId)

    // Cancel appointment in Dorra API
    const response = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'cancelled'
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Dorra API error:', errorData)
      return NextResponse.json(
        { 
          success: false,
          message: errorData.message || 'Failed to cancel appointment' 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Appointment cancelled:', data)

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment: data
    })
  } catch (error: any) {
    console.error('❌ Error cancelling appointment:', error)
    return NextResponse.json(
      { 
        success: false,
        message: error.message || 'Failed to cancel appointment' 
      },
      { status: 500 }
    )
  }
}

