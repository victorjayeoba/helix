import { NextResponse } from 'next/server'
import { API_KEY, API_BASE } from '@/lib/api/config'

const WEBHOOK_REGISTER_URL = `${API_BASE}/auth/webhook/register`

/**
 * Register a webhook URL with the PharmaVigillance API
 * POST /api/webhooks/register
 * Body: { webhook_url: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    let { webhook_url } = body

    // If no webhook_url provided, use production URL
    if (!webhook_url) {
      const PRODUCTION_URL = 'https://helixhq.vercel.app'
      webhook_url = `${PRODUCTION_URL}/api/webhooks/pharmavigilance`
      console.log('ℹ️ No webhook_url provided, using production URL:', webhook_url)
    }

    // Validate URL format
    try {
      new URL(webhook_url)
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid webhook_url format. Must be a valid URL' },
        { status: 400 }
      )
    }

    console.log('📤 Registering webhook URL:', webhook_url)

    const response = await fetch(WEBHOOK_REGISTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ webhook_url })
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
          error: `Failed to register webhook: ${response.statusText}`,
          details: errorData
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Webhook registered successfully:', data)

    return NextResponse.json(
      {
        success: true,
        message: 'Webhook registered successfully',
        data
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Error registering webhook:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to register webhook' },
      { status: 500 }
    )
  }
}

/**
 * Get current webhook registration status
 * GET /api/webhooks/register
 */
export async function GET() {
  const PRODUCTION_URL = 'https://helixhq.vercel.app'
  const webhookUrl = `${PRODUCTION_URL}/api/webhooks/pharmavigilance`
  
  return NextResponse.json(
    {
      message: 'Use POST to register a webhook URL',
      endpoint: '/api/webhooks/register',
      webhook_handler: '/api/webhooks/pharmavigilance',
      production_webhook_url: webhookUrl,
      example: {
        method: 'POST',
        url: '/api/webhooks/register',
        body: {
          webhook_url: webhookUrl
        }
      },
      curl_example: `curl -X POST ${PRODUCTION_URL}/api/webhooks/register \\\n  -H "Content-Type: application/json" \\\n  -d '{"webhook_url": "${webhookUrl}"}'`
    },
    { status: 200 }
  )
}

