'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, MapPin, Plus, Search, Filter, Menu, Grid3x3, List, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { getDorraPatientId } from '@/lib/api/patient-mapping'
import { toast } from 'sonner'
import { Appointment } from '@/lib/api/appointments'

interface PatientAppointmentsProps {
  onMobileMenuToggle?: () => void
}

type ViewMode = 'list' | 'grid'

interface AppointmentGroup {
  upcoming: Appointment[]
  past: Appointment[]
  cancelled: Appointment[]
}

export default function PatientAppointments({ onMobileMenuToggle }: PatientAppointmentsProps = {}) {
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [appointments, setAppointments] = useState<AppointmentGroup>({
    upcoming: [],
    past: [],
    cancelled: []
  })
  const [loading, setLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [dorraPatientId, setDorraPatientId] = useState<number | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  
  // Booking prompt state
  const [bookingPrompt, setBookingPrompt] = useState('')

  // Reschedule form state
  const [rescheduleForm, setRescheduleForm] = useState({
    date: '',
    time: ''
  })

  // Fetch Dorra patient ID on mount
  useEffect(() => {
    const fetchPatientId = async () => {
      if (user) {
        const patientId = await getDorraPatientId(user.uid)
        setDorraPatientId(patientId)
      }
    }
    fetchPatientId()
  }, [user])

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user || !dorraPatientId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/patients/${dorraPatientId}/appointments`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch appointments')
        }

        const data = await response.json()
        const appointmentsList: Appointment[] = data.results || []
        
        // Categorize appointments
        const now = new Date()
        const categorized: AppointmentGroup = {
          upcoming: appointmentsList.filter(apt => 
            new Date(apt.date) > now && apt.status === 'active'
          ),
          past: appointmentsList.filter(apt => 
            apt.status === 'completed' || new Date(apt.date) < now
          ),
          cancelled: []
        }
        
        setAppointments(categorized)
      } catch (error) {
        console.error('Error fetching appointments:', error)
        toast.error('Failed to load appointments')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user, dorraPatientId])

  // Handle appointment booking
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!dorraPatientId) {
      toast.error('Patient profile not found. Please complete your profile.')
      return
    }

    if (!bookingPrompt.trim()) {
      toast.error('Please provide appointment details')
      return
    }

    setIsBooking(true)

    try {
      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: dorraPatientId,
          prompt: bookingPrompt.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Appointment requested successfully! 🎉')
        setBookingDialogOpen(false)
        // Reset prompt
        setBookingPrompt('')
        
        // Refresh appointments
        const fetchAppointments = async () => {
          if (!user || !dorraPatientId) return

          try {
            setLoading(true)
            const response = await fetch(`/api/patients/${dorraPatientId}/appointments`)
            
            if (!response.ok) {
              throw new Error('Failed to fetch appointments')
            }

            const data = await response.json()
            const appointmentsList: Appointment[] = data.results || []
            
            // Categorize appointments
            const now = new Date()
            const categorized: AppointmentGroup = {
              upcoming: appointmentsList.filter(apt => 
                new Date(apt.date) > now && apt.status === 'active'
              ),
              past: appointmentsList.filter(apt => 
                apt.status === 'completed' || new Date(apt.date) < now
              ),
              cancelled: []
            }
            
            setAppointments(categorized)
          } catch (error) {
            console.error('Error fetching appointments:', error)
            toast.error('Failed to load appointments')
          } finally {
            setLoading(false)
          }
        }
        fetchAppointments()

        // Create notification
        if (user) {
          try {
            const { createNotification } = await import('@/lib/firebase/notifications')
            await createNotification({
              userId: user.uid,
              type: 'appointment',
              title: 'Appointment Booked',
              message: 'Your appointment request has been submitted successfully',
              read: false
            })
          } catch (notifError) {
            console.error('Failed to create notification:', notifError)
          }
        }
      } else {
        throw new Error(data.message || 'Failed to book appointment')
      }
    } catch (error: any) {
      console.error('Error booking appointment:', error)
      toast.error(error.message || 'Failed to book appointment')
    } finally {
      setIsBooking(false)
    }
  }

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    const appointmentDate = new Date(appointment.date)
    setRescheduleForm({
      date: appointmentDate.toISOString().split('T')[0],
      time: appointmentDate.toTimeString().slice(0, 5)
    })
    setRescheduleDialogOpen(true)
  }

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedAppointment) return

    if (!rescheduleForm.date || !rescheduleForm.time) {
      toast.error('Please select both date and time')
      return
    }

    setIsRescheduling(true)

    try {
      const response = await fetch(`/api/appointments/${selectedAppointment.id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rescheduleForm)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Appointment rescheduled successfully!')
        setRescheduleDialogOpen(false)
        setSelectedAppointment(null)
        fetchAppointments()

        // Create notification
        if (user) {
          try {
            const { createNotification } = await import('@/lib/firebase/notifications')
            await createNotification({
              userId: user.uid,
              type: 'appointment',
              title: 'Appointment Rescheduled',
              message: `Your appointment has been rescheduled to ${rescheduleForm.date} at ${rescheduleForm.time}`,
              read: false
            })
          } catch (notifError) {
            console.error('Failed to create notification:', notifError)
          }
        }
      } else {
        toast.error(data.message || 'Failed to reschedule appointment')
      }
    } catch (error) {
      console.error('Reschedule error:', error)
      toast.error('An error occurred while rescheduling')
    } finally {
      setIsRescheduling(false)
    }
  }

  const handleCancel = async (appointment: Appointment) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to cancel appointment')
      }

      toast.success('Appointment cancelled successfully')
      
      // Refresh appointments by re-fetching
      setLoading(true)
      try {
        const response = await fetch(`/api/patients/${dorraPatientId}/appointments`)
        if (!response.ok) throw new Error('Failed to fetch appointments')
        const data = await response.json()
        const appointmentsList: Appointment[] = data.results || []
        
        const now = new Date()
        const categorized: AppointmentGroup = {
          upcoming: appointmentsList.filter(apt => 
            new Date(apt.date) > now && apt.status === 'active'
          ),
          past: appointmentsList.filter(apt => 
            apt.status === 'completed' || new Date(apt.date) < now
          ),
          cancelled: []
        }
        
        setAppointments(categorized)
      } catch (error) {
        console.error('Error fetching appointments:', error)
        toast.error('Failed to refresh appointments')
      } finally {
        setLoading(false)
      }

      // Create notification
      if (user) {
        try {
          const { createNotification } = await import('@/lib/firebase/notifications')
          await createNotification({
            userId: user.uid,
            type: 'alert',
            title: 'Appointment Cancelled',
            message: `Your appointment has been cancelled`,
            read: false
          })
        } catch (notifError) {
          console.error('Failed to create notification:', notifError)
        }
      }
    } catch (error: any) {
      console.error('Cancel error:', error)
      toast.error(error.message || 'An error occurred while cancelling')
    }
  }

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

      <div className="p-4 md:p-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search appointments by doctor, date, or specialty..."
            className="pl-10 bg-white"
          />
        </div>

        {/* Header */}
        <div className="bg-helix-primary text-white p-4 md:p-6 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">My Appointments</h1>
            <p className="text-sm text-white/80 mt-1">Manage your healthcare visits</p>
          </div>
          <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/10 border-white/20 text-white hover:bg-white/20 border-2">
                <Plus className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Book New Appointment</DialogTitle>
                <DialogDescription>
                  Describe your appointment request. Include date, time, reason, and any other relevant details.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBookAppointment} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Appointment Details *</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Example: Schedule a virtual appointment with a General Practitioner on December 25th, 2024 at 2:30 PM for a regular checkup. I've been experiencing mild headaches for the past week."
                    rows={8}
                    value={bookingPrompt}
                    onChange={(e) => setBookingPrompt(e.target.value)}
                    className="resize-none"
                  />
                  <p className="text-xs text-slate-500">
                    <strong>Template:</strong> Schedule a [virtual/in-person] appointment with [specialty/doctor name] on [date] at [time] for [reason]. [Additional details about symptoms, concerns, or questions].
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Example prompts:</p>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    <li>"Schedule a virtual appointment with a Cardiologist on January 15th, 2025 at 10:00 AM for chest pain consultation."</li>
                    <li>"Book an in-person appointment with Dr. Smith on December 20th, 2024 at 3:00 PM for a follow-up visit. I need to discuss my test results."</li>
                    <li>"Schedule a virtual appointment for General Practitioner on January 5th, 2025 at 2:30 PM for prescription refill. I'm running low on my blood pressure medication."</li>
                  </ul>
                </div>

                <Button type="submit" className="w-full bg-helix-primary" disabled={isBooking || !bookingPrompt.trim()}>
                  {isBooking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Filter and View Options */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 mb-4 md:mb-6 justify-end">
          <div className="flex gap-2">
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-helix-primary text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-helix-primary text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
                title="Grid view"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 mb-4 md:mb-6 overflow-x-auto">
          <button
            onClick={() => setSelectedTab('upcoming')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'upcoming'
                ? 'border-helix-primary text-helix-primary'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming ({appointments.upcoming.length})
          </button>
          <button
            onClick={() => setSelectedTab('past')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'past'
                ? 'border-helix-primary text-helix-primary'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Past ({appointments.past.length})
          </button>
          <button
            onClick={() => setSelectedTab('cancelled')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'cancelled'
                ? 'border-helix-primary text-helix-primary'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Cancelled ({appointments.cancelled.length})
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-helix-primary" />
          </div>
        ) : (
          <>
        {/* Appointments List/Grid */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
          {appointments[selectedTab].length === 0 ? (
            <Card className={`rounded-xl ${viewMode === 'grid' ? 'md:col-span-2' : ''}`}>
              <CardContent className="py-12">
                <div className="text-center text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No {selectedTab} appointments</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            appointments[selectedTab].map((appointment) => {
              const appointmentDate = new Date(appointment.date)
              const formattedDate = appointmentDate.toLocaleDateString()
              const formattedTime = appointmentDate.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
              
              return (
              <Card key={appointment.id} className="rounded-xl hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  {viewMode === 'list' ? (
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-helix-primary rounded-full flex items-center justify-center shrink-0">
                          <User className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-slate-900 mb-1">
                            Appointment
                          </h3>
                          <p className="text-sm text-slate-600 mb-3">{appointment.reason || 'General consultation'}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar className="w-4 h-4" />
                              <span>{formattedDate}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Clock className="w-4 h-4" />
                              <span>{formattedTime}</span>
                            </div>
                          </div>

                          {appointment.summary && (
                            <div className="mt-3">
                              <span className="text-sm text-slate-600">Summary: </span>
                              <span className="text-sm text-slate-900">{appointment.summary}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <span className={`px-3 py-1 rounded text-xs font-medium ${
                          appointment.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : appointment.status === 'completed'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>

                        {selectedTab === 'upcoming' && (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleReschedule(appointment)}
                            >
                              Reschedule
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleCancel(appointment)}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="w-14 h-14 bg-helix-primary rounded-full flex items-center justify-center shrink-0">
                          <User className="w-7 h-7 text-white" />
                        </div>
                        <span className={`px-3 py-1 rounded text-xs font-medium ${
                          appointment.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : appointment.status === 'completed'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900 mb-1">
                          Appointment
                        </h3>
                        <p className="text-sm text-slate-600 mb-3">{appointment.reason || 'General consultation'}</p>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span>{formattedTime}</span>
                        </div>
                      </div>

                      {appointment.summary && (
                        <div className="pt-2">
                          <span className="text-xs text-slate-600">Summary: </span>
                          <span className="text-sm text-slate-900">{appointment.summary}</span>
                        </div>
                      )}

                      {selectedTab === 'upcoming' && (
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleReschedule(appointment)}
                          >
                            Reschedule
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-red-600 hover:text-red-700"
                            onClick={() => handleCancel(appointment)}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )})
          )}
        </div>
          </>
        )}
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select a new date and time for your appointment
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRescheduleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reschedule-date">Date *</Label>
                <Input 
                  id="reschedule-date" 
                  type="date"
                  value={rescheduleForm.date}
                  onChange={(e) => setRescheduleForm({...rescheduleForm, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reschedule-time">Time *</Label>
                <Input 
                  id="reschedule-time" 
                  type="time"
                  value={rescheduleForm.time}
                  onChange={(e) => setRescheduleForm({...rescheduleForm, time: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setRescheduleDialogOpen(false)}
                disabled={isRescheduling}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-helix-primary" 
                disabled={isRescheduling}
              >
                {isRescheduling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rescheduling...
                  </>
                ) : (
                  'Confirm'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

