'use client'

import { useState, useEffect, useMemo } from 'react'
import { RefreshCw, Search, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppointmentsStore } from '@/stores/appointments-store'
import { usePatientsStore } from '@/stores/patients-store'
import { useTabs } from '@/contexts/TabContext'
import { Appointment } from '@/lib/api/appointments'

export default function AppointmentsList() {
  const { appointments, loading, fetchAppointments } = useAppointmentsStore()
  const { patients } = usePatientsStore()
  const { openTab } = useTabs()
  const [searchTerm, setSearchTerm] = useState('')
  const [patientIdSearch, setPatientIdSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // Listen for tab refresh events
  useEffect(() => {
    const handleRefresh = (event: CustomEvent) => {
      if (event.detail.tabType === 'Appointments') {
        fetchAppointments(true) // Force refresh
      }
    }
    window.addEventListener('tab-refresh', handleRefresh as EventListener)
    return () => window.removeEventListener('tab-refresh', handleRefresh as EventListener)
  }, [fetchAppointments])

  // Create patient map for quick lookup
  const patientMap = useMemo(() => {
    const map = new Map<number, typeof patients[number]>()
    patients.forEach((patient) => {
      map.set(patient.id, patient)
    })
    return map
  }, [patients])

  const getPatientName = (patientId: number) => {
    const patient = patientMap.get(patientId)
    if (!patient) return `Patient #${patientId}`
    return `${patient.last_name}, ${patient.first_name}`
  }

  // Filter appointments based on search
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const patientName = getPatientName(appointment.patient).toLowerCase()
      const nameMatch = !searchTerm || patientName.includes(searchTerm.toLowerCase())
      const idMatch = !patientIdSearch || appointment.patient.toString().includes(patientIdSearch)
      return nameMatch && idMatch
    })
  }, [appointments, searchTerm, patientIdSearch, patientMap])

  // Pagination
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage)
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAppointments.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAppointments, currentPage, itemsPerPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, patientIdSearch])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleRefresh = () => {
    fetchAppointments(true)
  }

  return (
    <div className="flex-1 bg-white h-full overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Appointments</h1>
            <p className="text-sm text-slate-600 mt-1">
              View and search all appointments
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Search Fields */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by Patient ID..."
              value={patientIdSearch}
              onChange={(e) => setPatientIdSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Appointments Table */}
        {loading && appointments.length === 0 ? (
          <div className="border border-slate-200 rounded-lg p-8 text-center text-slate-600">
            Loading appointments...
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Date & Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Patient</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Patient ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Reason</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      {searchTerm || patientIdSearch ? 'No appointments found matching your search' : 'No appointments found'}
                    </td>
                  </tr>
                ) : (
                  paginatedAppointments.map((appointment: Appointment) => {
                    const patientName = getPatientName(appointment.patient)
                    return (
                      <tr key={appointment.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {formatDate(appointment.date)}
                              </div>
                              <div className="text-xs text-slate-500">
                                {formatTime(appointment.date)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              openTab('PatientProfile', patientName, { patientId: appointment.patient })
                            }}
                            className="text-helix-primary hover:underline font-medium flex items-center gap-2"
                          >
                            <User className="w-4 h-4" />
                            {patientName}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {appointment.patient}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {appointment.reason || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-1 rounded font-medium ${
                              appointment.status === 'active'
                                ? 'bg-blue-100 text-blue-700'
                                : appointment.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : appointment.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing {filteredAppointments.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} of{' '}
              {filteredAppointments.length} appointments
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              {totalPages > 10 && <span className="text-sm text-slate-600">...</span>}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

