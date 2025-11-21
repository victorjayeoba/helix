import { NextResponse } from 'next/server'

// Server-side environment variable (no NEXT_PUBLIC_ prefix needed)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, patientId, conversationHistory } = body
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Placeholder response until Gemini API key is provided
    if (!GEMINI_API_KEY) {
      // Return a helpful default response
      const responses = [
        "I understand your concern. While I'm currently in demo mode, I can help you with general health information. For specific medical advice, please consult with a healthcare professional.",
        "Thank you for reaching out. I'm here to help with health-related questions. What specific symptoms or concerns would you like to discuss?",
        "I appreciate you sharing that. Based on common medical knowledge, it's important to monitor your symptoms. Would you like to schedule an appointment with a doctor?",
        "That's a valid concern. For proper diagnosis and treatment, I recommend booking a consultation with one of our healthcare professionals. Would you like me to help you schedule an appointment?"
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      return NextResponse.json({
        success: true,
        message: randomResponse,
        mode: 'demo'
      })
    }

    // When Gemini API key is provided, use it
    try {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a helpful medical AI assistant. Provide informative, empathetic responses to health-related questions. Always remind users to consult healthcare professionals for serious concerns. User message: ${message}`
              }]
            }]
          })
        }
      )

      if (!geminiResponse.ok) {
        throw new Error('Gemini API request failed')
      }

      const geminiData = await geminiResponse.json()
      const aiMessage = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 
                        'I apologize, but I could not generate a response. Please try again.'

      return NextResponse.json({
        success: true,
        message: aiMessage,
        mode: 'gemini'
      })
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError)
      // Fallback to demo mode
      return NextResponse.json({
        success: true,
        message: "I'm here to help! While I'm currently in demo mode, I can assist with general health information. For specific medical advice, please consult with a healthcare professional.",
        mode: 'demo'
      })
    }

  } catch (error: any) {
    console.error('❌ Chat API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to process message' 
      },
      { status: 500 }
    )
  }
}

