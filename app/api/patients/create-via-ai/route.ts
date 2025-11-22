import { NextResponse } from 'next/server'
import { API_KEY, API_BASE } from '@/lib/api/config'

/**
 * Create patient using AI EMR endpoint (prompt-based approach)
 * This is an alternative to the direct /patients/create endpoint
 */
export async function POST(request: Request) {
  try {
    console.log('📥 Received AI-based patient creation request')
    
    const body = await request.json()
    console.log('📝 Request body:', body)
    
    // Validate required fields
    if (!body.first_name) {
      return NextResponse.json(
        { 
          status: false,
          message: 'First name is required' 
        },
        { status: 400 }
      )
    }

    // Build natural language prompt for patient creation
    const firstName = body.first_name
    const lastName = body.last_name || 'Patient'
    const email = body.email
    const phone = body.phone_number
    const dob = body.date_of_birth
    const gender = body.gender
    const address = body.address
    const allergies = Array.isArray(body.allergies) ? body.allergies : []

    let prompt = `Create a new patient profile for ${firstName} ${lastName}.`
    
    if (email) prompt += ` Email: ${email}.`
    if (phone) prompt += ` Phone: ${phone}.`
    if (dob) prompt += ` Date of Birth: ${dob}.`
    if (gender) prompt += ` Gender: ${gender}.`
    if (address) prompt += ` Address: ${address}.`
    if (allergies.length > 0) prompt += ` Known allergies: ${allergies.join(', ')}.`

    console.log('📤 AI Prompt:', prompt)
    console.log('🌐 API URL:', `${API_BASE}/ai/emr`)

    // Note: For NEW patient creation via AI, we may need to omit the patient field
    // or use a special value. This depends on the API's AI endpoint behavior.
    const requestBody: any = { prompt }
    
    // Some APIs might require a patient ID even for new patient creation
    // If that's the case, you might need to create a dummy/placeholder patient first
    // For now, let's try without the patient field
    
    console.log('📦 Request payload:', requestBody)

    const response = await fetch(`${API_BASE}/ai/emr`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📊 Response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ AI EMR error:', errorData)
      return NextResponse.json({
        status: false,
        message: errorData.message || `Failed to create patient via AI: ${response.statusText}`,
        details: errorData
      }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ AI Response:', data)
    
    // The AI EMR endpoint returns different response structure
    // Check what resource was created
    if (data.resource === 'Patient') {
      return NextResponse.json({
        status: true,
        id: data.id || data.patient_id,
        message: data.message || 'Patient created successfully via AI',
        data: data
      })
    } else {
      return NextResponse.json({
        status: false,
        message: 'AI did not create a patient resource. Try the direct creation endpoint instead.',
        details: data
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error('❌ Error in AI patient creation:', error)
    return NextResponse.json(
      { 
        status: false,
        message: error.message || 'Failed to create patient via AI' 
      },
      { status: 500 }
    )
  }
}



