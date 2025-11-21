/**
 * API Configuration
 * Centralized configuration for API calls
 */

export const getApiKey = (): string => {
  const key = process.env.EMR_API_KEY
  if (!key) {
    // Fallback to hardcoded value for backward compatibility (remove in production)
    console.warn('⚠️ EMR_API_KEY environment variable is not set, using fallback')
    return '1OCMWBALSS:ZxfDMeshZyERUySeqUlxW82P45aVg6uJnYPaQstuzBM'
  }
  return key
}

export const getApiBaseUrl = (): string => {
  const url = process.env.EMR_API_BASE_URL
  if (!url) {
    // Default to the hackathon API if not set
    return 'https://hackathon-api.aheadafrica.org/v1'
  }
  return url
}

// For server-side use (API routes)
export const API_KEY = getApiKey()
export const API_BASE = getApiBaseUrl()

