'use client'

import { useState, useEffect } from 'react'
import { Calendar, MessageSquare, MapPin, Activity, Heart, AlertCircle, Menu, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { getDorraPatientId } from '@/lib/api/patient-mapping'
import { Appointment } from '@/lib/api/appointments'

interface PatientHomeProps {
  onNavigate?: (view: string) => void
  onMobileMenuToggle?: () => void
}

export default function PatientHome({ onNavigate, onMobileMenuToggle }: PatientHomeProps = {}) {
  const { userData, user } = useAuth()
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [dorraPatientId, setDorraPatientId] = useState<number | null>(null)
  const [nextAppointmentDate, setNextAppointmentDate] = useState<string>('Not scheduled')

  // Fetch Dorra patient ID and appointments
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Get Dorra patient ID
        const patientId = await getDorraPatientId(user.uid)
        setDorraPatientId(patientId)

        if (patientId) {
          // Fetch real appointments
          const response = await fetch(`/api/patients/${patientId}/appointments`)
          if (response.ok) {
            const data = await response.json()
            const appointments: Appointment[] = data.results || []
            
            // Filter upcoming appointments
            const now = new Date()
            const upcoming = appointments
              .filter(apt => new Date(apt.date) > now && apt.status === 'active')
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            
            setUpcomingAppointments(upcoming.slice(0, 2)) // Show only 2 most recent

            // Set next appointment date for the health card
            if (upcoming.length > 0) {
              const nextDate = new Date(upcoming[0].date)
              const today = new Date()
              const diffTime = nextDate.getTime() - today.getTime()
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
              
              const formattedDate = nextDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })
              
              if (diffDays === 0) {
                setNextAppointmentDate(`${formattedDate} (Today)`)
              } else if (diffDays === 1) {
                setNextAppointmentDate(`${formattedDate} (Tomorrow)`)
              } else {
                setNextAppointmentDate(`${formattedDate} (in ${diffDays} days)`)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const quickActions = [
    {
      icon: Calendar,
      title: 'Book Appointment',
      description: 'Schedule a visit with your doctor',
      color: 'bg-helix-primary/10 text-helix-primary border-helix-primary/20',
      view: 'appointments'
    },
    {
      icon: MessageSquare,
      title: 'Chat with Doctor',
      description: 'Get medical advice instantly',
      color: 'bg-helix-primary/10 text-helix-primary border-helix-primary/20',
      view: 'chat'
    },
    {
      icon: MapPin,
      title: 'Find Healthcare',
      description: 'Locate nearby hospitals & pharmacies',
      color: 'bg-helix-primary/10 text-helix-primary border-helix-primary/20',
      view: 'find-healthcare'
    },
    {
      icon: AlertCircle,
      title: 'Emergency Help',
      description: 'Step-by-step emergency guides',
      color: 'bg-red-50 text-red-600 border-red-200',
      view: null,
      isExternal: true
    }
  ]

  return (
    <div className="flex-1 bg-slate-50 h-full overflow-y-auto">
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

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Welcome Section */}
        <div className="bg-linear-to-r from-helix-primary to-helix-secondary rounded-xl p-4 md:p-6 text-white">
          <h1 className="text-xl md:text-2xl font-bold mb-2">
            Welcome back, {userData?.displayName || 'Patient'}!
          </h1>
          <p className="text-sm md:text-base text-white/90">
            Your health journey starts here. Access all your medical needs in one place.
          </p>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return action.isExternal ? (
                <a
                  key={index}
                  href="/actions"
                  className={`${action.color} border rounded-xl p-3 text-left hover:shadow-md transition-all block cursor-pointer`}
                >
                  <Icon className="w-6 h-6 mb-2" />
                  <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                  <p className="text-xs opacity-80">{action.description}</p>
                </a>
              ) : (
                <button
                  key={index}
                  onClick={() => onNavigate && action.view && onNavigate(action.view)}
                  className={`${action.color} border rounded-xl p-3 text-left hover:shadow-md transition-all cursor-pointer`}
                >
                  <Icon className="w-6 h-6 mb-2" />
                  <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                  <p className="text-xs opacity-80">{action.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Health Overview - Only Next Checkup (removed mock vitals) */}
        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {/* Next Checkup Card with calendar bar chart background */}
          <Card className="relative overflow-hidden rounded-xl bg-linear-to-br from-purple-50 to-white border-purple-100">
            <div className="absolute inset-0 opacity-25">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 400 200">
                {/* Bar chart representing appointment frequency - animated bars */}
                <rect x="20" y="80" width="30" height="100" fill="#8b5cf6" rx="4">
                  <animate attributeName="height" values="100;110;100" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="y" values="80;70;80" dur="2s" repeatCount="indefinite" />
                </rect>
                <rect x="70" y="60" width="30" height="120" fill="#7c3aed" rx="4" style={{animationDelay: '0.1s'}}>
                  <animate attributeName="height" values="120;130;120" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="y" values="60;50;60" dur="2s" repeatCount="indefinite" />
                </rect>
                <rect x="120" y="100" width="30" height="80" fill="#8b5cf6" rx="4" style={{animationDelay: '0.2s'}}>
                  <animate attributeName="height" values="80;90;80" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="y" values="100;90;100" dur="2s" repeatCount="indefinite" />
                </rect>
                <rect x="170" y="70" width="30" height="110" fill="#7c3aed" rx="4" style={{animationDelay: '0.3s'}}>
                  <animate attributeName="height" values="110;120;110" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="y" values="70;60;70" dur="2s" repeatCount="indefinite" />
                </rect>
                <rect x="220" y="40" width="30" height="140" fill="#8b5cf6" rx="4" opacity="0.9" style={{animationDelay: '0.4s'}}>
                  <animate attributeName="height" values="140;150;140" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="y" values="40;30;40" dur="2s" repeatCount="indefinite" />
                </rect>
                <rect x="270" y="90" width="30" height="90" fill="#7c3aed" rx="4" style={{animationDelay: '0.5s'}}>
                  <animate attributeName="height" values="90;100;90" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="y" values="90;80;90" dur="2s" repeatCount="indefinite" />
                </rect>
                <rect x="320" y="65" width="30" height="115" fill="#8b5cf6" rx="4" style={{animationDelay: '0.6s'}}>
                  <animate attributeName="height" values="115;125;115" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="y" values="65;55;65" dur="2s" repeatCount="indefinite" />
                </rect>
                <rect x="370" y="50" width="30" height="130" fill="#7c3aed" rx="4" style={{animationDelay: '0.7s'}}>
                  <animate attributeName="height" values="130;140;130" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="y" values="50;40;50" dur="2s" repeatCount="indefinite" />
                </rect>
                {/* Grid lines */}
                <line x1="0" y1="60" x2="400" y2="60" stroke="#c4b5fd" strokeWidth="0.5" opacity="0.3"/>
                <line x1="0" y1="100" x2="400" y2="100" stroke="#c4b5fd" strokeWidth="0.5" opacity="0.3"/>
                <line x1="0" y1="140" x2="400" y2="140" stroke="#c4b5fd" strokeWidth="0.5" opacity="0.3"/>
                <line x1="0" y1="180" x2="400" y2="180" stroke="#c4b5fd" strokeWidth="0.5" opacity="0.5"/>
              </svg>
            </div>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-slate-700">Next Checkup</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                <span className="text-2xl font-bold text-slate-900">
                  {loading ? '...' : nextAppointmentDate.split('(')[0].trim()}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 font-medium">
                {loading ? 'Loading...' : nextAppointmentDate.includes('(') ? nextAppointmentDate.match(/\((.*?)\)/)?.[1] || 'Not scheduled' : 'Not scheduled'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card className="rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled visits</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate && onNavigate('appointments')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-helix-primary" />
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => {
                  // Parse date string and extract time components directly to avoid timezone conversion
                  const parseAppointmentDateTime = (dateString: string) => {
                    // Handle ISO format: '2025-11-20T09:00:00Z' or '2025-11-20T09:00:00'
                    const dateTime = dateString.replace('Z', '') // Remove Z if present
                    const [datePart, timePart] = dateTime.split('T')
                    const [year, month, day] = datePart.split('-').map(Number)
                    const [hours, minutes] = timePart ? timePart.split(':').map(Number) : [0, 0]
                    
                    // Create date in local timezone (treat as local time, not UTC)
                    const localDate = new Date(year, month - 1, day, hours, minutes)
                    return localDate
                  }
                  
                  const appointmentDate = parseAppointmentDateTime(appointment.date)
                  const formattedDate = appointmentDate.toLocaleDateString()
                  const formattedTime = appointmentDate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true
                  })

                  return (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onNavigate && onNavigate('appointments')}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-helix-primary rounded-full flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{appointment.reason || 'Appointment'}</h4>
                          <p className="text-sm text-slate-600">{appointment.summary || 'General consultation'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">{formattedDate}</p>
                        <p className="text-sm text-slate-600">{formattedTime}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                          appointment.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500 mb-4">No upcoming appointments</p>
                <Button 
                  onClick={() => onNavigate && onNavigate('appointments')}
                  className="bg-helix-primary"
                >
                  Book Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

