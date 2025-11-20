'use client'

import { useState, useEffect } from 'react'
import { Search, Home, AlertCircle, MapPin, Calendar, Phone, Heart, Stethoscope, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isEmergency, setIsEmergency] = useState(false)

  // Check if URL suggests an emergency
  useEffect(() => {
    const emergencyKeywords = ['emergency', 'urgent', 'help', 'critical', '911', 'ambulance']
    const currentPath = window.location.pathname.toLowerCase()
    const hasEmergencyKeyword = emergencyKeywords.some(keyword => currentPath.includes(keyword))
    setIsEmergency(hasEmergencyKeyword)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const quickLinks = [
    {
      icon: AlertCircle,
      title: 'Emergency Actions',
      description: 'Life-saving guides for CPR, choking, bleeding & more',
      href: '/actions',
      color: 'bg-red-50 border-red-200 hover:bg-red-100',
      iconColor: 'text-red-600'
    },
    {
      icon: MapPin,
      title: 'Find Hospital',
      description: 'Locate nearest emergency services',
      href: '/patient-dashboard',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      icon: Calendar,
      title: 'Book Appointment',
      description: 'Schedule a visit with a doctor',
      href: '/patient-dashboard',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      icon: Stethoscope,
      title: 'Chat with Doctor',
      description: 'Get medical advice instantly',
      href: '/patient-dashboard',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ]

  const emergencyNumbers = [
    { country: 'Universal', number: '911', description: 'Most countries' },
    { country: 'UK', number: '999', description: 'United Kingdom' },
    { country: 'EU', number: '112', description: 'European Union' },
    { country: 'Nigeria', number: '112 / 767', description: 'Emergency services' }
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Emergency Alert - Only show if URL suggests emergency */}
        {isEmergency && (
          <Card className="mb-6 border-2 border-red-500 bg-red-50 shadow-lg animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-900 mb-2">
                    🚨 Is This an Emergency?
                  </h3>
                  <p className="text-red-800 mb-4">
                    If you or someone else is experiencing a life-threatening emergency, 
                    <strong> call emergency services immediately!</strong>
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {emergencyNumbers.map((item, idx) => (
                      <a
                        key={idx}
                        href={`tel:${item.number.replace(/\s/g, '')}`}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-bold text-center transition"
                      >
                        {item.number}
                        <div className="text-xs opacity-90">{item.country}</div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main 404 Content */}
        <div className="text-center mb-8">
          {/* Animated Medical Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 bg-helix-primary/10 rounded-full flex items-center justify-center animate-pulse">
                <Heart className="w-16 h-16 text-helix-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">404</span>
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-slate-600 mb-2">
            We couldn't find the page you're looking for.
          </p>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            Don't worry - if you need medical help, we're here for you. 
            Use the options below to find what you need quickly.
          </p>
        </div>

        {/* Search Box */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="What are you looking for? (e.g., 'book appointment', 'CPR guide', 'find hospital')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button type="submit" className="h-12 px-6 bg-helix-primary hover:bg-helix-secondary">
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Access Links */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickLinks.map((link, idx) => {
              const Icon = link.icon
              return (
                <Link key={idx} href={link.href}>
                  <Card className={`${link.color} border-2 transition-all hover:shadow-lg cursor-pointer`}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                          <Icon className={`w-6 h-6 ${link.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                            {link.title}
                            <ArrowRight className="w-4 h-4" />
                          </h3>
                          <p className="text-sm text-slate-600">{link.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Common Pages */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Common Pages</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/" className="text-center p-3 hover:bg-slate-50 rounded-lg transition">
                <Home className="w-6 h-6 mx-auto mb-2 text-helix-primary" />
                <span className="text-sm text-slate-700">Home</span>
              </Link>
              <Link href="/actions" className="text-center p-3 hover:bg-slate-50 rounded-lg transition">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-600" />
                <span className="text-sm text-slate-700">Emergency</span>
              </Link>
              <Link href="/patient-dashboard" className="text-center p-3 hover:bg-slate-50 rounded-lg transition">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <span className="text-sm text-slate-700">Dashboard</span>
              </Link>
              <Link href="/dashboard" className="text-center p-3 hover:bg-slate-50 rounded-lg transition">
                <Stethoscope className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <span className="text-sm text-slate-700">Doctors</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-slate-500">
            Still can't find what you're looking for?{' '}
            <Link href="/" className="text-helix-primary hover:underline font-medium">
              Go to homepage
            </Link>{' '}
            or{' '}
            <Link href="/actions" className="text-red-600 hover:underline font-medium">
              view emergency guides
            </Link>
          </p>
          <p className="text-xs text-slate-400 mt-3">
            Your health and safety are our priority. We're here to help 24/7.
          </p>
        </div>
      </div>
    </div>
  )
}

