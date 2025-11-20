'use client'

import { useState, useEffect, useCallback } from 'react'
import { User, Mail, Phone, Calendar, MapPin, ClipboardList, FileText, RefreshCw, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { usePatientsStore } from '@/stores/patients-store'
import { Appointment } from '@/lib/api/appointments'
import { usePatientRecordsStore } from '@/stores/patient-records-store'
import { useAppointmentsStore } from '@/stores/appointments-store'
import { useTabs } from '@/contexts/TabContext'

interface PatientProfileProps {
  patientId: number
}

export default function PatientProfile({ patientId }: PatientProfileProps) {
  const { patients, fetchPatients } = usePatientsStore()
  const {
    appointments,
    appointmentsLoading,
    appointmentsError,
    encounters,
    encountersLoading,
    encountersError,
    fetchAppointments: fetchPatientAppointments,
    fetchEncounters: fetchPatientEncounters
  } = usePatientRecordsStore()
  const { updateAppointment } = useAppointmentsStore()
  const { openTab } = useTabs()

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false)

  useEffect(() => {
    if (patients.length === 0) {
      fetchPatients()
    }
  }, [patients.length, fetchPatients])

  const loadAppointments = useCallback(async (forceRefresh = false) => {
    if (!patientId) return
    await fetchPatientAppointments(patientId, forceRefresh)
  }, [fetchPatientAppointments, patientId])

  const loadEncounters = useCallback(async (forceRefresh = false) => {
    if (!patientId) return
    await fetchPatientEncounters(patientId, forceRefresh)
  }, [fetchPatientEncounters, patientId])

  useEffect(() => {
    loadAppointments()
    loadEncounters()
  }, [loadAppointments, loadEncounters])

  // Listen for tab refresh events
  useEffect(() => {
    const handleRefresh = (event: CustomEvent) => {
      if (event.detail.tabType === 'PatientProfile' && event.detail.tabData?.patientId === patientId) {
        loadAppointments(true) // Force refresh
        loadEncounters(true) // Force refresh
      }
    }
    window.addEventListener('tab-refresh', handleRefresh as EventListener)
    return () => window.removeEventListener('tab-refresh', handleRefresh as EventListener)
  }, [patientId, loadAppointments, loadEncounters])

  const patient = patients.find(p => p.id === patientId)

  if (!patient) {
    return (
      <div className="flex-1 bg-white h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-600 mb-2">Loading patient profile...</div>
        </div>
      </div>
    )
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const hours = date.getUTCHours().toString().padStart(2, '0')
    const minutes = date.getUTCMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const handleOpenAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setAppointmentDialogOpen(true)
  }

  const renderStatusBadge = (status?: string) => {
    if (!status) return null
    const normalized = status.toLowerCase()
    const badgeClass =
      normalized === 'active'
        ? 'bg-blue-100 text-blue-700'
        : normalized === 'completed'
        ? 'bg-green-100 text-green-700'
        : normalized === 'cancelled'
        ? 'bg-red-100 text-red-700'
        : 'bg-yellow-100 text-yellow-700'

    return (
      <span className={`text-xs px-2 py-1 rounded ${badgeClass}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="flex-1 bg-white h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-helix-primary text-white px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">
              {patient.last_name}, {patient.first_name}
            </h1>
            <div className="text-sm text-white/80 mt-1">
              Patient ID: {patient.id}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Information */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Patient Information</h2>
            <div className="space-y-4">
              {patient.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-xs text-slate-500">Email</div>
                    <div className="text-sm text-slate-900">{patient.email}</div>
                  </div>
                </div>
              )}
              {patient.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-xs text-slate-500">Phone</div>
                    <div className="text-sm text-slate-900">{patient.phone}</div>
                  </div>
                </div>
              )}
              {patient.date_of_birth && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-xs text-slate-500">Date of Birth</div>
                    <div className="text-sm text-slate-900">
                      {new Date(patient.date_of_birth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              )}
              {patient.gender && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-xs text-slate-500">Gender</div>
                    <div className="text-sm text-slate-900 capitalize">{patient.gender}</div>
                  </div>
                </div>
              )}
              {patient.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-xs text-slate-500">Address</div>
                    <div className="text-sm text-slate-900">{patient.address}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Encounters */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Encounters</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => loadEncounters(true)}
                disabled={encountersLoading}
              >
                <RefreshCw className={`w-4 h-4 ${encountersLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            {encountersError && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
                {encountersError}
              </div>
            )}
            {encountersLoading ? (
              <div className="text-sm text-slate-500 py-8 text-center">Loading encounters…</div>
            ) : encounters.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-8">
                No encounters recorded for this patient
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {encounters.map((encounter) => (
                  <div
                    key={encounter.id}
                    className="border border-slate-200 rounded-lg p-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <ClipboardList className="w-4 h-4 text-helix-primary" />
                        <span>{encounter.encounter_type || 'Encounter'}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {encounter.date
                          ? formatDate(encounter.date)
                          : encounter.created_at
                            ? formatDate(encounter.created_at)
                            : 'Date not provided'}
                      </div>
                      {encounter.summary && (
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                          {encounter.summary}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {renderStatusBadge(encounter.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => {
                          const patientName = `${patient.last_name}, ${patient.first_name}`
                          openTab('EncounterDetail', `Encounter #${encounter.id}`, {
                            encounterId: encounter.id,
                            patientId: patient.id,
                            patientName
                          })
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        View details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Appointments History */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Appointment History</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => loadAppointments(true)}
                disabled={appointmentsLoading}
              >
                <RefreshCw className={`w-4 h-4 ${appointmentsLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            {appointmentsError && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
                {appointmentsError}
              </div>
            )}
            {appointmentsLoading ? (
              <div className="text-sm text-slate-500 text-center py-8">Loading appointments…</div>
            ) : appointments.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-8">
                No appointments found
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {appointments
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-slate-200 rounded-lg p-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <FileText className="w-4 h-4 text-helix-primary" />
                          <span>{appointment.reason}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {formatDate(appointment.date)} at {formatTime(appointment.date)}
                        </div>
                        {appointment.summary && (
                          <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                            {appointment.summary}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {renderStatusBadge(appointment.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAppointmentDetails(appointment)}
                        >
                          View details
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Detail Dialog */}
      <Dialog
        open={appointmentDialogOpen}
        onOpenChange={(open) => {
          setAppointmentDialogOpen(open)
          if (!open) setSelectedAppointment(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Appointment #{selectedAppointment?.id}</DialogTitle>
            {selectedAppointment && (
              <DialogDescription>
                {formatDate(selectedAppointment.date)} at {formatTime(selectedAppointment.date)}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedAppointment ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Reason</div>
                <div className="text-sm font-medium text-slate-900">
                  {selectedAppointment.reason}
                </div>
              </div>
              {selectedAppointment.summary && (
                <div>
                  <div className="text-xs text-slate-500 mb-1">Summary</div>
                  <div className="text-sm text-slate-700">{selectedAppointment.summary}</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Status</div>
                  {renderStatusBadge(selectedAppointment.status)}
                </div>
                {selectedAppointment.created_at && (
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Created</div>
                    <div className="text-sm text-slate-900">
                      {formatDate(selectedAppointment.created_at)}
                    </div>
                  </div>
                )}
                {selectedAppointment.updated_at && (
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Updated</div>
                    <div className="text-sm text-slate-900">
                      {formatDate(selectedAppointment.updated_at)}
                    </div>
                  </div>
                )}
              </div>
              {selectedAppointment.status === 'active' && (
                <div className="pt-4 border-t border-slate-200">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={async () => {
                      try {
                        // Send all required fields in the request body
                        await updateAppointment(selectedAppointment.id, {
                          date: selectedAppointment.date,
                          reason: selectedAppointment.reason || null,
                          summary: selectedAppointment.summary || null,
                          status: 'completed',
                          patient: selectedAppointment.patient || null
                        })
                        // Update local state
                        setSelectedAppointment({
                          ...selectedAppointment,
                          status: 'completed',
                          updated_at: new Date().toISOString()
                        })
                        // Refresh appointments list
                        await fetchPatientAppointments(patientId, true)
                      } catch (error) {
                        console.error('Failed to update appointment status:', error)
                      }
                    }}
                  >
                    Mark as Completed
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-500">Select an appointment to view details.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

