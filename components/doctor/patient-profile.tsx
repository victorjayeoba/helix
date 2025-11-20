'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePatientsStore } from '@/stores/patients-store'
import { useAppointmentsStore } from '@/stores/appointments-store'
import { Appointment } from '@/lib/api/appointments'

interface PatientProfileProps {
  patientId: number
}

export default function PatientProfile({ patientId }: PatientProfileProps) {
  const { patients, fetchPatients } = usePatientsStore()
  const { appointments } = useAppointmentsStore()
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    if (patients.length === 0) {
      fetchPatients()
    }
  }, [patients.length, fetchPatients])

  useEffect(() => {
    // Filter appointments for this patient
    const filtered = appointments.filter(app => app.patient === patientId)
    setPatientAppointments(filtered)
  }, [appointments, patientId])

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

          {/* Appointments History */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Appointment History</h2>
            {patientAppointments.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-8">
                No appointments found
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {patientAppointments
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-900">
                            {formatDate(appointment.date)} at {formatTime(appointment.date)}
                          </div>
                          <div className="text-sm text-slate-600 mt-1">
                            {appointment.reason}
                          </div>
                          {appointment.summary && (
                            <div className="text-xs text-slate-500 mt-1">
                              {appointment.summary}
                            </div>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ml-2 ${
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
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

