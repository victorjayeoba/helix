'use client'

import { Bell, User, Menu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { usePatientTabs } from '@/contexts/PatientTabContext'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const navTabs = [
  'Home',
  'Appointments',
  'Tests',
  'Chat',
  'Find Healthcare'
]

export default function PatientNavigation() {
  const { openTab } = usePatientTabs()
  const { userData } = useAuth()

  const handleNavClick = (tab: string) => {
    openTab(tab, tab)
  }

  return (
    <nav className="bg-slate-700 text-white sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-2.5">
        {/* Logo and Navigation Tabs */}
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold text-white">HELIX</div>
          <div className="hidden md:flex items-center gap-1 overflow-x-auto">
            {navTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleNavClick(tab)}
                className="px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors hover:bg-slate-600 rounded"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-slate-600 rounded-lg transition">
            <Bell className="w-5 h-5 text-white" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
              3
            </Badge>
          </button>
          <Button
            variant="ghost"
            className="flex items-center gap-2 hover:bg-slate-600"
            onClick={() => openTab('Profile', 'My Profile')}
          >
            <User className="w-5 h-5 text-white" />
            <span className="hidden md:inline text-sm">{userData?.displayName || 'Profile'}</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}

