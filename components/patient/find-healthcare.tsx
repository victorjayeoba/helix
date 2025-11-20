'use client'

import { useState } from 'react'
import { MapPin, Navigation, Phone, Clock, Star, Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FindHealthcareProps {
  onMobileMenuToggle?: () => void
}

export default function FindHealthcare({ onMobileMenuToggle }: FindHealthcareProps = {}) {
  const [searchType, setSearchType] = useState<'hospital' | 'pharmacy'>('hospital')

  const hospitals = [
    {
      id: 1,
      name: 'City General Hospital',
      address: '123 Main Street, Downtown',
      distance: '2.3 km',
      rating: 4.5,
      phone: '+234 123 456 7890',
      hours: '24/7 Emergency',
      services: ['Emergency', 'Surgery', 'ICU', 'Outpatient']
    },
    {
      id: 2,
      name: 'St. Mary\'s Medical Center',
      address: '456 Oak Avenue, Midtown',
      distance: '3.8 km',
      rating: 4.7,
      phone: '+234 098 765 4321',
      hours: 'Open 24 hours',
      services: ['Emergency', 'Maternity', 'Pediatrics', 'Lab']
    },
    {
      id: 3,
      name: 'Wellness Clinic',
      address: '789 Elm Road, Suburb',
      distance: '5.1 km',
      rating: 4.2,
      phone: '+234 111 222 3333',
      hours: '8:00 AM - 8:00 PM',
      services: ['General Practice', 'Vaccinations', 'Checkups']
    }
  ]

  const pharmacies = [
    {
      id: 1,
      name: 'HealthPlus Pharmacy',
      address: '321 High Street, City Center',
      distance: '1.5 km',
      rating: 4.6,
      phone: '+234 444 555 6666',
      hours: '8:00 AM - 10:00 PM',
      services: ['Prescription', 'OTC', 'Home Delivery']
    },
    {
      id: 2,
      name: 'CareRite Drugstore',
      address: '654 Park Lane, East Side',
      distance: '2.9 km',
      rating: 4.4,
      phone: '+234 777 888 9999',
      hours: '24/7',
      services: ['Prescription', 'Medical Supplies', 'Consultation']
    }
  ]

  const locations = searchType === 'hospital' ? hospitals : pharmacies

  return (
    <div className="flex-1 bg-white h-full overflow-y-auto">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-helix-primary">Find Healthcare</h1>
        <button
          onClick={onMobileMenuToggle}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <Menu className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      {/* Header */}
      <div className="bg-helix-primary text-white px-4 md:px-6 py-4">
        <h1 className="text-xl md:text-2xl font-semibold">Find Healthcare Facilities</h1>
        <p className="text-sm text-white/80 mt-1">Locate nearby hospitals and pharmacies</p>
      </div>

      <div className="p-4 md:p-6">
        {/* Search and Filter */}
        <div className="mb-4 md:mb-6 space-y-3 md:space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name or location..."
                className="pl-10"
              />
            </div>
            <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hospital">Hospitals</SelectItem>
                <SelectItem value="pharmacy">Pharmacies</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full bg-helix-primary">
            <Navigation className="w-4 h-4 mr-2" />
            Use My Current Location
          </Button>
        </div>

        {/* Results */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {locations.length} {searchType === 'hospital' ? 'Hospitals' : 'Pharmacies'} Near You
          </h2>

          <div className="space-y-4">
            {locations.map((location) => (
              <Card key={location.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {location.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-slate-900">{location.rating}</span>
                        </div>
                        <span className="text-sm text-slate-500">•</span>
                        <span className="text-sm text-slate-600">{location.distance} away</span>
                      </div>
                    </div>
                    <Button className="bg-helix-primary">
                      Get Directions
                    </Button>
                  </div>

                  <div className="grid gap-3 text-sm">
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{location.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{location.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4 flex-shrink-0" />
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
        </div>
      </div>
    </div>
  )
}

