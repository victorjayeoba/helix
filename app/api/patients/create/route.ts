import { NextResponse } from 'next/server'
import { API_KEY, API_BASE } from '@/lib/api/config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.first_name) {
      return NextResponse.json(
        { 
          status: false,
          status_code: 400,
          message: 'First name is required' 
        },
        { status: 400 }
      )
    }
    
    // Prepare patient data
    const patientData = {
      first_name: body.first_name,
      last_name: body.last_name || '',
      email: body.email || null,
      phone_number: body.phone_number || null,
      date_of_birth: body.date_of_birth || null,
      gender: body.gender || null,
      address: body.address || null,
      allergies: Array.isArray(body.allergies) ? body.allergies : []
    }

    console.log('📤 Creating patient in Dorra API:', patientData)
    
    const response = await fetch(`${API_BASE}/patients/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patientData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Dorra API error:', errorData)
      return NextResponse.json(
        errorData || { 
          status: false,
          message: `Failed to create patient: ${response.statusText}` 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Patient created successfully:', data)
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Error creating patient:', error.message)
    return NextResponse.json(
      { 
        status: false,
        status_code: 500,
        message: error.message || 'Failed to create patient' 
      },
      { status: 500 }
    )
  }
}

