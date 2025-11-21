'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Clock, User, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { useCalendarStore } from '@/stores/calendar-store'
import { useAppointmentsStore } from '@/stores/appointments-store'
import { Input } from '@/components/ui/input'
import { usePatientsStore } from '@/stores/patients-store'
import { Appointment } from '@/lib/api/appointments'
import { useTabs } from '@/contexts/TabContext'

interface DoctorSidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export default function DoctorSidebar({ collapsed = false, onToggleCollapse }: DoctorSidebarProps = {}) {
  const { selectedDate, setSelectedDate } = useCalendarStore()
  const { appointments, setSelectedPatient, selectedPatientId } = useAppointmentsStore()
  const { patients, loading: patientsLoading, fetchPatients } = usePatientsStore()
  const { openTab } = useTabs()
  const [patientsOpen, setPatientsOpen] = useState(true)
  const [patientSearch, setPatientSearch] = useState('')
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false)
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<Appointment[]>([])
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null)
  const [appointmentPatientIds, setAppointmentPatientIds] = useState<Set<number>>(new Set())

  const handlePatientSelect = (patientId: number | null) => {
    setSelectedPatient(patientId)
  }

  // Fetch patients on mount
  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  useEffect(() => {
    if (selectedPatientId === null && appointments.length > 0) {
      setAppointmentPatientIds(new Set(appointments.map((appointment) => appointment.patient)))
    }
  }, [appointments, selectedPatientId])

  const patientMap = useMemo(() => {
    const map = new Map<number, typeof patients[number]>()
    patients.forEach((patient) => {
      map.set(patient.id, patient)
    })
    return map
  }, [patients])

  const getPatientFullName = (patientId: number) => {
    const patient = patientMap.get(patientId)
    if (!patient) return `Patient #${patientId}`
    return `${patient.last_name}, ${patient.first_name}`
  }

  const currentMonth = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const currentDay = selectedDate.getDate()
  const currentYear = selectedDate.getFullYear()
  const currentMonthIndex = selectedDate.getMonth()

  // Check if a date has appointments
  const hasAppointments = (date: Date): boolean => {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return appointments.some(app => {
      const appDate = new Date(app.date)
      return appDate >= startOfDay && appDate <= endOfDay
    })
  }

  // Generate calendar days for current month
  const getCalendarDays = () => {
    const year = currentYear
    const month = currentMonthIndex
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayDate = new Date(year, month - 1, prevMonthLastDay - i)
      days.push({ 
        day: prevMonthLastDay - i, 
        isCurrentMonth: false,
        date: dayDate
      })
    }
    
    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i)
      days.push({ 
        day: i, 
        isCurrentMonth: true,
        date: dayDate
      })
    }
    
    // Add days from next month to fill the grid
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const dayDate = new Date(year, month + 1, i)
      days.push({ 
        day: i, 
        isCurrentMonth: false,
        date: dayDate
      })
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (direction === 'next') {
      newDate.setMonth(newDate.getMonth() + 1)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setSelectedDate(newDate)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    
    // Get appointments for this day
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const dayAppointments = appointments.filter(app => {
      const appDate = new Date(app.date)
      return appDate >= startOfDay && appDate <= endOfDay
    })

    if (dayAppointments.length > 0) {
      setSelectedDayAppointments(dayAppointments)
      setSelectedDayDate(date)
      setAppointmentDialogOpen(true)
    } else {
      // If no appointments, just navigate to the date
      setSelectedDate(date)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const hours = date.getUTCHours().toString().padStart(2, '0')
    const minutes = date.getUTCMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const formatDayHeader = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  const calendarDays = getCalendarDays()
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  const patientsWithAppointments = useMemo(() => {
    const ids =
      appointmentPatientIds.size > 0
        ? appointmentPatientIds
        : new Set(appointments.map((appointment) => appointment.patient))

    const filteredPatients = patients.filter((patient) => ids.has(patient.id))
    if (!patientSearch.trim()) return filteredPatients
    const term = patientSearch.toLowerCase()
    return filteredPatients.filter((patient) => {
      const fullName = `${patient.last_name}, ${patient.first_name}`.toLowerCase()
      return fullName.includes(term)
    })
  }, [appointmentPatientIds, appointments, patients, patientSearch])

  if (collapsed) {
    return (
      <div className="w-12 bg-white border-r border-slate-200 h-full flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleCollapse}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Search className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleCollapse}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Month Calendar */}
      <div className="p-4 border-b border-slate-200">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">{currentMonth}</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, i) => (
            <div key={i} className="text-center text-xs font-medium text-slate-600 py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((item, i) => {
            const isSelected = item.isCurrentMonth && 
              item.date.toDateString() === selectedDate.toDateString()
            const hasAppts = hasAppointments(item.date)
            const isToday = item.date.toDateString() === new Date().toDateString()

            return (
              <button
                key={i}
                onClick={() => item.isCurrentMonth && handleDateClick(item.date)}
                className={`h-8 text-sm rounded transition-colors relative cursor-pointer ${
                  item.isCurrentMonth
                    ? isSelected
                      ? 'bg-helix-primary text-white font-semibold'
                      : 'text-slate-900 hover:bg-slate-100'
                    : 'text-slate-400'
                } ${isToday && !isSelected ? 'ring-1 ring-helix-primary' : ''}`}
              >
                {item.day}
                {hasAppts && item.isCurrentMonth && (
                  <span className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"></span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Appointment Details Dialog */}
      <Dialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDayDate && formatDayHeader(selectedDayDate)}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            {selectedDayAppointments.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No appointments for this day</p>
            ) : (
              selectedDayAppointments
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((appointment) => {
                  const patient = patientMap.get(appointment.patient)
                  const appointmentDate = new Date(appointment.date)
                  return (
                    <HoverCard key={appointment.id}>
                      <HoverCardTrigger asChild>
                        <div
                          className="bg-blue-50 border border-blue-200 rounded-lg p-3 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-helix-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 mb-1">
                          {formatTime(appointment.date)}
                        </div>
                        <div className="text-sm text-slate-700 font-medium mb-1">
                          {appointment.reason}
                        </div>
                        {appointment.summary && (
                          <div className="text-xs text-slate-600 mt-1">
                            {appointment.summary}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            appointment.status === 'active' 
                              ? 'bg-blue-100 text-blue-700' 
                              : appointment.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : appointment.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {appointment.status}
                          </span>
                          <span className="text-xs text-slate-500">
                            Patient ID: {appointment.patient}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-xs text-slate-500 mb-1">Appointment ID</div>
                              <div className="text-sm font-semibold text-slate-900">#{appointment.id}</div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-helix-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900">
                                {getPatientFullName(appointment.patient)}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                Patient ID: {appointment.patient}
                              </div>
                              {patient?.email && (
                                <div className="text-xs text-slate-500">{patient.email}</div>
                              )}
                              {patient?.phone && (
                                <div className="text-xs text-slate-500">{patient.phone}</div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <div className="text-xs text-slate-500 mb-1">Reason</div>
                              <div className="text-sm text-slate-900">{appointment.reason}</div>
                            </div>
                            {appointment.summary && (
                              <div>
                                <div className="text-xs text-slate-500 mb-1">Summary</div>
                                <div className="text-sm text-slate-700">{appointment.summary}</div>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                              <div>
                                <div className="text-xs text-slate-500 mb-1">Date</div>
                                <div className="text-sm font-medium text-slate-900">
                                  {appointmentDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-slate-500 mb-1">Time</div>
                                <div className="text-sm font-medium text-slate-900">
                                  {formatTime(appointment.date)}
                                </div>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-slate-200">
                              <div className="text-xs text-slate-500 mb-1">Status</div>
                              <span className={`text-xs px-2 py-1 rounded ${
                                appointment.status === 'active' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : appointment.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : appointment.status === 'cancelled'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {appointment.status}
                              </span>
                            </div>
                          </div>

                          <Button
                            className="w-full bg-helix-primary hover:bg-helix-primary/90 cursor-pointer"
                            onClick={() => {
                              const patientName = getPatientFullName(appointment.patient)
                              openTab('PatientProfile', patientName, { patientId: appointment.patient })
                              setAppointmentDialogOpen(false)
                            }}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            See Patient Details
                          </Button>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  )
                })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Patients Section */}
      <div className="p-4 border-b border-slate-200">
        <button
          onClick={() => setPatientsOpen(!patientsOpen)}
          className="w-full flex items-center justify-between mb-2"
        >
          <h3 className="font-semibold text-slate-900">Patients</h3>
          {patientsOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-600" />
          )}
        </button>
        {patientsOpen && (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {patientsLoading ? (
              <div className="text-sm text-slate-500 py-2 text-center">Loading patients...</div>
            ) : patientsWithAppointments.length === 0 ? (
              <div className="text-sm text-slate-500 py-2 text-center">No patients found</div>
            ) : (
              <>
                <div className="sticky top-0 bg-white pb-2">
                  <Input
                    value={patientSearch}
                    onChange={(event) => setPatientSearch(event.target.value)}
                    placeholder="Search patients..."
                    className="h-8 text-sm"
                  />
                </div>
                <button
                  onClick={() => handlePatientSelect(null)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedPatientId === null
                      ? 'bg-slate-100 text-slate-900 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Patients
                </button>
                {patientsWithAppointments.map((patient) => {
                  const fullName = `${patient.last_name}, ${patient.first_name}`
                  return (
                    <HoverCard key={patient.id} openDelay={200}>
                      <HoverCardTrigger asChild>
                    <button
                      onClick={() => handlePatientSelect(patient.id)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        selectedPatientId === patient.id
                          ? 'bg-slate-100 text-slate-900 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {fullName}
                    </button>
                      </HoverCardTrigger>
                      <HoverCardContent
                        side="right"
                        align="start"
                        className="w-72 shadow-xl border-slate-200"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-helix-primary/10 text-helix-primary flex items-center justify-center font-semibold">
                              {patient.first_name?.[0]}
                              {patient.last_name?.[0]}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">
                                {fullName}
                              </div>
                              <div className="text-xs text-slate-500">Patient ID: {patient.id}</div>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            {patient.email && (
                              <div className="flex justify-between text-slate-600">
                                <span className="text-xs uppercase tracking-wide text-slate-400">Email</span>
                                <span className="text-right text-slate-900">{patient.email}</span>
                              </div>
                            )}
                            {patient.phone && (
                              <div className="flex justify-between text-slate-600">
                                <span className="text-xs uppercase tracking-wide text-slate-400">Phone</span>
                                <span className="text-right text-slate-900">{patient.phone}</span>
                              </div>
                            )}
                            {patient.date_of_birth && (
                              <div className="flex justify-between text-slate-600">
                                <span className="text-xs uppercase tracking-wide text-slate-400">DOB</span>
                                <span className="text-right text-slate-900">
                                  {new Date(patient.date_of_birth).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            )}
                            {patient.address && (
                              <div className="flex justify-between text-slate-600">
                                <span className="text-xs uppercase tracking-wide text-slate-400 mr-2">Address</span>
                                <span className="text-right text-slate-900 max-w-[55%] truncate">
                                  {patient.address}
                                </span>
                              </div>
                            )}
                          </div>
                          <Button
                            className="w-full bg-helix-primary hover:bg-helix-primary/90 text-white"
                            size="sm"
                            onClick={() => {
                              handlePatientSelect(patient.id)
                              const patientName = `${patient.last_name}, ${patient.first_name}`
                              openTab('PatientProfile', patientName, { patientId: patient.id })
                            }}
                          >
                            View Patient
                          </Button>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  )
                })}
              </>
            )}
          </div>
        )}
      </div>

    </div>
  )
}

