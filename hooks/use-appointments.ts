import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getDorraPatientId } from '@/lib/api/patient-mapping'
import { Appointment } from '@/lib/api/appointments'

export const useAppointments = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [upcomingCount, setUpcomingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchAppointments = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const patientId = await getDorraPatientId(user.uid)
      if (!patientId) {
        setLoading(false)
        return
      }

      const response = await fetch(`/api/patients/${patientId}/appointments`)
      if (!response.ok) throw new Error('Failed to fetch appointments')

      const data = await response.json()
      const appointmentsList: Appointment[] = data.results || []
      
      setAppointments(appointmentsList)
      
      // Count upcoming appointments
      const now = new Date()
      const upcoming = appointmentsList.filter(apt => 
        new Date(apt.date) > now && apt.status === 'active'
      )
      setUpcomingCount(upcoming.length)
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [user])

  return {
    appointments,
    upcomingCount,
    loading,
    refetch: fetchAppointments
  }
}


