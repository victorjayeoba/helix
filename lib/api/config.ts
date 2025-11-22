// Dorra EMR API Configuration
// Using server-side environment variables (no NEXT_PUBLIC_ prefix for security)
export const API_BASE = process.env.EMR_API_BASE_URL || 'https://hackathon-api.aheadafrica.org/v1'
export const API_KEY = process.env.EMR_API_KEY || ''

if (!API_KEY) {
  console.warn('⚠️ EMR_API_KEY is not set. API calls will fail.')
}

if (!API_BASE) {
  console.warn('⚠️ EMR_API_BASE_URL is not set. Using default URL.')
}
