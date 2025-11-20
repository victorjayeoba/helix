'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export interface PatientTab {
  id: string
  label: string
  type: string
  data?: any
}

interface PatientTabContextType {
  tabs: PatientTab[]
  activeTabId: string | null
  openTab: (type: string, label: string, data?: any) => void
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void
}

const PatientTabContext = createContext<PatientTabContextType | undefined>(undefined)

export const usePatientTabs = () => {
  const context = useContext(PatientTabContext)
  if (!context) {
    throw new Error('usePatientTabs must be used within a PatientTabProvider')
  }
  return context
}

export function PatientTabProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<PatientTab[]>([
    { id: 'home-1', label: 'Home', type: 'Home' }
  ])
  const [activeTabId, setActiveTabId] = useState<string | null>('home-1')

  const openTab = (type: string, label: string, data?: any) => {
    // Check if tab already exists
    const existingTab = tabs.find(tab => tab.type === type && !tab.data)
    if (existingTab) {
      setActiveTabId(existingTab.id)
      return
    }

    // Create new tab
    const newTab: PatientTab = {
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
    <PatientTabContext.Provider value={{ tabs, activeTabId, openTab, closeTab, setActiveTab }}>
      {children}
    </PatientTabContext.Provider>
  )
}

