'use client'

import { useState, useEffect } from 'react'
import { MapPin, Navigation, Phone, Clock, Star, Search, Menu, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  const [searchQuery, setSearchQuery] = useState('')

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
        // Load default mock data
        loadMockData()
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

          return {
            id: `${element.id || index}`,
            name: element.tags.name || `${type === 'hospital' ? 'Hospital' : 'Pharmacy'} ${index + 1}`,
            address: element.tags['addr:full'] || 
                     `${element.tags['addr:street'] || ''} ${element.tags['addr:housenumber'] || ''}`.trim() ||
                     'Address not available',
            distance: `${distance.toFixed(1)} km`,
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
        toast.info('No locations found nearby. Showing sample data.')
        loadMockData()
      } else {
        setLocations(formattedLocations)
        toast.success(`Found ${formattedLocations.length} ${type === 'hospital' ? 'hospitals' : 'pharmacies'} nearby`)
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
      toast.error('Failed to fetch locations. Showing sample data.')
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  // Load mock data as fallback
  const loadMockData = () => {
    const mockHospitals: Location[] = [
      {
        id: '1',
        name: 'City General Hospital',
        address: '123 Main Street, Downtown',
        distance: '2.3 km',
        rating: 4.5,
        phone: '+234 123 456 7890',
        hours: '24/7 Emergency',
        services: ['Emergency', 'Surgery', 'ICU', 'Outpatient']
      },
      {
        id: '2',
        name: 'St. Mary\'s Medical Center',
        address: '456 Oak Avenue, Midtown',
        distance: '3.8 km',
        rating: 4.7,
        phone: '+234 098 765 4321',
        hours: 'Open 24 hours',
        services: ['Emergency', 'Maternity', 'Pediatrics', 'Lab']
      }
    ]

    const mockPharmacies: Location[] = [
      {
        id: '1',
        name: 'HealthPlus Pharmacy',
        address: '321 High Street, City Center',
        distance: '1.5 km',
        rating: 4.6,
        phone: '+234 444 555 6666',
        hours: '8:00 AM - 10:00 PM',
        services: ['Prescription', 'OTC', 'Home Delivery']
      },
      {
        id: '2',
        name: 'CareRite Drugstore',
        address: '654 Park Lane, East Side',
        distance: '2.9 km',
        rating: 4.4,
        phone: '+234 777 888 9999',
        hours: '24/7',
        services: ['Prescription', 'Medical Supplies', 'Consultation']
      }
    ]

    setLocations(searchType === 'hospital' ? mockHospitals : mockPharmacies)
  }

  // Handle search type change
  const handleSearchTypeChange = (type: 'hospital' | 'pharmacy') => {
    setSearchType(type)
    if (userLocation) {
      fetchNearbyLocations(userLocation.lat, userLocation.lon, type)
    } else {
      loadMockData()
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

  // Load mock data on mount
  useEffect(() => {
    loadMockData()
  }, [searchType])

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
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search hospitals, pharmacies by name or location..."
            className="pl-10 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

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
            {loading ? 'Searching...' : `${locations.length} ${searchType === 'hospital' ? 'Hospitals' : 'Pharmacies'} Near You`}
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-helix-primary" />
            </div>
          ) : (
          <div className="space-y-4">
            {locations
              .filter(location => 
                searchQuery === '' || 
                location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                location.address.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((location) => (
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

