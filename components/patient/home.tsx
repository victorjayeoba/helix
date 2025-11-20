'use client'

import { Calendar, MessageSquare, MapPin, Activity, Heart, AlertCircle, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

interface PatientHomeProps {
  onNavigate?: (view: string) => void
  onMobileMenuToggle?: () => void
}

export default function PatientHome({ onNavigate, onMobileMenuToggle }: PatientHomeProps = {}) {
  const { userData } = useAuth()

  const quickActions = [
    {
      icon: Calendar,
      title: 'Book Appointment',
      description: 'Schedule a visit with your doctor',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      view: 'appointments'
    },
    {
      icon: MessageSquare,
      title: 'Chat with Doctor',
      description: 'Get medical advice instantly',
      color: 'bg-green-50 text-green-600 border-green-200',
      view: 'chat'
    },
    {
      icon: MapPin,
      title: 'Find Healthcare',
      description: 'Locate nearby hospitals & pharmacies',
      color: 'bg-purple-50 text-purple-600 border-purple-200',
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

  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Dr. Sarah Johnson',
      specialty: 'General Practitioner',
      date: '2025-11-22',
      time: '10:00 AM',
      status: 'confirmed'
    },
    {
      id: 2,
      doctor: 'Dr. Michael Chen',
      specialty: 'Cardiologist',
      date: '2025-11-25',
      time: '2:30 PM',
      status: 'pending'
    }
  ]

  return (
    <div className="flex-1 bg-slate-50 h-full overflow-y-auto">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-helix-primary">HELIX</h1>
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
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return action.isExternal ? (
                <a
                  key={index}
                  href="/actions"
                  className={`${action.color} border rounded-xl p-4 text-left hover:shadow-md transition-all block`}
                >
                  <Icon className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm opacity-80">{action.description}</p>
                </a>
              ) : (
                <button
                  key={index}
                  onClick={() => onNavigate && action.view && onNavigate(action.view)}
                  className={`${action.color} border rounded-xl p-3 md:p-4 text-left hover:shadow-md transition-all`}
                >
                  <Icon className="w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-3" />
                  <h3 className="font-semibold text-sm md:text-base mb-1">{action.title}</h3>
                  <p className="text-xs md:text-sm opacity-80 hidden sm:block">{action.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Health Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Heart Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-2xl font-bold text-slate-900">72</span>
                <span className="text-sm text-slate-500">bpm</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Normal range</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Blood Pressure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold text-slate-900">120/80</span>
                <span className="text-sm text-slate-500">mmHg</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Optimal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Next Checkup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                <span className="text-xl font-bold text-slate-900">Nov 22</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">In 2 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card>
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
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-helix-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {appointment.doctor.split(' ')[1][0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{appointment.doctor}</h4>
                      <p className="text-sm text-slate-600">{appointment.specialty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{appointment.date}</p>
                    <p className="text-sm text-slate-600">{appointment.time}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

