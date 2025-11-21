/**
 * Script to register webhook with PharmaVigillance API
 * Usage: node scripts/register-webhook.js
 */

const API_KEY = "1OCMWBALSS:ZxfDMeshZyERUySeqUlxW82P45aVg6uJnYPaQstuzBM"
const WEBHOOK_REGISTER_URL = "https://hackathon-api.aheadafrica.org/v1/auth/webhook/register"
const PRODUCTION_URL = "https://helixhq.vercel.app"
const WEBHOOK_URL = `${PRODUCTION_URL}/api/webhooks/pharmavigilance`

async function registerWebhook() {
  try {
    console.log('📤 Registering webhook with PharmaVigillance API...')
    console.log('📍 Webhook URL:', WEBHOOK_URL)
    console.log('')

    const response = await fetch(WEBHOOK_REGISTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ webhook_url: WEBHOOK_URL })
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData = {}
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { raw: errorText }
      }
      
      console.error('❌ Failed to register webhook:')
      console.error('Status:', response.status, response.statusText)
      console.error('Error:', JSON.stringify(errorData, null, 2))
      process.exit(1)
    }

    const data = await response.json()
    console.log('✅ Webhook registered successfully!')
    console.log('Response:', JSON.stringify(data, null, 2))
    console.log('')
    console.log('🎉 Your webhook is now active and will receive DrugInteraction events')
    console.log('📍 Webhook endpoint:', WEBHOOK_URL)
    
  } catch (error) {
    console.error('❌ Error registering webhook:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Run the registration
registerWebhook()

