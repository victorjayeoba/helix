import { NextResponse } from 'next/server'
import { API_KEY, API_BASE } from '@/lib/api/config'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appointmentId } = await params
    const body = await request.json()
    const { date, time } = body

    if (!date || !time) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Date and time are required' 
        },
        { status: 400 }
      )
    }

    // Combine date and time into ISO format
    const appointmentDateTime = new Date(`${date}T${time}:00`)
    const isoDateTime = appointmentDateTime.toISOString()

    console.log('📥 Rescheduling appointment:', appointmentId, 'to:', isoDateTime)

    // Update appointment in Dorra API
    const response = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        date: isoDateTime
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Dorra API error:', errorData)
      return NextResponse.json(
        { 
          success: false,
          message: errorData.message || 'Failed to reschedule appointment' 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Appointment rescheduled:', data)

    return NextResponse.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment: data
    })
  } catch (error: any) {
    console.error('❌ Error rescheduling appointment:', error)
    return NextResponse.json(
      { 
        success: false,
        message: error.message || 'Failed to reschedule appointment' 
      },
      { status: 500 }
    )
  }
}

