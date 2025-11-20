'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export interface Tab {
  id: string
  label: string
  type: string
  data?: any // For passing additional data like patientId
}

interface TabContextType {
  tabs: Tab[]
  activeTabId: string | null
  openTab: (type: string, label: string, data?: any) => void
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

export const useTabs = () => {
  const context = useContext(TabContext)
  if (!context) {
    throw new Error('useTabs must be used within a TabProvider')
  }
  return context
}

export function TabProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'calendar-1', label: 'Calendar', type: 'Calendar' }
  ])
  const [activeTabId, setActiveTabId] = useState<string | null>('calendar-1')

  const openTab = (type: string, label: string, data?: any) => {
    // For patient profile, check if tab with same patientId exists
    if (type === 'PatientProfile' && data?.patientId) {
      const existingTab = tabs.find(tab => 
        tab.type === type && tab.data?.patientId === data.patientId
      )
      if (existingTab) {
        setActiveTabId(existingTab.id)
        return
      }
    } else {
      // Check if tab already exists (for other types)
      const existingTab = tabs.find(tab => tab.type === type && !tab.data)
      if (existingTab) {
        setActiveTabId(existingTab.id)
        return
      }
    }

    // Create new tab
    const newTab: Tab = {
      id: `${type.toLowerCase()}-${Date.now()}`,
      label,
      type,
      data
    }
    setTabs([...tabs, newTab])
    setActiveTabId(newTab.id)
  }

  const closeTab = (id: string) => {
    const newTabs = tabs.filter(tab => tab.id !== id)
    setTabs(newTabs)
    
    // If closing active tab, switch to another tab
    if (activeTabId === id) {
      if (newTabs.length > 0) {
        setActiveTabId(newTabs[newTabs.length - 1].id)
      } else {
        setActiveTabId(null)
      }
    }
  }

  const setActiveTab = (id: string) => {
    setActiveTabId(id)
  }

  return (
    <TabContext.Provider value={{ tabs, activeTabId, openTab, closeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  )
}

