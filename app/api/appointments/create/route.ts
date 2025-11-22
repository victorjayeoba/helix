import { NextResponse } from 'next/server'
import { API_KEY, API_BASE } from '@/lib/api/config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      patientId, 
      prompt
    } = body
    
    if (!patientId) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Patient ID is required' 
        },
        { status: 400 }
      )
    }

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Appointment prompt is required' 
        },
        { status: 400 }
      )
    }

    console.log('📤 Creating appointment via AI:', { patientId, prompt })
    
    const response = await fetch(`${API_BASE}/ai/emr`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt.trim(),
        patient: patientId
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Appointment creation error:', errorData)
      return NextResponse.json({
        success: false,
        message: errorData.message || `Failed to create appointment: ${response.statusText}`
      }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ Appointment response:', data)
    
    // Check if it created an Appointment resource
    if (data.resource === 'Appointment') {
      return NextResponse.json({
        success: true,
        message: data.message || 'Appointment created successfully',
        resource: data.resource,
        pharmacies: data.available_pharmacies || []
      })
    } else if (data.resource === 'Error') {
      return NextResponse.json({
        success: false,
        message: data.message || 'Failed to create appointment'
      }, { status: 400 })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Unexpected response from API'
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('❌ Error creating appointment:', error.message)
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to create appointment'
    }, { status: 500 })
  }
}

