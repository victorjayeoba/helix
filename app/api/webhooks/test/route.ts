import { NextResponse } from 'next/server'
import { API_KEY, API_BASE } from '@/lib/api/config'

const WEBHOOK_TEST_URL = `${API_BASE}/auth/webhook/test`

/**
 * Test webhook by triggering a sample event
 * POST /api/webhooks/test
 * Body: { url?: string } (optional - uses production URL if not provided)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    let { url } = body

    // If no URL provided, use production URL
    if (!url) {
      const PRODUCTION_URL = 'https://helixhq.vercel.app'
      url = `${PRODUCTION_URL}/api/webhooks/pharmavigilance`
      console.log('ℹ️ No URL provided, using production URL:', url)
    }

    // Validate URL format
    try {
      new URL(url)
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid URL format. Must be a valid URL' },
        { status: 400 }
      )
    }

    console.log('🧪 Testing webhook URL:', url)

    const response = await fetch(WEBHOOK_TEST_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
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
          error: `Failed to test webhook: ${response.statusText}`,
          details: errorData
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Test event sent successfully:', data)

    return NextResponse.json(
      {
        success: true,
        message: 'Test event sent to webhook',
        webhook_url: url,
        data
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Error testing webhook:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to test webhook' },
      { status: 500 }
    )
  }
}

/**
 * Get webhook test information
 * GET /api/webhooks/test
 */
export async function GET() {
  const PRODUCTION_URL = 'https://helixhq.vercel.app'
  const webhookUrl = `${PRODUCTION_URL}/api/webhooks/pharmavigilance`
  
  return NextResponse.json(
    {
      message: 'Use POST to test your webhook',
      endpoint: '/api/webhooks/test',
      webhook_url: webhookUrl,
      example: {
        method: 'POST',
        url: '/api/webhooks/test',
        body: {
          url: webhookUrl // optional, uses production URL if not provided
        }
      }
    },
    { status: 200 }
  )
}

