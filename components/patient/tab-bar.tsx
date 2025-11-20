'use client'

import { RefreshCw, X } from 'lucide-react'
import { usePatientTabs } from '@/contexts/PatientTabContext'
import { Button } from '@/components/ui/button'

export default function PatientTabBar() {
  const { tabs, activeTabId, closeTab, setActiveTab } = usePatientTabs()

  if (tabs.length === 0) {
    return null
  }

  return (
    <div className="bg-slate-100 border-b border-slate-200 px-4 py-1 flex items-center gap-1 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-t-lg transition-colors whitespace-nowrap ${
            activeTabId === tab.id
              ? 'bg-white border-t border-l border-r border-slate-300 text-slate-900'
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
          }`}
        >
          <button
            onClick={() => setActiveTab(tab.id)}
            className="text-sm font-medium pr-1"
          >
            {tab.label}
          </button>
          {tab.type !== 'Home' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 hover:bg-slate-200 rounded"
                onClick={(e) => {
                  e.stopPropagation()
                  // Refresh functionality - can be implemented later
                }}
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 hover:bg-slate-200 rounded"
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

