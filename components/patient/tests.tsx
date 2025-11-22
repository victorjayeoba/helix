'use client'

import { useState, useEffect } from 'react'
import { FileText, Calendar, Search, Filter, Loader2, RefreshCw, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { getDorraPatientId } from '@/lib/api/patient-mapping'
import { fetchPatientTests, PatientTest } from '@/lib/api/tests'
import { fetchEncounterById, EncounterDetail } from '@/lib/api/encounters'
import { TestReportPDFDownload } from './test-report-pdf'
import { toast } from 'sonner'

interface PatientTestsProps {
  onMobileMenuToggle?: () => void
}

export default function PatientTests({ onMobileMenuToggle }: PatientTestsProps = {}) {
  const { user, userData } = useAuth()
  const [tests, setTests] = useState<PatientTest[]>([])
  const [loading, setLoading] = useState(true)
  const [dorraPatientId, setDorraPatientId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [selectedTest, setSelectedTest] = useState<PatientTest | null>(null)
  const [encounterDetails, setEncounterDetails] = useState<EncounterDetail | null>(null)
  const [loadingEncounter, setLoadingEncounter] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)

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

  // Fetch tests
  const loadTests = async (page = 1, search = '', date = '') => {
    if (!dorraPatientId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await fetchPatientTests(dorraPatientId, {
        page,
        search: search || undefined,
        created_at__date: date || undefined,
        ordering: '-created_at'
      })
      
      setTests(data.results || [])
      setTotalCount(data.count || 0)
      setHasNext(!!data.next)
      setHasPrevious(!!data.previous)
    } catch (error: any) {
      console.error('Error fetching tests:', error)
      toast.error('Failed to load tests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (dorraPatientId) {
      loadTests(currentPage, searchQuery, dateFilter)
    }
  }, [dorraPatientId, currentPage])

  const handleSearch = () => {
    setCurrentPage(1)
    loadTests(1, searchQuery, dateFilter)
  }

  const handleRefresh = () => {
    loadTests(currentPage, searchQuery, dateFilter)
  }

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

  const handleTestClick = async (test: PatientTest) => {
    setSelectedTest(test)
    setReportDialogOpen(true)
    setEncounterDetails(null)

    // Fetch encounter details if encounter ID exists
    if (test.encounter) {
      setLoadingEncounter(true)
      try {
        const encounter = await fetchEncounterById(test.encounter)
        setEncounterDetails(encounter)
      } catch (error: any) {
        console.error('Error fetching encounter details:', error)
        // Don't show error toast, just continue without encounter details
      } finally {
        setLoadingEncounter(false)
      }
    }
  }

  const handleCloseReport = () => {
    setReportDialogOpen(false)
    setSelectedTest(null)
    setEncounterDetails(null)
  }

  if (!dorraPatientId) {
    return (
      <div className="flex-1 bg-white h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto py-8 px-6">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Patient Profile Not Found</h2>
            <p className="text-slate-600">Please complete your profile to view your tests.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-white h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">My Tests</h1>
          <p className="text-sm text-slate-600">View all your medical test results</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search tests by name or result..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="sm:w-48"
              placeholder="Filter by date"
            />
            <Button onClick={handleSearch} variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
            <Button onClick={handleRefresh} variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          {(searchQuery || dateFilter) && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setDateFilter('')
                  setCurrentPage(1)
                  loadTests(1, '', '')
                }}
              >
                Clear filters
              </Button>
              <span className="text-sm text-slate-600">
                {totalCount} test{totalCount !== 1 ? 's' : ''} found
              </span>
            </div>
          )}
        </div>

        {/* Tests List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : tests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Tests Found</h3>
              <p className="text-slate-600">
                {searchQuery || dateFilter
                  ? 'Try adjusting your search or filters'
                  : 'You don\'t have any test results yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => (
              <Card 
                key={test.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleTestClick(test)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{test.name}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(test.created_at)}</span>
                          <span className="text-slate-400">•</span>
                          <span>{formatTime(test.created_at)}</span>
                        </div>
                        {test.unique_id && (
                          <>
                            <span className="text-slate-400">•</span>
                            <span className="font-mono text-xs">ID: {test.unique_id}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wide">Result</span>
                      <p className="text-sm text-slate-900 mt-1 font-medium">{test.result || '—'}</p>
                    </div>
                    {test.encounter && (
                      <div>
                        <span className="text-xs text-slate-500 uppercase tracking-wide">Encounter</span>
                        <p className="text-sm text-slate-600 mt-1">Encounter #{test.encounter}</p>
                      </div>
                    )}
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        View Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {(hasNext || hasPrevious) && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }}
                  disabled={!hasPrevious || loading}
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-600">
                  Page {currentPage} • {totalCount} total
                </span>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentPage((prev) => prev + 1)
                  }}
                  disabled={!hasNext || loading}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Test Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={handleCloseReport}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 print:hidden">
            <DialogHeader>
              <DialogTitle>Test Report</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <div>
                {selectedTest && (
                  <TestReportPDFDownload
                    test={selectedTest}
                    encounter={encounterDetails}
                    patientName={selectedTest?.patient_name || userData?.displayName || undefined}
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
              </div>
              <Button onClick={handleCloseReport} variant="ghost" size="icon">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {selectedTest && (
            <div className="bg-white print-report">
              {/* Report Header */}
              <div className="border-b-2 border-slate-300 pb-6 mb-6 print:border-b-4">
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
                </div>
              </div>

              {/* Encounter Information */}
              {loadingEncounter ? (
                <div className="mb-6 flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  <span className="ml-2 text-slate-600">Loading encounter details...</span>
                </div>
              ) : encounterDetails ? (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                    Encounter Details
                  </h2>
                  
                  <div className="space-y-4">
                    {encounterDetails.unique_id && (
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Encounter ID</p>
                        <p className="font-mono text-slate-900">{encounterDetails.unique_id}</p>
                      </div>
                    )}
                    
                    {(encounterDetails.date || encounterDetails.created_at) && (
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Encounter Date</p>
                        <p className="text-slate-900">
                          {formatDateTime(encounterDetails.date || encounterDetails.created_at || '')}
                        </p>
                      </div>
                    )}

                    {encounterDetails.consultation_reason && (
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Consultation Reason</p>
                        <p className="text-slate-900">{encounterDetails.consultation_reason}</p>
                      </div>
                    )}

                    {/* Vitals */}
                    {(encounterDetails.vitals && Array.isArray(encounterDetails.vitals) && encounterDetails.vitals.length > 0) || 
                     encounterDetails.blood_pressure || encounterDetails.heart_rate || encounterDetails.temperature || 
                     encounterDetails.weight || encounterDetails.height || encounterDetails.bmi ? (
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">Vital Signs</p>
                        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded">
                          {encounterDetails.weight && (
                            <div>
                              <span className="text-xs text-slate-500">Weight: </span>
                              <span className="text-sm font-medium text-slate-900">{encounterDetails.weight}</span>
                            </div>
                          )}
                          {encounterDetails.height && (
                            <div>
                              <span className="text-xs text-slate-500">Height: </span>
                              <span className="text-sm font-medium text-slate-900">{encounterDetails.height}</span>
                            </div>
                          )}
                          {encounterDetails.bmi && (
                            <div>
                              <span className="text-xs text-slate-500">BMI: </span>
                              <span className="text-sm font-medium text-slate-900">{encounterDetails.bmi}</span>
                            </div>
                          )}
                          {encounterDetails.blood_pressure && (
                            <div>
                              <span className="text-xs text-slate-500">Blood Pressure: </span>
                              <span className="text-sm font-medium text-slate-900">{encounterDetails.blood_pressure}</span>
                            </div>
                          )}
                          {encounterDetails.heart_rate && (
                            <div>
                              <span className="text-xs text-slate-500">Heart Rate: </span>
                              <span className="text-sm font-medium text-slate-900">{encounterDetails.heart_rate}</span>
                            </div>
                          )}
                          {encounterDetails.temperature && (
                            <div>
                              <span className="text-xs text-slate-500">Temperature: </span>
                              <span className="text-sm font-medium text-slate-900">{encounterDetails.temperature}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {/* Symptoms */}
                    {encounterDetails.symptoms && (
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Symptoms</p>
                        <p className="text-slate-900">
                          {Array.isArray(encounterDetails.symptoms) 
                            ? encounterDetails.symptoms.join(', ') 
                            : encounterDetails.symptoms}
                        </p>
                      </div>
                    )}

                    {/* Diagnosis */}
                    {encounterDetails.diagnosis && (
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Diagnosis</p>
                        <p className="text-slate-900">{encounterDetails.diagnosis}</p>
                      </div>
                    )}

                    {/* Summary */}
                    {encounterDetails.summary && (
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Summary</p>
                        <p className="text-slate-900 whitespace-pre-wrap">{encounterDetails.summary}</p>
                      </div>
                    )}

                    {/* Notes */}
                    {encounterDetails.note && (
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Clinical Notes</p>
                        <p className="text-slate-900 whitespace-pre-wrap">{encounterDetails.note}</p>
                      </div>
                    )}

                    {/* Follow-up */}
                    {encounterDetails.follow_up && (
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Follow-up</p>
                        <p className="text-slate-900">{encounterDetails.follow_up}</p>
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

