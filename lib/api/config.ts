// Dorra EMR API Configuration
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://hackathon-api.aheadafrica.org/v1'
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''

if (!API_KEY) {
  console.warn('⚠️ NEXT_PUBLIC_API_KEY is not set. API calls will fail.')
}

if (!API_BASE) {
  console.warn('⚠️ NEXT_PUBLIC_API_BASE is not set. Using default URL.')
}
