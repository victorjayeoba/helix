import { create } from 'zustand'

interface CalendarState {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (date: Date) => set({ selectedDate: date })
}))

