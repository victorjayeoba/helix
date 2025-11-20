'use client'

import { useState } from 'react'
import { Calendar, Clock, User, MapPin, Plus, Search, Filter, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface PatientAppointmentsProps {
  onMobileMenuToggle?: () => void
}

export default function PatientAppointments({ onMobileMenuToggle }: PatientAppointmentsProps = {}) {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)

  const appointments = {
    upcoming: [
      {
        id: 1,
        doctor: 'Dr. Sarah Johnson',
        specialty: 'General Practitioner',
        date: '2025-11-22',
        time: '10:00 AM',
        location: 'Main Hospital, Room 203',
        status: 'confirmed',
        reason: 'Regular checkup'
      },
      {
        id: 2,
        doctor: 'Dr. Michael Chen',
        specialty: 'Cardiologist',
        date: '2025-11-25',
        time: '2:30 PM',
        location: 'Cardiology Center, 3rd Floor',
        status: 'pending',
        reason: 'Follow-up consultation'
      }
    ],
    past: [
      {
        id: 3,
        doctor: 'Dr. Emily Brown',
        specialty: 'Dermatologist',
        date: '2025-11-10',
        time: '11:00 AM',
        location: 'Skin Care Clinic',
        status: 'completed',
        reason: 'Skin consultation'
      }
    ],
    cancelled: []
  }

  return (
    <div className="flex-1 bg-white h-full overflow-y-auto">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-helix-primary">Appointments</h1>
        <button
          onClick={onMobileMenuToggle}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <Menu className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      {/* Header */}
      <div className="bg-helix-primary text-white px-4 md:px-6 py-4 md:py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">My Appointments</h1>
            <p className="text-sm text-white/80 mt-1">Manage your healthcare visits</p>
          </div>
          <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-helix-primary hover:bg-slate-100">
                <Plus className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Book New Appointment</DialogTitle>
                <DialogDescription>
                  Fill in the details to schedule your appointment
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Practitioner</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="dermatology">Dermatology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctor">Preferred Doctor (Optional)</Label>
                  <Input id="doctor" placeholder="Search for a doctor" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Textarea
                    id="reason"
                    placeholder="Describe your symptoms or reason for visit"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full bg-helix-primary">
                  Submit Request
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search appointments..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
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

        {/* Appointments List */}
        <div className="space-y-4">
          {appointments[selectedTab].length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No {selectedTab} appointments</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            appointments[selectedTab].map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-helix-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-slate-900 mb-1">
                          {appointment.doctor}
                        </h3>
                        <p className="text-sm text-slate-600 mb-3">{appointment.specialty}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-4 h-4" />
                            <span>{appointment.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="w-4 h-4" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 md:col-span-2">
                            <MapPin className="w-4 h-4" />
                            <span>{appointment.location}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <span className="text-sm text-slate-600">Reason: </span>
                          <span className="text-sm text-slate-900">{appointment.reason}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span className={`px-3 py-1 rounded text-xs font-medium ${
                        appointment.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : appointment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>

                      {selectedTab === 'upcoming' && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

