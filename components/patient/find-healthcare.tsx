'use client'

import { useState, useEffect } from 'react'
import { MapPin, Navigation, Phone, Clock, Star, Menu, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface FindHealthcareProps {
  onMobileMenuToggle?: () => void
}

interface Location {
  id: string
  name: string
  address: string
  distance: string
  rating?: number
  phone?: string
  hours: string
  services: string[]
  lat?: number
  lon?: number
}

export default function FindHealthcare({ onMobileMenuToggle }: FindHealthcareProps = {}) {
  const [searchType, setSearchType] = useState<'hospital' | 'pharmacy'>('hospital')
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      toast.error('Geolocation not supported')
      return
    }

    setLoading(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lon: longitude })
        fetchNearbyLocations(latitude, longitude, searchType)
      },
      (error) => {
        let errorMessage = 'Unable to get your location'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
        }
        setLocationError(errorMessage)
        toast.error(errorMessage)
        setLoading(false)
        // Don't load mock data - user needs to grant location access
      }
    )
  }

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Fetch nearby locations using Overpass API (OpenStreetMap)
  const fetchNearbyLocations = async (lat: number, lon: number, type: 'hospital' | 'pharmacy') => {
    setLoading(true)

    try {
      // Overpass API query for hospitals or pharmacies within 5km radius
      const amenity = type === 'hospital' ? 'hospital|clinic|doctors' : 'pharmacy'
      const radius = 5000 // 5km

      const query = `
        [out:json][timeout:25];
        (
          node["amenity"~"${amenity}"](around:${radius},${lat},${lon});
          way["amenity"~"${amenity}"](around:${radius},${lat},${lon});
          relation["amenity"~"${amenity}"](around:${radius},${lat},${lon});
        );
        out body;
        >;
        out skel qt;
      `

      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch locations')
      }

      const data = await response.json()

      // Process and format the results
      const formattedLocations: Location[] = data.elements
        .filter((element: any) => element.tags && element.tags.name)
        .map((element: any, index: number) => {
          const elementLat = element.lat || element.center?.lat
          const elementLon = element.lon || element.center?.lon
          
          const distance = elementLat && elementLon
            ? calculateDistance(lat, lon, elementLat, elementLon)
            : 0

          // Format distance: show meters if < 1 km, otherwise show km
          const formattedDistance = distance < 1 
            ? `${Math.round(distance * 1000)} m`
            : `${distance.toFixed(1)} km`

          return {
            id: `${element.id || index}`,
            name: element.tags.name || `${type === 'hospital' ? 'Hospital' : 'Pharmacy'} ${index + 1}`,
            address: element.tags['addr:full'] || 
                     `${element.tags['addr:street'] || ''} ${element.tags['addr:housenumber'] || ''}`.trim() ||
                     'Address not available',
            distance: formattedDistance,
            rating: element.tags.rating ? parseFloat(element.tags.rating) : undefined,
            phone: element.tags.phone || element.tags['contact:phone'],
            hours: element.tags.opening_hours || (type === 'hospital' ? '24/7 Emergency' : '8:00 AM - 8:00 PM'),
            services: type === 'hospital' 
              ? ['Emergency', 'General Care', 'Outpatient']
              : ['Prescription', 'OTC Medication', 'Consultation'],
            lat: elementLat,
            lon: elementLon
          }
        })
        .sort((a: Location, b: Location) => {
          const distA = parseFloat(a.distance)
          const distB = parseFloat(b.distance)
          return distA - distB
        })
        .slice(0, 10) // Get top 10 closest

      if (formattedLocations.length === 0) {
        toast.info('No locations found nearby. Please try a different location or expand your search radius.')
        setLocations([])
      } else {
        setLocations(formattedLocations)
        toast.success(`Found ${formattedLocations.length} ${type === 'hospital' ? 'hospitals' : 'pharmacies'} nearby`)
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
      toast.error('Failed to fetch locations. Please try again.')
      setLocations([])
    } finally {
      setLoading(false)
    }
  }

  // Handle search type change
  const handleSearchTypeChange = (type: 'hospital' | 'pharmacy') => {
    setSearchType(type)
    if (userLocation) {
      fetchNearbyLocations(userLocation.lat, userLocation.lon, type)
    } else {
      // Don't load mock data - user needs to grant location access first
      setLocations([])
    }
  }

  // Open in Google Maps
  const openInMaps = (location: Location) => {
    if (location.lat && location.lon) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lon}`, '_blank')
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.name + ' ' + location.address)}`, '_blank')
    }
  }

  // Don't load any data on mount - wait for user to grant location access

  return (
    <div className="flex-1 bg-white h-full overflow-y-auto">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <img src="/helix.png" alt="Helix Logo" className="h-6 w-auto" />
          <h1 className="text-xl font-bold text-helix-primary">ELIX</h1>
        </div>
        <button
          onClick={onMobileMenuToggle}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <Menu className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      <div className="p-4 md:p-6 bg-slate-50">
        {/* Location Error Alert */}
        {locationError && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Location Access</p>
              <p className="text-xs text-yellow-800 mt-1">{locationError}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-helix-primary text-white p-4 md:p-6 rounded-xl">
        <h1 className="text-xl md:text-2xl font-semibold">Find Healthcare Facilities</h1>
        <p className="text-sm text-white/80 mt-1">Locate nearby hospitals and pharmacies</p>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Filter Options */}
        <div className="mb-4 md:mb-6 space-y-3 md:space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={searchType} onValueChange={handleSearchTypeChange} className="flex-1">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hospital">Hospitals</SelectItem>
                <SelectItem value="pharmacy">Pharmacies</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full bg-helix-primary hover:bg-helix-secondary"
            onClick={getUserLocation}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Finding Locations...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 mr-2" />
                Use My Current Location
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {loading ? 'Searching...' : userLocation 
              ? `${locations.length} ${searchType === 'hospital' ? 'Hospitals' : 'Pharmacies'} Near You`
              : 'Click "Use My Current Location" to find nearby facilities'
            }
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-helix-primary" />
            </div>
          ) : locations.length === 0 && !userLocation ? (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-600 mb-2">No locations to display</p>
              <p className="text-sm text-slate-500">Please click "Use My Current Location" to find nearby {searchType === 'hospital' ? 'hospitals' : 'pharmacies'}</p>
            </div>
          ) : locations.length === 0 && userLocation ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-600 mb-2">No {searchType === 'hospital' ? 'hospitals' : 'pharmacies'} found nearby</p>
              <p className="text-sm text-slate-500">Try expanding your search radius or check a different location</p>
            </div>
          ) : (
          <div className="space-y-4">
            {locations.map((location) => (
              <Card key={location.id} className="rounded-xl hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {location.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          {location.rating && (
                            <>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium text-slate-900">{location.rating}</span>
                              </div>
                              <span className="text-sm text-slate-500">•</span>
                            </>
                          )}
                          <span className="text-sm text-slate-600">{location.distance} away</span>
                        </div>
                      </div>
                      <Button 
                        className="bg-helix-primary hover:bg-helix-secondary"
                        onClick={() => openInMaps(location)}
                      >
                        Get Directions
                      </Button>
                    </div>

                  <div className="grid gap-3 text-sm">
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{location.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span>{location.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>{location.hours}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex flex-wrap gap-2">
                      {location.services.map((service, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

