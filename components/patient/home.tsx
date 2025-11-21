'use client'

import { useState, useEffect } from 'react'
import { Calendar, MessageSquare, MapPin, Activity, Heart, AlertCircle, Menu, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
              .slice(0, 2) // Show only 2 most recent
            
            setUpcomingAppointments(upcoming)
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
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search dashboard, appointments, health records..."
            className="pl-10 bg-white"
          />
        </div>

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
                  className={`${action.color} border rounded-xl p-3 text-left hover:shadow-md transition-all block`}
                >
                  <Icon className="w-6 h-6 mb-2" />
                  <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                  <p className="text-xs opacity-80">{action.description}</p>
                </a>
              ) : (
                <button
                  key={index}
                  onClick={() => onNavigate && action.view && onNavigate(action.view)}
                  className={`${action.color} border rounded-xl p-3 text-left hover:shadow-md transition-all`}
                >
                  <Icon className="w-6 h-6 mb-2" />
                  <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                  <p className="text-xs opacity-80">{action.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Health Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {/* Heart Rate Card with ECG-style background */}
          <Card className="relative overflow-hidden rounded-xl bg-linear-to-br from-red-50 to-white border-red-100 hover:shadow-2xl hover:scale-105 hover:border-red-300 transition-all duration-500 cursor-pointer group">
            <div className="absolute inset-0 opacity-20 group-hover:opacity-35 transition-opacity duration-500">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 400 200" className="group-hover:animate-pulse">
                {/* ECG heartbeat pattern - more prominent */}
                <path d="M0,100 L50,100 L60,80 L70,120 L75,60 L80,140 L85,100 L150,100 L160,80 L170,120 L175,60 L180,140 L185,100 L250,100 L260,80 L270,120 L275,60 L280,140 L285,100 L350,100 L360,80 L370,120 L375,60 L380,140 L385,100 L400,100" 
                      stroke="#ef4444" 
                      strokeWidth="3" 
                      fill="none" 
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="group-hover:animate-pulse">
                  <animate attributeName="stroke-dasharray" from="0,1000" to="1000,0" dur="2s" repeatCount="indefinite" className="group-hover:block hidden" />
                </path>
                <path d="M0,120 L50,120 L60,100 L70,140 L75,80 L80,160 L85,120 L150,120 L160,100 L170,140 L175,80 L180,160 L185,120 L250,120 L260,100 L270,140 L275,80 L280,160 L285,120 L350,120 L360,100 L370,140 L375,80 L380,160 L385,120 L400,120" 
                      stroke="#f87171" 
                      strokeWidth="2" 
                      fill="none" 
                      opacity="0.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"/>
                {/* Grid lines */}
                <line x1="0" y1="50" x2="400" y2="50" stroke="#fecaca" strokeWidth="0.5" opacity="0.3"/>
                <line x1="0" y1="100" x2="400" y2="100" stroke="#fecaca" strokeWidth="0.5" opacity="0.3"/>
                <line x1="0" y1="150" x2="400" y2="150" stroke="#fecaca" strokeWidth="0.5" opacity="0.3"/>
              </svg>
            </div>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-slate-700 group-hover:text-red-600 transition-colors duration-300">Heart Rate</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500 group-hover:scale-125 group-hover:animate-pulse transition-transform duration-300" />
                <span className="text-3xl font-bold text-slate-900 group-hover:text-red-600 transition-colors duration-300">72</span>
                <span className="text-sm text-slate-600">bpm</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 font-medium group-hover:text-red-700 transition-colors duration-300">Normal range</p>
            </CardContent>
          </Card>

          {/* Blood Pressure Card with line chart background */}
          <Card className="relative overflow-hidden rounded-xl bg-linear-to-br from-blue-50 to-white border-blue-100 hover:shadow-2xl hover:scale-105 hover:border-blue-300 transition-all duration-500 cursor-pointer group">
            <div className="absolute inset-0 opacity-25 group-hover:opacity-40 transition-opacity duration-500">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 400 200">
                {/* Line chart representing blood pressure readings */}
                <defs>
                  <linearGradient id="pressureGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0D4C73" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#0D4C73" stopOpacity="0.05"/>
                  </linearGradient>
                </defs>
                {/* Systolic line (120) - animated wave */}
                <path d="M0,80 L40,75 L80,70 L120,75 L160,72 L200,74 L240,71 L280,73 L320,70 L360,72 L400,70" 
                      stroke="#0D4C73" 
                      strokeWidth="3" 
                      fill="none" 
                      strokeLinecap="round"
                      className="group-hover:animate-pulse">
                  <animate attributeName="d" 
                    values="M0,80 L40,75 L80,70 L120,75 L160,72 L200,74 L240,71 L280,73 L320,70 L360,72 L400,70;
                            M0,82 L40,77 L80,72 L120,77 L160,74 L200,76 L240,73 L280,75 L320,72 L360,74 L400,72;
                            M0,80 L40,75 L80,70 L120,75 L160,72 L200,74 L240,71 L280,73 L320,70 L360,72 L400,70"
                    dur="3s" 
                    repeatCount="indefinite" 
                    className="group-hover:block hidden" />
                </path>
                {/* Diastolic line (80) - animated wave */}
                <path d="M0,120 L40,118 L80,115 L120,117 L160,116 L200,118 L240,115 L280,117 L320,114 L360,116 L400,115" 
                      stroke="#1A6FA1" 
                      strokeWidth="3" 
                      fill="none" 
                      strokeLinecap="round">
                  <animate attributeName="d" 
                    values="M0,120 L40,118 L80,115 L120,117 L160,116 L200,118 L240,115 L280,117 L320,114 L360,116 L400,115;
                            M0,122 L40,120 L80,117 L120,119 L160,118 L200,120 L240,117 L280,119 L320,116 L360,118 L400,117;
                            M0,120 L40,118 L80,115 L120,117 L160,116 L200,118 L240,115 L280,117 L320,114 L360,116 L400,115"
                    dur="3s" 
                    repeatCount="indefinite" 
                    className="group-hover:block hidden" />
                </path>
                {/* Fill area */}
                <path d="M0,80 L40,75 L80,70 L120,75 L160,72 L200,74 L240,71 L280,73 L320,70 L360,72 L400,70 L400,200 L0,200 Z" 
                      fill="url(#pressureGradient)"
                      className="group-hover:animate-pulse"/>
                {/* Grid */}
                <line x1="0" y1="60" x2="400" y2="60" stroke="#93c5fd" strokeWidth="0.5" opacity="0.3"/>
                <line x1="0" y1="100" x2="400" y2="100" stroke="#93c5fd" strokeWidth="0.5" opacity="0.3"/>
                <line x1="0" y1="140" x2="400" y2="140" stroke="#93c5fd" strokeWidth="0.5" opacity="0.3"/>
              </svg>
            </div>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-slate-700 group-hover:text-helix-primary transition-colors duration-300">Blood Pressure</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-helix-primary group-hover:scale-125 transition-transform duration-300" />
                <span className="text-3xl font-bold text-slate-900 group-hover:text-helix-primary transition-colors duration-300">120/80</span>
                <span className="text-sm text-slate-600">mmHg</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 font-medium group-hover:text-helix-secondary transition-colors duration-300">Optimal</p>
            </CardContent>
          </Card>

          {/* Next Checkup Card with calendar bar chart background */}
          <Card className="relative overflow-hidden rounded-xl bg-linear-to-br from-purple-50 to-white border-purple-100 hover:shadow-2xl hover:scale-105 hover:border-purple-300 transition-all duration-500 cursor-pointer group">
            <div className="absolute inset-0 opacity-25 group-hover:opacity-40 transition-opacity duration-500">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 400 200">
                {/* Bar chart representing appointment frequency - animated bars */}
                <rect x="20" y="80" width="30" height="100" fill="#8b5cf6" rx="4" className="group-hover:animate-pulse">
                  <animate attributeName="height" values="100;110;100" dur="2s" repeatCount="indefinite" className="group-hover:block hidden" />
                  <animate attributeName="y" values="80;70;80" dur="2s" repeatCount="indefinite" className="group-hover:block hidden" />
                </rect>
                <rect x="70" y="60" width="30" height="120" fill="#7c3aed" rx="4" className="group-hover:animate-pulse" style={{animationDelay: '0.1s'}}>
                  <animate attributeName="height" values="120;130;120" dur="2s" repeatCount="indefinite" className="group-hover:block hidden" />
                  <animate attributeName="y" values="60;50;60" dur="2s" repeatCount="indefinite" className="group-hover:block hidden" />
                </rect>
                <rect x="120" y="100" width="30" height="80" fill="#8b5cf6" rx="4" className="group-hover:animate-pulse" style={{animationDelay: '0.2s'}}>
                  <animate attributeName="height" values="80;90;80" dur="2s" repeatCount="indefinite" className="group-hover:block hidden" />
                  <animate attributeName="y" values="100;90;100" dur="2s" repeatCount="indefinite" className="group-hover:block hidden" />
                </rect>
                <rect x="170" y="70" width="30" height="110" fill="#7c3aed" rx="4" className="group-hover:animate-pulse" style={{animationDelay: '0.3s'}}>
                  <animate attributeName="height" values="110;120;110" dur="2s" repeatCount="indefinite" className="group-hover:block hidden" />
                  <animate attributeName="y" values="70;60;70" dur="2s" repeatCount="indefinite" className="group-hover:block hidden" />
                </rect>
                <rect x="220" y="40" width="30" height="140" fill="#8b5cf6" rx="4" opacity="0.9" className="group-hover:animate-pulse" style={{animationDelay: '0.4s'}}>
                  <animate attributeName="height" values="140;150;140" dur="2s" repeatCount="indefinite" className="group-hover:block hidden" />
                  <animate attributeName="y" values="40;30;40" dur="2s" repeatCount="indefinite" className="group-hover:block hidden" />
                </rect>
                <rect x="270" y="90" width="30" height="90" fill="#7c3aed" rx="4" className="group-hover:animate-pulse" style={{animationDelay: '0.5s'}}>
                  <animate attributeName="height" values="90;100;90" dur="2s" repeatCount="indefinite" className="group-hover:block hidden" />
                  <animate attributeName="y" values="90;80;90" dur="2s" repeatCount="indefinite" className="group-hover:block hidden" />
                </rect>
                <rect x="320" y="65" width="30" height="115" fill="#8b5cf6" rx="4" className="group-hover:animate-pulse" style={{animationDelay: '0.6s'}}>
                  <animate attributeName="height" values="115;125;115" dur="2s" repeatCount="indefinite" className="group-hover:block hidden" />
                  <animate attributeName="y" values="65;55;65" dur="2s" repeatCount="indefinite" className="group-hover:block hidden" />
                </rect>
                <rect x="370" y="50" width="30" height="130" fill="#7c3aed" rx="4" className="group-hover:animate-pulse" style={{animationDelay: '0.7s'}}>
                  <animate attributeName="height" values="130;140;130" dur="2s" repeatCount="indefinite" className="group-hover:block hidden" />
                  <animate attributeName="y" values="50;40;50" dur="2s" repeatCount="indefinite" className="group-hover:block hidden" />
                </rect>
                {/* Grid lines */}
                <line x1="0" y1="60" x2="400" y2="60" stroke="#c4b5fd" strokeWidth="0.5" opacity="0.3"/>
                <line x1="0" y1="100" x2="400" y2="100" stroke="#c4b5fd" strokeWidth="0.5" opacity="0.3"/>
                <line x1="0" y1="140" x2="400" y2="140" stroke="#c4b5fd" strokeWidth="0.5" opacity="0.3"/>
                <line x1="0" y1="180" x2="400" y2="180" stroke="#c4b5fd" strokeWidth="0.5" opacity="0.5"/>
              </svg>
            </div>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-slate-700 group-hover:text-purple-600 transition-colors duration-300">Next Checkup</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600 group-hover:scale-125 transition-transform duration-300" />
                <span className="text-2xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors duration-300">Nov 22</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 font-medium group-hover:text-purple-700 transition-colors duration-300">In 2 days</p>
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
                  const appointmentDate = new Date(appointment.date)
                  const formattedDate = appointmentDate.toLocaleDateString()
                  const formattedTime = appointmentDate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
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

