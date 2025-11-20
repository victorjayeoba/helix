'use client'

import { Search, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useTabs } from '@/contexts/TabContext'

const navTabs = [
  'Calendar',
  'Finder',
  'Messages'
]

export default function DoctorNavigation() {
  const { openTab } = useTabs()

  const handleNavClick = (tab: string) => {
    // Map tab names to display labels
    const labelMap: Record<string, string> = {
      'Calendar': 'Calendar',
      'Finder': 'Patient Finder',
      'Messages': 'Message Center'
    }
    openTab(tab, labelMap[tab] || tab)
  }

  return (
    <nav className="bg-slate-700 text-white sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-2.5">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
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

        {/* Search and User */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by any demograph"
              className="pl-10 pr-4 w-64 h-9 text-sm bg-white text-slate-900"
            />
          </div>
          <button className="p-2 hover:bg-slate-600 rounded-lg transition">
            <User className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </nav>
  )
}

