'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { TabProvider } from '@/contexts/TabContext'
import DoctorNavigation from '@/components/doctor/navigation'
import TabBar from '@/components/doctor/tab-bar'
import DoctorSidebar from '@/components/doctor/sidebar'
import TabContent from '@/components/doctor/tab-content'

export default function DoctorDashboard() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading) {
      if (!user) {
        console.log('No user, redirecting to home')
        router.push('/')
      } else if (userData?.userType !== 'doctor') {
        console.log('User is not a doctor, userType:', userData?.userType)
        router.push('/')
      }
    }
  }, [user, userData, loading, router, mounted])

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

  if (userData?.userType !== 'doctor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">
          Access denied. This dashboard is for doctors only. Your account type: {userData?.userType || 'unknown'}
        </div>
      </div>
    )
  }

  return (
    <TabProvider>
      <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
        <DoctorNavigation />
        <TabBar />
        <div className="flex flex-1 overflow-hidden min-h-0">
          <DoctorSidebar 
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <TabContent />
        </div>
      </div>
    </TabProvider>
  )
}

