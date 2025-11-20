'use client'

import { usePatientTabs } from '@/contexts/PatientTabContext'
import PatientHome from './home'
import PatientAppointments from './appointments'
import PatientChat from './chat'
import FindHealthcare from './find-healthcare'
import PatientProfile from './profile'

export default function PatientTabContent() {
  const { tabs, activeTabId } = usePatientTabs()
  const activeTab = tabs.find(tab => tab.id === activeTabId)

  if (!activeTab) {
    return (
      <div className="flex-1 bg-white h-full flex items-center justify-center">
        <p className="text-slate-600">No tab selected</p>
      </div>
    )
  }

  switch (activeTab.type) {
    case 'Home':
      return <PatientHome />
    case 'Appointments':
      return <PatientAppointments />
    case 'Chat':
      return <PatientChat />
    case 'Find Healthcare':
      return <FindHealthcare />
    case 'Profile':
      return <PatientProfile />
    default:
      return (
        <div className="flex-1 bg-white h-full p-6">
          <h1 className="text-2xl font-semibold text-slate-900 mb-4">{activeTab.label}</h1>
          <p className="text-slate-600">Content for {activeTab.label} coming soon...</p>
        </div>
      )
  }
}

