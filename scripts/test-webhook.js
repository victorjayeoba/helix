/**
 * Script to test webhook by triggering a sample event
 * Usage: node scripts/test-webhook.js
 */

const API_KEY = "1OCMWBALSS:ZxfDMeshZyERUySeqUlxW82P45aVg6uJnYPaQstuzBM"
const WEBHOOK_TEST_URL = "https://hackathon-api.aheadafrica.org/v1/auth/webhook/test"
const PRODUCTION_URL = "https://helixhq.vercel.app"
const WEBHOOK_URL = `${PRODUCTION_URL}/api/webhooks/pharmavigilance`

async function testWebhook() {
  try {
    console.log('🧪 Testing webhook with PharmaVigillance API...')
    console.log('📍 Webhook URL to test:', WEBHOOK_URL)
    console.log('')
    console.log('⏳ Sending test event...')
    console.log('')

    const response = await fetch(WEBHOOK_TEST_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: WEBHOOK_URL })
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData = {}
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { raw: errorText }
      }
      
      console.error('❌ Failed to test webhook:')
      console.error('Status:', response.status, response.statusText)
      console.error('Error:', JSON.stringify(errorData, null, 2))
      process.exit(1)
    }

    const data = await response.json()
    console.log('✅ Test event sent successfully!')
    console.log('Response:', JSON.stringify(data, null, 2))
    console.log('')
    console.log('🔔 Check your webhook endpoint logs to see if the event was received')
    console.log('📍 Webhook endpoint:', WEBHOOK_URL)
    console.log('')
    console.log('💡 Tip: Check your Vercel logs or server console to see the webhook event')
    
  } catch (error) {
    console.error('❌ Error testing webhook:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Run the test
testWebhook()

