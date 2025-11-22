import { NextResponse } from 'next/server'
import { API_KEY, API_BASE } from '@/lib/api/config'

/**
 * Create patient using AI prompt-based endpoint
 * Uses /v1/ai/patient which accepts natural language prompts
 */
export async function POST(request: Request) {
  try {
    console.log('📥 Received patient creation request')
    
    let body
    try {
      body = await request.json()
      console.log('📝 Request body:', body)
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError)
      return NextResponse.json(
        { 
          status: false,
          status_code: 400,
          message: 'Invalid JSON in request body' 
        },
        { status: 400 }
      )
    }
    
    // Validate required fields
    if (!body.first_name) {
      console.error('❌ Missing required field: first_name')
      return NextResponse.json(
        { 
          status: false,
          status_code: 400,
          message: 'First name is required' 
        },
        { status: 400 }
      )
    }

    // Build natural language prompt for AI patient creation
    const firstName = body.first_name
    const lastName = body.last_name || ''
    const fullName = lastName ? `${firstName} ${lastName}` : firstName
    
    let prompt = `Create a new patient named ${fullName}.`
    
    // Add optional fields to the prompt
    if (body.email) prompt += ` Email: ${body.email}.`
    if (body.phone_number) prompt += ` Phone number: ${body.phone_number}.`
    if (body.date_of_birth) prompt += ` Date of birth: ${body.date_of_birth}.`
    
    // Add gender in natural language
    if (body.gender) {
      const genderText = body.gender.toLowerCase()
      if (genderText === 'male' || genderText === 'm') {
        prompt += ` Gender: Male.`
      } else if (genderText === 'female' || genderText === 'f') {
        prompt += ` Gender: Female.`
      }
    }
    
    if (body.address) prompt += ` Address: ${body.address}.`
    
    // Add allergies if provided
    if (Array.isArray(body.allergies) && body.allergies.length > 0) {
      prompt += ` Known allergies: ${body.allergies.join(', ')}.`
    }

    console.log('📤 AI Prompt:', prompt)
    console.log('🔑 Using API Key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'MISSING')
    console.log('🌐 API Base URL:', API_BASE)
    
    const apiUrl = `${API_BASE}/ai/patient`
    console.log('📍 Full URL:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    })

    console.log('📊 Response status:', response.status, response.statusText)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: response.statusText }
      }
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
    
    // The AI endpoint returns: { status, status_code, message, id }
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Error creating patient:', error)
    console.error('❌ Error stack:', error.stack)
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

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { 
      status: false,
      message: 'Method not allowed. Use POST to create a patient.' 
    },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { 
      status: false,
      message: 'Method not allowed. Use POST to create a patient.' 
    },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { 
      status: false,
      message: 'Method not allowed. Use POST to create a patient.' 
    },
    { status: 405 }
  )
}

