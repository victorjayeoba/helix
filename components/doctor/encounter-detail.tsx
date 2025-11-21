'use client'

import { useEffect } from 'react'
import { Loader2, AlertTriangle, Stethoscope, Pill, FlaskRound, ArrowLeft } from 'lucide-react'
import { useEncounterDetailStore } from '@/stores/encounter-detail-store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTabs } from '@/contexts/TabContext'

interface EncounterDetailProps {
  encounterId: number
  patientName?: string
}

export default function EncounterDetail({ encounterId, patientName }: EncounterDetailProps) {
  const { fetchEncounter, encounters, loadingIds, errorById } = useEncounterDetailStore()
  const { closeTab, activeTabId } = useTabs()

  useEffect(() => {
    if (encounterId) {
      fetchEncounter(encounterId)
    }
  }, [encounterId, fetchEncounter])

  // Listen for tab refresh events
  useEffect(() => {
    const handleRefresh = (event: CustomEvent) => {
      if (event.detail.tabType === 'EncounterDetail' && event.detail.tabData?.encounterId === encounterId) {
        fetchEncounter(encounterId, true) // Force refresh
      }
    }
    window.addEventListener('tab-refresh', handleRefresh as EventListener)
    return () => window.removeEventListener('tab-refresh', handleRefresh as EventListener)
  }, [encounterId, fetchEncounter])

  const encounter = encounters[encounterId]
  const isLoading = loadingIds.has(encounterId)
  const error = errorById[encounterId]

  const displayValue = (value?: string | string[] | Record<string, any> | null) => {
    if (Array.isArray(value)) {
      if (value.length === 0) return '-'
      if (typeof value[0] === 'object') {
        return value
          .map((item) =>
            Object.entries(item as Record<string, any>)
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ')
          )
          .join(' | ')
      }
      return value.join(', ')
    }
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')
    }
    if (value === null || value === undefined || `${value}`.trim() === '') {
      return '-'
    }
    return value
  }

  const renderVitals = () => {
    if (!encounter) return null

    const vitals = [
      { label: 'Weight', value: encounter.weight },
      { label: 'Height', value: encounter.height },
      { label: 'BMI', value: encounter.bmi },
      { label: 'Blood Pressure', value: encounter.blood_pressure },
      { label: 'Heart Rate', value: encounter.heart_rate },
      { label: 'Temperature', value: encounter.temperature }
    ]

    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Vitals</h3>
        <div className="grid grid-cols-2 gap-3">
          {vitals.map((vital) => (
            <div key={vital.label}>
              <p className="text-xs text-slate-500">{vital.label}</p>
              <p className="text-sm font-medium text-slate-900">{displayValue(vital.value)}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderMedications = () => {
    if (!encounter) return null

    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Pill className="w-4 h-4 text-helix-primary" />
          <h3 className="text-sm font-semibold text-slate-900">Medications</h3>
        </div>
        {encounter.encounter_medications?.length ? (
          <div className="space-y-3">
            {encounter.encounter_medications.map((med) => (
              <div key={med.id} className="border border-slate-100 rounded-lg p-3">
                <p className="text-sm font-semibold text-slate-900">{displayValue(med.name)}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {displayValue(med.dosage)} · {displayValue(med.frequency)}
                </p>
                <p className="text-xs text-slate-500 mt-1">Duration: {displayValue(med.duration)}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Start: {displayValue(med.start_date)} · End: {displayValue(med.end_date)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">-</p>
        )}
      </div>
    )
  }

  const renderTests = () => {
    if (!encounter) return null

    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <FlaskRound className="w-4 h-4 text-helix-primary" />
          <h3 className="text-sm font-semibold text-slate-900">Tests</h3>
        </div>
        {encounter.encounter_tests?.length ? (
          <div className="space-y-3">
            {encounter.encounter_tests.map((test) => (
              <div key={test.id} className="border border-slate-100 rounded-lg p-3">
                <p className="text-sm font-semibold text-slate-900">{displayValue(test.name)}</p>
                <p className="text-xs text-slate-500 mt-1">Result: {displayValue(test.result)}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Recorded: {displayValue(test.created_at)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">-</p>
        )}
      </div>
    )
  }

  if (isLoading && !encounter) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center">
        <div className="flex flex-col items-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mb-2" />
          Loading encounter details...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center">
        <div className="text-center text-red-600">
          <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
          <p>{error}</p>
          <Button className="mt-3" onClick={() => fetchEncounter(encounterId, true)}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!encounter) {
    return null
  }

  return (
    <div className="flex-1 bg-slate-50 h-full flex flex-col">
      <div className="bg-helix-primary text-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-white/80 uppercase tracking-wide">#{encounter.id}</p>
          <h1 className="text-2xl font-semibold">
            {encounter.encounter_type || 'Encounter'} {patientName ? `• ${patientName}` : ''}
          </h1>
          { (encounter.date || encounter.created_at) && (
            <p className="text-sm text-white/80 mt-1">
              {new Date(encounter.date || encounter.created_at as string).toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>
        <Button
          variant="secondary"
          className="text-helix-primary"
          onClick={() => activeTabId && closeTab(activeTabId)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Close Tab
        </Button>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Stethoscope className="w-4 h-4 text-helix-primary" />
                  <h3 className="text-sm font-semibold text-slate-900">Clinical Summary</h3>
                </div>

                <div className="space-y-3 text-sm text-slate-700">
                  {[
                    { label: 'Reason', value: encounter.consultation_reason },
                    { label: 'Symptoms', value: encounter.symptoms },
                    { label: 'Diagnosis', value: encounter.diagnosis },
                    { label: 'Notes', value: encounter.note },
                    { label: 'Summary', value: encounter.summary },
                    { label: 'Follow-up', value: encounter.follow_up },
                    { label: 'Medical History', value: encounter.medical_history },
                    { label: 'Vital Notes', value: encounter.vitals },
                    { label: 'Tests Summary', value: encounter.tests },
                    { label: 'Medications Summary', value: encounter.medications }
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-slate-500 uppercase">{item.label}</p>
                      <p>{displayValue(item.value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {renderMedications()}
              {renderTests()}
            </div>

            <div className="space-y-4">
              {renderVitals()}
              <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Metadata</h3>
                <div className="space-y-2 text-sm text-slate-700">
                  {[
                    { label: 'Unique ID', value: encounter.unique_id },
                    { label: 'Status', value: encounter.status },
                    { label: 'Provider', value: encounter.provider_name },
                    { label: 'Patient ID', value: encounter.patient?.toString() },
                    { label: 'Created', value: encounter.created_at ? new Date(encounter.created_at).toLocaleString() : null },
                    { label: 'Updated', value: encounter.updated_at ? new Date(encounter.updated_at).toLocaleString() : null }
                  ].map((item) => (
                    <p key={item.label}>
                      <span className="text-xs text-slate-500 uppercase">{item.label}:</span>{' '}
                      {displayValue(item.value)}
                    </p>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-3 text-sm text-slate-700">
                  <p className="text-xs text-slate-500 uppercase mb-1">Encounter Tests Overview</p>
                  <p>{displayValue(encounter.tests)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}


