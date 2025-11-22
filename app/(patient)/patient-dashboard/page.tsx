'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import PatientSidebar from '@/components/patient/sidebar'
import PatientContent from '@/components/patient/content'

export default function PatientDashboard() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeView, setActiveView] = useState('home')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading) {
      if (!user) {
        console.log('No user, redirecting to home')
        router.push('/')
      } else if (userData?.userType !== 'patient') {
        console.log('User is not a patient, userType:', userData?.userType)
        router.push('/')
      }
    }
  }, [user, userData, loading, router, mounted])

  // Check if profile is incomplete and redirect to onboarding
  useEffect(() => {
    if (mounted && user && userData?.userType === 'patient') {
      // Check if profile is complete (you can customize this check)
      const profileComplete = localStorage.getItem(`profile-complete-${user.uid}`)
      if (!profileComplete) {
        router.push('/patient/complete-profile')
      }
    }
  }, [mounted, user, userData, router])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading dashboard...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Please sign in to access the dashboard</div>
      </div>
    )
  }

  if (userData?.userType !== 'patient') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">
          Access denied. This dashboard is for patients only. Your account type: {userData?.userType || 'unknown'}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      <PatientSidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />
      <PatientContent 
        activeView={activeView}
        onNavigate={setActiveView}
        onMobileMenuToggle={() => setMobileMenuOpen(true)}
      />
    </div>
  )
}

