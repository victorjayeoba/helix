'use client'

import PatientHome from './home'
import PatientAppointments from './appointments'
import PatientTests from './tests'
import PatientChat from './chat'
import FindHealthcare from './find-healthcare'
import PatientProfile from './profile'
import PatientNotifications from './notifications'

interface PatientContentProps {
  activeView: string
  onNavigate?: (view: string) => void
  onMobileMenuToggle?: () => void
}

export default function PatientContent({ activeView, onNavigate, onMobileMenuToggle }: PatientContentProps) {
  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return <PatientHome onNavigate={onNavigate} onMobileMenuToggle={onMobileMenuToggle} />
      case 'appointments':
        return <PatientAppointments onMobileMenuToggle={onMobileMenuToggle} />
      case 'tests':
        return <PatientTests onMobileMenuToggle={onMobileMenuToggle} />
      case 'chat':
        return <PatientChat onMobileMenuToggle={onMobileMenuToggle} />
      case 'find-healthcare':
        return <FindHealthcare onMobileMenuToggle={onMobileMenuToggle} />
      case 'profile':
        return <PatientProfile onMobileMenuToggle={onMobileMenuToggle} />
      case 'notifications':
        return <PatientNotifications onMobileMenuToggle={onMobileMenuToggle} />
      default:
        return <PatientHome onNavigate={onNavigate} onMobileMenuToggle={onMobileMenuToggle} />
    }
  }

  return (
    <div className="flex-1 overflow-hidden w-full min-h-0">
      {renderContent()}
    </div>
  )
}

