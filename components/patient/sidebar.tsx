'use client'

import { Home, Calendar, MessageSquare, MapPin, User, Bell, LogOut, ChevronLeft, ChevronRight, AlertCircle, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { logOut } from '@/lib/firebase/auth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { useNotifications } from '@/hooks/use-notifications'
import { useAppointments } from '@/hooks/use-appointments'

interface PatientSidebarProps {
  activeView: string
  setActiveView: (view: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen?: boolean
  onMobileToggle?: () => void
}

export default function PatientSidebar({ activeView, setActiveView, collapsed, onToggleCollapse, mobileOpen, onMobileToggle }: PatientSidebarProps) {
  const { userData, user } = useAuth()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const { unreadCount: notificationCount } = useNotifications()
  const { upcomingCount: appointmentCount } = useAppointments()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSignOut = async () => {
    try {
      await logOut()
      toast.success('Signed out successfully')
      router.push('/')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out')
    }
  }

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'appointments', label: 'Appointments', icon: Calendar, badge: appointmentCount },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'find-healthcare', label: 'Find Healthcare', icon: MapPin },
    { id: 'profile', label: 'My Profile', icon: User },
  ]

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile overlay backdrop */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onMobileToggle}
          />
        )}
        
        {/* Mobile sidebar */}
        <div className={`fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img src="/helix.png" alt="Helix Logo" className="h-8 w-auto" />
                  <h1 className="text-2xl font-bold text-helix-primary">ELIX</h1>
                </div>
                <button
                  onClick={onMobileToggle}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 py-4 overflow-y-auto">
              <nav className="px-3 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id)
                        onMobileToggle && onMobileToggle()
                      }}
                      className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                        activeView === item.id
                          ? 'bg-helix-primary text-white'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge className="ml-auto h-5 px-2 bg-red-500 text-white">
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  )
                })}
              </nav>

              {/* Emergency Actions Link */}
              <div className="px-3 mt-6">
                <a
                  href="/actions"
                  className="block w-full px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div className="text-left">
                      <div className="font-semibold text-sm">Emergency Guide</div>
                      <div className="text-xs opacity-80">Life-saving actions</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 space-y-3">
              {/* User Info */}
              <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-helix-primary rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-sm text-slate-900 truncate">
                    {userData?.displayName || 'Patient'}
                  </h2>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveView('notifications')
                  onMobileToggle && onMobileToggle()
                }}
                className="w-full px-4 py-3 rounded-lg flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">Notifications</span>
                {notificationCount > 0 && (
                  <Badge className="ml-auto bg-red-500 text-white">{notificationCount}</Badge>
                )}
              </button>
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-3 rounded-lg flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (collapsed) {
    return (
      <div className="hidden md:flex w-20 bg-white border-r border-slate-200 flex-col h-screen">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <button 
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 py-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full px-4 py-3 flex flex-col items-center justify-center transition-colors relative ${
                  activeView === item.id
                    ? 'text-helix-primary bg-blue-50 border-l-4 border-helix-primary'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <Badge className="absolute top-2 right-2 h-4 w-4 p-0 flex items-center justify-center text-xs bg-red-500">
                    {item.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 space-y-2">
          <button
            onClick={() => setActiveView('notifications')}
            className="w-full p-3 flex items-center justify-center hover:bg-slate-100 rounded-lg transition relative"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {notificationCount > 0 && (
              <Badge className="absolute top-1 right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-red-500">
                {notificationCount}
              </Badge>
            )}
          </button>
          <button
            onClick={handleSignOut}
            className="w-full p-3 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img src="/helix.png" alt="Helix Logo" className="h-8 w-auto" />
            <h1 className="text-2xl font-bold text-helix-primary">ELIX</h1>
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  activeView === item.id
                    ? 'bg-helix-primary text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <Badge className="ml-auto h-5 px-2 bg-red-500 text-white">
                    {item.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>

        {/* Emergency Actions Link */}
        <div className="px-3 mt-6">
          <a
            href="/actions"
            className="block w-full px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-sm">Emergency Guide</div>
                <div className="text-xs opacity-80">Life-saving actions</div>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 space-y-3">
        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl">
          <div className="w-10 h-10 bg-helix-primary rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-slate-900 truncate">
              {userData?.displayName || 'Patient'}
            </h2>
            <p className="text-xs text-slate-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveView('notifications')}
          className="w-full px-4 py-3 rounded-lg flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="font-medium">Notifications</span>
          {notificationCount > 0 && (
            <Badge className="ml-auto bg-red-500 text-white">{notificationCount}</Badge>
          )}
        </button>
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-3 rounded-lg flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  )
}

