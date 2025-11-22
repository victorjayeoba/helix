'use client'

import { useState, useEffect, useCallback } from 'react'
import { User, Mail, Phone, Calendar, MapPin, ClipboardList, FileText, RefreshCw, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { usePatientsStore } from '@/stores/patients-store'
import { Appointment, deleteAppointment } from '@/lib/api/appointments'
import { usePatientRecordsStore } from '@/stores/patient-records-store'
import { useAppointmentsStore } from '@/stores/appointments-store'
import { useTabs } from '@/contexts/TabContext'
import { PatientTest } from '@/lib/api/tests'
import { fetchEncounterById, EncounterDetail } from '@/lib/api/encounters'
import { TestReportPDFDownload } from '@/components/patient/test-report-pdf'
import { toast } from 'sonner'
import { getFirebaseUidFromDorraPatientId } from '@/lib/api/patient-mapping'
import { createNotification } from '@/lib/firebase/notifications'

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
    tests,
    testsLoading,
    testsError,
    fetchAppointments: fetchPatientAppointments,
    fetchEncounters: fetchPatientEncounters,
    fetchTests: fetchPatientTests
  } = usePatientRecordsStore()
  const { updateAppointment } = useAppointmentsStore()
  const { openTab } = useTabs()

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedTest, setSelectedTest] = useState<PatientTest | null>(null)
  const [testEncounterDetails, setTestEncounterDetails] = useState<EncounterDetail | null>(null)
  const [loadingTestEncounter, setLoadingTestEncounter] = useState(false)
  const [testDialogOpen, setTestDialogOpen] = useState(false)

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

  const loadTests = useCallback(async (forceRefresh = false) => {
    if (!patientId) return
    await fetchPatientTests(patientId, forceRefresh)
  }, [fetchPatientTests, patientId])

  useEffect(() => {
    loadAppointments()
    loadEncounters()
    loadTests()
  }, [loadAppointments, loadEncounters, loadTests])

  // Listen for tab refresh events
  useEffect(() => {
    const handleRefresh = (event: CustomEvent) => {
      if (event.detail.tabType === 'PatientProfile' && event.detail.tabData?.patientId === patientId) {
        loadAppointments(true) // Force refresh
        loadEncounters(true) // Force refresh
        loadTests(true) // Force refresh
      }
    }
    window.addEventListener('tab-refresh', handleRefresh as EventListener)
    return () => window.removeEventListener('tab-refresh', handleRefresh as EventListener)
  }, [patientId, loadAppointments, loadEncounters, loadTests])

  const handleTestClick = async (test: PatientTest) => {
    setSelectedTest(test)
    setTestDialogOpen(true)
    setTestEncounterDetails(null)

    // Fetch encounter details if encounter ID exists
    if (test.encounter) {
      setLoadingTestEncounter(true)
      try {
        const encounter = await fetchEncounterById(test.encounter)
        setTestEncounterDetails(encounter)
      } catch (error: any) {
        console.error('Error fetching encounter details:', error)
        // Don't show error toast, just continue without encounter details
      } finally {
        setLoadingTestEncounter(false)
      }
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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

          {/* Tests */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Test Results</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => loadTests(true)}
                disabled={testsLoading}
              >
                <RefreshCw className={`w-4 h-4 ${testsLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            {testsError && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
                {testsError}
              </div>
            )}
            {testsLoading ? (
              <div className="text-sm text-slate-500 py-8 text-center">Loading tests…</div>
            ) : tests.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-8">
                No test results found for this patient
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className="border border-slate-200 rounded-lg p-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleTestClick(test)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <FileText className="w-4 h-4 text-helix-primary" />
                        <span>{test.name}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {formatDate(test.created_at)} at {formatTime(test.created_at)}
                      </div>
                      {test.result && (
                        <p className="text-sm text-slate-600 mt-2">
                          Result: <span className="font-medium">{test.result}</span>
                        </p>
                      )}
                      {test.unique_id && (
                        <p className="text-xs text-slate-500 mt-1 font-mono">ID: {test.unique_id}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTestClick(test)
                        }}
                      >
                        <FileText className="w-4 h-4" />
                        View Report
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
                <div className="pt-4 border-t border-slate-200 space-y-2">
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
                        toast.success('Appointment marked as completed')
                      } catch (error: any) {
                        console.error('Failed to update appointment status:', error)
                        toast.error(error.message || 'Failed to update appointment')
                      }
                    }}
                  >
                    Mark as Completed
                  </Button>
                  <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                        onClick={() => {
                          setCancelReason('')
                          setCancelDialogOpen(true)
                        }}
                      >
                        Cancel Appointment
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="sm:max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel this appointment? Please provide a reason for cancellation.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Label htmlFor="cancel-reason" className="text-sm font-medium">
                          Reason for Cancellation
                        </Label>
                        <Textarea
                          id="cancel-reason"
                          placeholder="e.g., Doctor unavailable, Emergency situation, Patient request..."
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          rows={3}
                          className="mt-2"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                          setCancelReason('')
                          setCancelDialogOpen(false)
                        }}>
                          Keep Appointment
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={async () => {
                            if (!cancelReason.trim()) {
                              toast.error('Please provide a reason for cancellation')
                              return
                            }

                            try {
                              // Cancel the appointment
                              await deleteAppointment(selectedAppointment.id)
                              
                              // Get patient's Firebase UID and send notification
                              if (selectedAppointment.patient) {
                                try {
                                  const patientFirebaseUid = await getFirebaseUidFromDorraPatientId(selectedAppointment.patient)
                                  if (patientFirebaseUid) {
                                    await createNotification({
                                      userId: patientFirebaseUid,
                                      type: 'alert',
                                      title: 'Appointment Cancelled',
                                      message: `Your appointment scheduled for ${formatDate(selectedAppointment.date)} at ${formatTime(selectedAppointment.date)} has been cancelled. Reason: ${cancelReason}`,
                                      read: false,
                                      metadata: {
                                        appointmentId: selectedAppointment.id,
                                        reason: cancelReason
                                      }
                                    })
                                  }
                                } catch (notifError) {
                                  console.error('Failed to create notification:', notifError)
                                  // Don't fail the cancellation if notification fails
                                }
                              }

                              toast.success('Appointment cancelled successfully')
                              setAppointmentDialogOpen(false)
                              setCancelDialogOpen(false)
                              setSelectedAppointment(null)
                              setCancelReason('')
                              // Refresh appointments list
                              await fetchPatientAppointments(patientId, true)
                            } catch (error: any) {
                              console.error('Failed to cancel appointment:', error)
                              toast.error(error.message || 'Failed to cancel appointment')
                            }
                          }}
                        >
                          Cancel Appointment
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-500">Select an appointment to view details.</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Test Report Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <DialogHeader>
              <DialogTitle>Test Report</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2">
              {selectedTest && (
                <TestReportPDFDownload
                  test={selectedTest}
                  encounter={testEncounterDetails}
                  patientName={patient ? `${patient.first_name} ${patient.last_name}` : undefined}
                >
                  {({ loading }: { loading: boolean }) => (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={loading}
                      className={loading ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {loading ? 'Generating PDF...' : 'Download PDF'}
                    </Button>
                  )}
                </TestReportPDFDownload>
              )}
              <Button onClick={() => setTestDialogOpen(false)} variant="ghost" size="icon">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {selectedTest && (
            <div className="bg-white">
              {/* Report Header */}
              <div className="border-b-2 border-slate-300 pb-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">HELIX EMR</h1>
                    <p className="text-sm text-slate-600">Medical Test Report</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Report Date</p>
                    <p className="font-semibold text-slate-900">{formatDateTime(selectedTest.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Test Information */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                  Test Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Test Name</p>
                    <p className="font-semibold text-slate-900">{selectedTest.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Test ID</p>
                    <p className="font-mono text-slate-900">{selectedTest.unique_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Result</p>
                    <p className="font-semibold text-slate-900">{selectedTest.result || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Date Performed</p>
                    <p className="text-slate-900">{formatDateTime(selectedTest.created_at)}</p>
                  </div>
                  {patient && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Patient</p>
                      <p className="text-slate-900">{patient.first_name} {patient.last_name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Encounter Information */}
              {loadingTestEncounter ? (
                <div className="mb-6 flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  <span className="ml-2 text-slate-600">Loading encounter details...</span>
                </div>
              ) : testEncounterDetails ? (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                    Encounter Details
                  </h2>
                  
                  <div className="space-y-4">
                    {testEncounterDetails.unique_id && (
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Encounter ID</p>
                        <p className="font-mono text-slate-900">{testEncounterDetails.unique_id}</p>
                      </div>
                    )}
                    
                    {(testEncounterDetails.date || testEncounterDetails.created_at) && (
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Encounter Date</p>
                        <p className="text-slate-900">
                          {formatDateTime(testEncounterDetails.date || testEncounterDetails.created_at || '')}
                        </p>
                      </div>
                    )}

                    {testEncounterDetails.consultation_reason && (
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Consultation Reason</p>
                        <p className="text-slate-900">{testEncounterDetails.consultation_reason}</p>
                      </div>
                    )}

                    {/* Vitals */}
                    {(testEncounterDetails.vitals && Array.isArray(testEncounterDetails.vitals) && testEncounterDetails.vitals.length > 0) || 
                     testEncounterDetails.blood_pressure || testEncounterDetails.heart_rate || testEncounterDetails.temperature || 
                     testEncounterDetails.weight || testEncounterDetails.height || testEncounterDetails.bmi ? (
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">Vital Signs</p>
                        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded">
                          {testEncounterDetails.weight && (
                            <div>
                              <span className="text-xs text-slate-500">Weight: </span>
                              <span className="text-sm font-medium text-slate-900">{testEncounterDetails.weight}</span>
                            </div>
                          )}
                          {testEncounterDetails.height && (
                            <div>
                              <span className="text-xs text-slate-500">Height: </span>
                              <span className="text-sm font-medium text-slate-900">{testEncounterDetails.height}</span>
                            </div>
                          )}
                          {testEncounterDetails.bmi && (
                            <div>
                              <span className="text-xs text-slate-500">BMI: </span>
                              <span className="text-sm font-medium text-slate-900">{testEncounterDetails.bmi}</span>
                            </div>
                          )}
                          {testEncounterDetails.blood_pressure && (
                            <div>
                              <span className="text-xs text-slate-500">Blood Pressure: </span>
                              <span className="text-sm font-medium text-slate-900">{testEncounterDetails.blood_pressure}</span>
                            </div>
                          )}
                          {testEncounterDetails.heart_rate && (
                            <div>
                              <span className="text-xs text-slate-500">Heart Rate: </span>
                              <span className="text-sm font-medium text-slate-900">{testEncounterDetails.heart_rate}</span>
                            </div>
                          )}
                          {testEncounterDetails.temperature && (
                            <div>
                              <span className="text-xs text-slate-500">Temperature: </span>
                              <span className="text-sm font-medium text-slate-900">{testEncounterDetails.temperature}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {/* Symptoms */}
                    {testEncounterDetails.symptoms && (
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Symptoms</p>
                        <p className="text-slate-900">
                          {Array.isArray(testEncounterDetails.symptoms) 
                            ? testEncounterDetails.symptoms.join(', ') 
                            : testEncounterDetails.symptoms}
                        </p>
                      </div>
                    )}

                    {/* Diagnosis */}
                    {testEncounterDetails.diagnosis && (
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Diagnosis</p>
                        <p className="text-slate-900">{testEncounterDetails.diagnosis}</p>
                      </div>
                    )}

                    {/* Summary */}
                    {testEncounterDetails.summary && (
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Summary</p>
                        <p className="text-slate-900 whitespace-pre-wrap">{testEncounterDetails.summary}</p>
                      </div>
                    )}

                    {/* Notes */}
                    {testEncounterDetails.note && (
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Clinical Notes</p>
                        <p className="text-slate-900 whitespace-pre-wrap">{testEncounterDetails.note}</p>
                      </div>
                    )}

                    {/* Follow-up */}
                    {testEncounterDetails.follow_up && (
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Follow-up</p>
                        <p className="text-slate-900">{testEncounterDetails.follow_up}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : selectedTest.encounter ? (
                <div className="mb-6 p-4 bg-slate-50 rounded">
                  <p className="text-sm text-slate-600">
                    Encounter #{selectedTest.encounter} details could not be loaded.
                  </p>
                </div>
              ) : null}

              {/* Footer */}
              <div className="mt-8 pt-6 border-t-2 border-slate-300">
                <div className="text-center text-sm text-slate-600">
                  <p className="mb-2">This is an official medical test report from HELIX EMR</p>
                  <p>Generated on {new Date().toLocaleString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

