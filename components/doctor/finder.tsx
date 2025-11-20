'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePatientsStore } from '@/stores/patients-store'
import { useTabs } from '@/contexts/TabContext'

export default function PatientFinder() {
  const { patients, loading, fetchPatients } = usePatientsStore()
  const { openTab } = useTabs()
  const [searchTerm, setNameSearch] = useState('')
  const [phoneSearch, setPhoneSearch] = useState('')
  const [emailSearch, setEmailSearch] = useState('')
  const [dobSearch, setDobSearch] = useState('')
  const [externalIdSearch, setExternalIdSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  // Listen for tab refresh events
  useEffect(() => {
    const handleRefresh = (event: CustomEvent) => {
      if (event.detail.tabType === 'Finder') {
        fetchPatients(true) // Force refresh
      }
    }
    window.addEventListener('tab-refresh', handleRefresh as EventListener)
    return () => window.removeEventListener('tab-refresh', handleRefresh as EventListener)
  }, [fetchPatients])

  // Filter patients based on search terms
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const fullName = `${patient.last_name}, ${patient.first_name}`.toLowerCase()
      const nameMatch = !searchTerm || fullName.includes(searchTerm.toLowerCase())
      const phoneMatch = !phoneSearch || (patient.phone && patient.phone.toLowerCase().includes(phoneSearch.toLowerCase()))
      const emailMatch = !emailSearch || (patient.email && patient.email.toLowerCase().includes(emailSearch.toLowerCase()))
      const dobMatch = !dobSearch || (patient.date_of_birth && patient.date_of_birth.includes(dobSearch))
      const idMatch = !externalIdSearch || patient.id.toString().includes(externalIdSearch)
      
      return nameMatch && phoneMatch && emailMatch && dobMatch && idMatch
    })
  }, [patients, searchTerm, phoneSearch, emailSearch, dobSearch, externalIdSearch])

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredPatients.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredPatients, currentPage, itemsPerPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, phoneSearch, emailSearch, dobSearch, externalIdSearch])

  return (
    <div className="flex-1 bg-white h-full">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Patient Finder</h1>
          <Button className="bg-helix-primary hover:bg-helix-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add New Patient
          </Button>
        </div>

        {/* Search Fields */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Input 
            type="text" 
            placeholder="Search by Name" 
            value={searchTerm}
            onChange={(e) => setNameSearch(e.target.value)}
          />
          <Input 
            type="text" 
            placeholder="Search by Phone" 
            value={phoneSearch}
            onChange={(e) => setPhoneSearch(e.target.value)}
          />
          <Input 
            type="email" 
            placeholder="Search by Email" 
            value={emailSearch}
            onChange={(e) => setEmailSearch(e.target.value)}
          />
          <Input 
            type="text" 
            placeholder="Search by Date of Birth" 
            value={dobSearch}
            onChange={(e) => setDobSearch(e.target.value)}
          />
          <Input 
            type="text" 
            placeholder="Search by Patient ID" 
            value={externalIdSearch}
            onChange={(e) => setExternalIdSearch(e.target.value)}
          />
        </div>

        {/* Patient Table */}
        {loading ? (
          <div className="border border-slate-200 rounded-lg p-8 text-center text-slate-600">
            Loading patients...
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Full Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Date of Birth</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Patient ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No patients found
                    </td>
                  </tr>
                ) : (
                  paginatedPatients.map((patient) => {
                    const fullName = `${patient.last_name}, ${patient.first_name}`
                    return (
                      <tr key={patient.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              openTab('PatientProfile', fullName, { patientId: patient.id })
                            }}
                            className="text-helix-primary hover:underline font-medium"
                          >
                            {fullName}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {patient.phone || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {patient.email || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {patient.date_of_birth 
                            ? new Date(patient.date_of_birth).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                              })
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {patient.id}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Showing {filteredPatients.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPatients.length)} of {filteredPatients.length} entries
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
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
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

