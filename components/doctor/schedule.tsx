'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Printer, RefreshCw, User, ExternalLink, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Appointment } from '@/lib/api/appointments'
import { useAppointmentsStore } from '@/stores/appointments-store'
import { useCalendarStore } from '@/stores/calendar-store'
import { usePatientsStore } from '@/stores/patients-store'
import { useTabs } from '@/contexts/TabContext'

interface FormattedAppointment {
  id: number
  time: string
  duration: number
  reason: string
  summary: string
  patientId: number
  patientName: string
  status: string
  color: string
  date: Date
  originalAppointment: Appointment
}

interface DoctorScheduleProps {
  apiEndpoint?: string
  initialDate?: Date
  initialViewMode?: 'day' | 'week' | 'month'
  showProvider?: boolean
  providerName?: string
}

export default function DoctorSchedule({
  apiEndpoint = '/api/appointments',
  initialDate,
  initialViewMode = 'week',
  showProvider = false,
  providerName
}: DoctorScheduleProps = {}) {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>(initialViewMode)
  
  // Use Zustand stores
  const { 
    appointments, 
    loading, 
    error, 
    fetchAppointments: fetchAppointmentsFromStore,
    fetchPatientAppointments,
    selectedPatientId
  } = useAppointmentsStore()
  
  const { patients, fetchPatients } = usePatientsStore()
  const { openTab } = useTabs()
  
  // Use shared calendar store for date synchronization with sidebar
  const { selectedDate: currentDate, setSelectedDate: setCurrentDate } = useCalendarStore()
  
  // Initialize with initialDate if provided (only on mount)
  useEffect(() => {
    if (initialDate) {
      setCurrentDate(initialDate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch patients on mount to get patient names
  useEffect(() => {
    if (patients.length === 0) {
      fetchPatients()
    }
  }, [patients.length, fetchPatients])

  // Create a map of patient IDs to patient names for quick lookup
  const patientMap = useMemo(() => {
    const map = new Map<number, string>()
    patients.forEach(patient => {
      map.set(patient.id, `${patient.last_name}, ${patient.first_name}`)
    })
    return map
  }, [patients])

  // Get patient name by ID
  const getPatientName = (patientId: number): string => {
    return patientMap.get(patientId) || `Patient #${patientId}`
  }

  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  const formatMonthYear = (date: Date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  // Fetch appointments on mount only if no patient is selected
  // When a patient is selected, the store handles fetching via setSelectedPatient
  useEffect(() => {
    // Only fetch all appointments if no patient is selected
    // If a patient is selected, the store will have already fetched their appointments
    if (selectedPatientId === null) {
      fetchAppointmentsFromStore(apiEndpoint)
    }
  }, [apiEndpoint, fetchAppointmentsFromStore, selectedPatientId])

  // Manual refresh function (force refresh bypasses cache)
  const loadAppointments = async () => {
    if (selectedPatientId === null) {
      await fetchAppointmentsFromStore(apiEndpoint, true) // forceRefresh = true
    } else {
      // If patient is selected, refresh their appointments
      await fetchPatientAppointments(selectedPatientId, true)
    }
  }

  // Filter appointments for current view
  const getFilteredAppointments = (): Appointment[] => {
    if (viewMode === 'day') {
      const startOfDay = new Date(currentDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(currentDate)
      endOfDay.setHours(23, 59, 59, 999)

      return appointments.filter(app => {
        const appDate = new Date(app.date)
        return appDate >= startOfDay && appDate <= endOfDay
      })
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      return appointments.filter(app => {
        const appDate = new Date(app.date)
        return appDate >= startOfWeek && appDate <= endOfWeek
      })
    } else {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999)

      return appointments.filter(app => {
        const appDate = new Date(app.date)
        return appDate >= startOfMonth && appDate <= endOfMonth
      })
    }
  }

  // Format appointment for display
  const formatAppointment = (app: Appointment): FormattedAppointment => {
    const appDate = new Date(app.date)
    const hours = appDate.getUTCHours()
    const minutes = appDate.getUTCMinutes()
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    
    const duration = 30
    
    const colorMap: Record<string, string> = {
      'active': 'bg-blue-100 border-blue-300',
      'completed': 'bg-green-100 border-green-300',
      'cancelled': 'bg-red-100 border-red-300',
      'pending': 'bg-yellow-100 border-yellow-300'
    }
    
    return {
      id: app.id,
      time: timeString,
      duration,
      reason: app.reason,
      summary: app.summary,
      patientId: app.patient,
      patientName: getPatientName(app.patient),
      status: app.status,
      color: colorMap[app.status] || 'bg-slate-100 border-slate-300',
      date: appDate,
      originalAppointment: app
    }
  }

  // Generate time slots from 8:00 to 18:00 in 1-hour increments
  const timeSlots: string[] = []
  for (let hour = 8; hour < 18; hour++) {
    const timeString = `${hour.toString().padStart(2, '0')}:00`
    timeSlots.push(timeString)
  }

  // Get week days
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  // Calculate overlapping appointments and their positions for stacking
  const calculateAppointmentPositions = (appointments: FormattedAppointment[], isWeekView: boolean = false) => {
    const positions: Array<{
      appointment: FormattedAppointment
      top: number
      left: number
      width: number
      height: number
      zIndex: number
    }> = []

    // Helper function to get hour slot from time string (e.g., "15:30" -> "15:00")
    const getHourSlot = (timeString: string): string => {
      const [hours] = timeString.split(':')
      return `${hours.padStart(2, '0')}:00`
    }

    // Helper function to get minutes offset within hour (e.g., "15:30" -> 30)
    const getMinutesOffset = (timeString: string): number => {
      const [, minutes] = timeString.split(':')
      return parseInt(minutes || '0', 10)
    }

    // Group appointments by hour slot (round down to nearest hour)
    const appointmentsByHourSlot = new Map<string, FormattedAppointment[]>()
    appointments.forEach(app => {
      const hourSlot = getHourSlot(app.time)
      if (!appointmentsByHourSlot.has(hourSlot)) {
        appointmentsByHourSlot.set(hourSlot, [])
      }
      appointmentsByHourSlot.get(hourSlot)!.push(app)
    })

    appointmentsByHourSlot.forEach((apps, hourSlot) => {
      const timeIndex = timeSlots.findIndex(slot => slot === hourSlot)
      if (timeIndex === -1) return

      const baseTopPosition = timeIndex * 256 + 48
      
      // Group appointments by their exact time (for stacking at same time)
      const appsByExactTime = new Map<string, FormattedAppointment[]>()
      apps.forEach(app => {
        if (!appsByExactTime.has(app.time)) {
          appsByExactTime.set(app.time, [])
        }
        appsByExactTime.get(app.time)!.push(app)
      })

      appsByExactTime.forEach((sameTimeApps, exactTime) => {
        const minutesOffset = getMinutesOffset(exactTime)
        const offsetPixels = (minutesOffset / 60) * 256 // Offset within the hour slot
        const topPosition = baseTopPosition + offsetPixels
        const baseHeight = (sameTimeApps[0].duration / 60) * 256

        if (isWeekView) {
          // For week view, group by day first
          const appsByDay = new Map<number, FormattedAppointment[]>()
          sameTimeApps.forEach(app => {
            const weekDays = getWeekDays()
            const dayIndex = weekDays.findIndex(day => 
              day.toDateString() === app.date.toDateString()
            )
            if (dayIndex !== -1) {
              if (!appsByDay.has(dayIndex)) {
                appsByDay.set(dayIndex, [])
              }
              appsByDay.get(dayIndex)!.push(app)
            }
          })

          appsByDay.forEach((dayApps, dayIndex) => {
            const leftPosition = (dayIndex / 7) * 100
            const baseWidth = (1 / 7) * 100
            
            if (dayApps.length === 1) {
              positions.push({
                appointment: dayApps[0],
                top: topPosition,
                left: leftPosition,
                width: baseWidth,
                height: baseHeight,
                zIndex: 1
              })
            } else {
              // Stack side by side
              const width = baseWidth / dayApps.length
              dayApps.forEach((app, idx) => {
                positions.push({
                  appointment: app,
                  top: topPosition,
                  left: leftPosition + (width * idx),
                  width: width,
                  height: baseHeight,
                  zIndex: idx + 1
                })
              })
            }
          })
        } else {
          // For day view, stack side by side
          if (sameTimeApps.length === 1) {
            positions.push({
              appointment: sameTimeApps[0],
              top: topPosition,
              left: 0,
              width: 100,
              height: baseHeight,
              zIndex: 1
            })
          } else {
            const width = 100 / sameTimeApps.length
            sameTimeApps.forEach((app, idx) => {
              positions.push({
                appointment: app,
                top: topPosition,
                left: width * idx,
                width: width,
                height: baseHeight,
                zIndex: idx + 1
              })
            })
          }
        }
      })
    })

    return positions
  }

  // Get month days
  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month - 1, prevMonthLastDay - i)
      days.push({ date: day, isCurrentMonth: false })
    }
    
    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i)
      days.push({ date: day, isCurrentMonth: true })
    }
    
    // Add days from next month to fill the grid
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i)
      days.push({ date: day, isCurrentMonth: false })
    }
    
    return days
  }

  const filteredAppointments = getFilteredAppointments()
  const formattedAppointments = filteredAppointments.map(formatAppointment)

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return appointments.filter(app => {
      const appDate = new Date(app.date)
      return appDate >= startOfDay && appDate <= endOfDay
    })
  }

  return (
    <div className="flex-1 bg-white h-full overflow-y-auto">
      {/* Header Bar */}
      <div className="bg-helix-primary text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
                <button className="text-lg font-semibold text-white px-3 py-1.5 rounded">
                  {viewMode === 'month' ? formatMonthYear(currentDate) : formatDate(currentDate)}
                </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {showProvider && providerName && (
            <div className="text-sm font-medium">{providerName}</div>
          )}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
              <Printer className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={loadAppointments}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <div className="flex gap-1 bg-white/20 rounded-lg p-1">
              <Button
                variant={viewMode === 'day' ? 'default' : 'ghost'}
                size="sm"
                className={`h-7 px-3 text-xs ${
                  viewMode === 'day' ? 'bg-white text-helix-primary' : 'text-white hover:bg-white/20'
                }`}
                onClick={() => setViewMode('day')}
              >
                Day
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                className={`h-7 px-3 text-xs ${
                  viewMode === 'week' ? 'bg-white text-helix-primary' : 'text-white hover:bg-white/20'
                }`}
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                className={`h-7 px-3 text-xs ${
                  viewMode === 'month' ? 'bg-white text-helix-primary' : 'text-white hover:bg-white/20'
                }`}
                onClick={() => setViewMode('month')}
              >
                Month
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule View */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {viewMode === 'day' && (
          <div className="flex">
            {/* Time Column */}
            <div className="w-20 flex-shrink-0">
              <div className="h-12"></div>
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="h-64 border-b border-slate-200 text-xs text-slate-600 pt-1"
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Schedule Column */}
            <div className="flex-1 relative">
              <div className="h-12 border-b border-slate-200"></div>
              <div className="relative">
                    {timeSlots.map((time) => (
                      <div
                        key={time}
                        className="h-64 border-b border-slate-200 border-l border-slate-200"
                      ></div>
                    ))}

                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-slate-600">Loading appointments...</div>
                  </div>
                ) : formattedAppointments.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-slate-500 text-sm">No appointments for this day</div>
                  </div>
                ) : (
                  calculateAppointmentPositions(formattedAppointments, false).map((pos) => {
                    return (
                      <HoverCard key={pos.appointment.id}>
                        <HoverCardTrigger asChild>
                          <div
                            className={`absolute ${pos.appointment.color} border rounded p-2 cursor-pointer hover:shadow-md transition-shadow`}
                            style={{
                              top: `${pos.top}px`,
                              left: `${pos.left}%`,
                              width: `${pos.width}%`,
                              height: `${pos.height}px`,
                              zIndex: pos.zIndex
                            }}
                          >
                            <div className="flex items-start gap-2 h-full">
                              <User className="w-4 h-4 text-helix-primary flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-slate-900 truncate">
                                  {pos.appointment.time} - {pos.appointment.patientName}
                                </div>
                                <div className="text-xs text-slate-600 truncate mt-0.5">
                                  {pos.appointment.reason}
                                </div>
                              </div>
                            </div>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="text-xs text-slate-500 mb-1">Appointment ID</div>
                                <div className="text-sm font-semibold text-slate-900">#{pos.appointment.id}</div>
                              </div>
                              <MoreVertical className="w-4 h-4 text-slate-400" />
                            </div>

                            {/* Patient Info */}
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-helix-primary rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-slate-900">{pos.appointment.patientName}</div>
                                <div className="text-xs text-slate-500 mt-0.5">Patient ID: {pos.appointment.patientId}</div>
                              </div>
                            </div>

                            {/* Appointment Details */}
                            <div className="space-y-2">
                              <div>
                                <div className="text-xs text-slate-500 mb-1">Reason</div>
                                <div className="text-sm text-slate-900">{pos.appointment.reason}</div>
                              </div>
                              {pos.appointment.summary && (
                                <div>
                                  <div className="text-xs text-slate-500 mb-1">Summary</div>
                                  <div className="text-sm text-slate-700">{pos.appointment.summary}</div>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                                <div>
                                  <div className="text-xs text-slate-500 mb-1">Date</div>
                                  <div className="text-sm font-medium text-slate-900">
                                    {pos.appointment.date.toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    })}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500 mb-1">Time</div>
                                  <div className="text-sm font-medium text-slate-900">{pos.appointment.time}</div>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-slate-200">
                                <div className="text-xs text-slate-500 mb-1">Status</div>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  pos.appointment.status === 'active' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : pos.appointment.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : pos.appointment.status === 'cancelled'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {pos.appointment.status}
                                </span>
                              </div>
                            </div>

                            {/* Action Button */}
                            <Button 
                              className="w-full bg-helix-primary hover:bg-helix-primary/90 cursor-pointer"
                              onClick={() => {
                                const patientName = pos.appointment.patientName
                                openTab('PatientProfile', patientName, { patientId: pos.appointment.patientId })
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
            </div>
          </div>
        )}

        {viewMode === 'week' && (
          <div className="flex overflow-x-auto">
            {/* Time Column */}
            <div className="w-20 flex-shrink-0">
              <div className="h-12"></div>
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="h-64 border-b border-slate-200 text-xs text-slate-600 pt-1"
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Week Days */}
            <div className="flex-1 min-w-[800px]">
              <div className="grid grid-cols-7 border-b border-slate-200">
                {getWeekDays().map((day, idx) => (
                  <div key={idx} className="border-l border-slate-200 p-2 text-center">
                    <div className="text-xs text-slate-600">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-sm font-semibold mt-1 ${
                      day.toDateString() === new Date().toDateString() 
                        ? 'text-helix-primary' 
                        : 'text-slate-900'
                    }`}>
                      {day.getDate()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative">
                {timeSlots.map((time) => (
                  <div key={time} className="h-64 border-b border-slate-200 grid grid-cols-7">
                    {getWeekDays().map((day, dayIdx) => (
                      <div
                        key={dayIdx}
                        className="border-l border-slate-200"
                      ></div>
                    ))}
                  </div>
                ))}

                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-slate-600">Loading appointments...</div>
                  </div>
                ) : (
                  calculateAppointmentPositions(formattedAppointments, true).map((pos) => {
                    return (
                      <HoverCard key={pos.appointment.id}>
                        <HoverCardTrigger asChild>
                          <div
                            className={`absolute ${pos.appointment.color} border rounded p-1.5 cursor-pointer hover:shadow-md transition-shadow`}
                            style={{
                              top: `${pos.top}px`,
                              left: `${pos.left}%`,
                              width: `${pos.width}%`,
                              height: `${pos.height}px`,
                              zIndex: pos.zIndex
                            }}
                          >
                            <div className="flex items-start gap-1.5 h-full">
                              <User className="w-3 h-3 text-helix-primary flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-slate-900 truncate leading-tight">
                                  {pos.appointment.time} - {pos.appointment.patientName}
                                </div>
                                <div className="text-xs text-slate-600 truncate mt-0.5 leading-tight">
                                  {pos.appointment.reason}
                                </div>
                              </div>
                            </div>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="text-xs text-slate-500 mb-1">Appointment ID</div>
                                <div className="text-sm font-semibold text-slate-900">#{pos.appointment.id}</div>
                              </div>
                              <MoreVertical className="w-4 h-4 text-slate-400" />
                            </div>

                            {/* Patient Info */}
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-helix-primary rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-slate-900">{pos.appointment.patientName}</div>
                                <div className="text-xs text-slate-500 mt-0.5">Patient ID: {pos.appointment.patientId}</div>
                              </div>
                            </div>

                            {/* Appointment Details */}
                            <div className="space-y-2">
                              <div>
                                <div className="text-xs text-slate-500 mb-1">Reason</div>
                                <div className="text-sm text-slate-900">{pos.appointment.reason}</div>
                              </div>
                              {pos.appointment.summary && (
                                <div>
                                  <div className="text-xs text-slate-500 mb-1">Summary</div>
                                  <div className="text-sm text-slate-700">{pos.appointment.summary}</div>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                                <div>
                                  <div className="text-xs text-slate-500 mb-1">Date</div>
                                  <div className="text-sm font-medium text-slate-900">
                                    {pos.appointment.date.toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    })}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500 mb-1">Time</div>
                                  <div className="text-sm font-medium text-slate-900">{pos.appointment.time}</div>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-slate-200">
                                <div className="text-xs text-slate-500 mb-1">Status</div>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  pos.appointment.status === 'active' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : pos.appointment.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : pos.appointment.status === 'cancelled'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {pos.appointment.status}
                                </span>
                              </div>
                            </div>

                            {/* Action Button */}
                            <Button 
                              className="w-full bg-helix-primary hover:bg-helix-primary/90 cursor-pointer"
                              onClick={() => {
                                const patientName = pos.appointment.patientName
                                openTab('PatientProfile', patientName, { patientId: pos.appointment.patientId })
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
            </div>
          </div>
        )}

        {viewMode === 'month' && (
          <div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-slate-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {getMonthDays().map(({ date, isCurrentMonth }, idx) => {
                const dayAppointments = getAppointmentsForDate(date)
                const isToday = date.toDateString() === new Date().toDateString()

                return (
                  <div
                    key={idx}
                    className={`min-h-24 border border-slate-200 rounded p-2 ${
                      isCurrentMonth ? 'bg-white' : 'bg-slate-50'
                    } ${isToday ? 'ring-2 ring-helix-primary' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday 
                        ? 'text-helix-primary' 
                        : isCurrentMonth 
                          ? 'text-slate-900' 
                          : 'text-slate-400'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 3).map((app) => {
                        const formatted = formatAppointment(app)
                        return (
                          <HoverCard key={app.id}>
                            <HoverCardTrigger asChild>
                              <div
                                className={`text-xs p-1 rounded truncate ${formatted.color} cursor-pointer hover:shadow-sm`}
                              >
                                <div className="font-medium truncate">{formatted.time}</div>
                                <div className="truncate">{formatted.patientName}</div>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">Appointment ID</div>
                                    <div className="text-sm font-semibold text-slate-900">#{formatted.id}</div>
                                  </div>
                                  <MoreVertical className="w-4 h-4 text-slate-400" />
                                </div>

                                {/* Patient Info */}
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 bg-helix-primary rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-slate-900">{formatted.patientName}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">Patient ID: {formatted.patientId}</div>
                                  </div>
                                </div>

                                {/* Appointment Details */}
                                <div className="space-y-2">
                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">Reason</div>
                                    <div className="text-sm text-slate-900">{formatted.reason}</div>
                                  </div>
                                  {formatted.summary && (
                                    <div>
                                      <div className="text-xs text-slate-500 mb-1">Summary</div>
                                      <div className="text-sm text-slate-700">{formatted.summary}</div>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                                    <div>
                                      <div className="text-xs text-slate-500 mb-1">Time</div>
                                      <div className="text-sm font-medium text-slate-900">{formatted.time}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-slate-500 mb-1">Status</div>
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        formatted.status === 'active' 
                                          ? 'bg-blue-100 text-blue-700' 
                                          : formatted.status === 'completed'
                                          ? 'bg-green-100 text-green-700'
                                          : formatted.status === 'cancelled'
                                          ? 'bg-red-100 text-red-700'
                                          : 'bg-yellow-100 text-yellow-700'
                                      }`}>
                                        {formatted.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Button */}
                                <Button 
                                  className="w-full bg-helix-primary hover:bg-helix-primary/90 cursor-pointer"
                                  onClick={() => {
                                    const patientName = formatted.patientName
                                    openTab('PatientProfile', patientName, { patientId: formatted.patientId })
                                  }}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  See Patient Details
                                </Button>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        )
                      })}
                      {dayAppointments.length > 3 && (
                        <div className="text-xs text-slate-500 font-medium">
                          +{dayAppointments.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
