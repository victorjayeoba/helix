/**
 * Script to register webhook with PharmaVigillance API
 * Usage: node scripts/register-webhook.js
 * 
 * Requires environment variables:
 * - EMR_API_KEY: Your API token
 * - EMR_API_BASE_URL: Base URL for the API (defaults to hackathon API)
 * - PRODUCTION_URL: Your production webhook URL (defaults to helixhq.vercel.app)
 */

// Load environment variables if dotenv is available
try {
  require('dotenv').config()
} catch (e) {
  // dotenv not installed, will use fallback values or system env vars
}

const API_KEY = process.env.EMR_API_KEY || "1OCMWBALSS:ZxfDMeshZyERUySeqUlxW82P45aVg6uJnYPaQstuzBM"
const API_BASE = process.env.EMR_API_BASE_URL || "https://hackathon-api.aheadafrica.org/v1"
const PRODUCTION_URL = process.env.PRODUCTION_URL || "https://helixhq.vercel.app"
const WEBHOOK_REGISTER_URL = `${API_BASE}/auth/webhook/register`
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

