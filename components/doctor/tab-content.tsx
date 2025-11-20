'use client'

import { useTabs } from '@/contexts/TabContext'
import DoctorSchedule from './schedule'
import PatientFinder from './finder'
import Messages from './messages'
import PatientProfile from './patient-profile'
import EncounterDetail from './encounter-detail'

export default function TabContent() {
  const { tabs, activeTabId } = useTabs()
  const activeTab = tabs.find(tab => tab.id === activeTabId)

  if (!activeTab) {
    return (
      <div className="flex-1 bg-white h-full flex items-center justify-center">
        <p className="text-slate-600">No tab selected</p>
      </div>
    )
  }

  switch (activeTab.type) {
    case 'Calendar':
      return <DoctorSchedule />
    case 'Finder':
      return <PatientFinder />
    case 'Messages':
      return <Messages />
    case 'PatientProfile':
      return <PatientProfile patientId={activeTab.data?.patientId} />
    case 'EncounterDetail':
      return (
        <EncounterDetail
          encounterId={activeTab.data?.encounterId}
          patientName={activeTab.data?.patientName}
        />
      )
    default:
      return (
        <div className="flex-1 bg-white h-full p-6">
          <h1 className="text-2xl font-semibold text-slate-900 mb-4">{activeTab.label}</h1>
          <p className="text-slate-600">Content for {activeTab.label} coming soon...</p>
        </div>
      )
  }
}

