import { NextResponse } from 'next/server'

/**
 * Webhook handler for PharmaVigillance API events
 * Receives DrugInteraction events and processes them
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate webhook payload
    if (!body.event) {
      return NextResponse.json(
        { error: 'Missing event field in webhook payload' },
        { status: 400 }
      )
    }

    // Handle DrugInteraction events
    if (body.event === 'DrugInteraction') {
      const {
        severity,
        details,
        resource,
        resource_id,
        destination_url
      } = body

      console.log('🔔 DrugInteraction Webhook Received:', {
        severity,
        details,
        resource,
        resource_id,
        destination_url
      })

      // TODO: Store this in your database or trigger notifications
      // For now, we'll just log it and return success

      // You can add logic here to:
      // - Store the interaction in your database
      // - Send notifications to doctors
      // - Update encounter records with interaction flags
      // - Trigger alerts in the UI

      return NextResponse.json(
        {
          success: true,
          message: 'DrugInteraction event processed',
          event: {
            severity,
            details,
            resource,
            resource_id
          }
        },
        { status: 200 }
      )
    }

    // Handle unknown events
    console.log('⚠️ Unknown webhook event:', body.event)
    return NextResponse.json(
      {
        success: true,
        message: `Event ${body.event} received but not processed`
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Error processing webhook:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

// Allow GET for webhook verification (some services ping the endpoint)
export async function GET() {
  return NextResponse.json(
    { message: 'PharmaVigillance webhook endpoint is active' },
    { status: 200 }
  )
}

