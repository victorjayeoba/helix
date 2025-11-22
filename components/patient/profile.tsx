'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, Calendar, MapPin, Activity, AlertCircle, Edit, Menu, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { getFirestore, getDoc, doc } from 'firebase/firestore'
import { getDorraPatientId } from '@/lib/api/patient-mapping'

interface PatientProfileProps {
  onMobileMenuToggle?: () => void
}

interface PatientProfileData {
  height?: string
  weight?: string
  bloodType?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  allergies?: string[]
  chronicConditions?: string
  currentMedications?: string
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
}

export default function PatientProfile({ onMobileMenuToggle }: PatientProfileProps = {}) {
  const { userData, user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [patientData, setPatientData] = useState<PatientProfileData>({})
  const [dorraPatientId, setDorraPatientId] = useState<number | null>(null)

  // Fetch patient profile from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Get Dorra patient ID
        const patientId = await getDorraPatientId(user.uid)
        setDorraPatientId(patientId)

        // Get profile data from Firestore
        const db = getFirestore()
        const profileDoc = await getDoc(doc(db, 'patientProfiles', user.uid))

        if (profileDoc.exists()) {
          setPatientData(profileDoc.data() as PatientProfileData)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  return (
    <div className="flex-1 bg-slate-50 h-full overflow-y-auto">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <img src="/helix.png" alt="Helix Logo" className="h-6 w-auto" />
          <h1 className="text-xl font-bold text-helix-primary">ELIX</h1>
        </div>
        <button
          onClick={onMobileMenuToggle}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <Menu className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      <div className="p-4 md:p-6 bg-slate-50">
        {/* Header */}
        <div className="bg-helix-primary text-white p-4 md:p-6 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">{userData?.displayName || 'Patient'}</h1>
            <p className="text-sm text-white/80 mt-1">
              Patient ID: {dorraPatientId ? `#${dorraPatientId}` : 'Not assigned'}
            </p>
          </div>
          <Button
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={() => router.push('/patient/complete-profile')}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-helix-primary" />
          </div>
        ) : (
          <>
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Your personal contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-xs text-slate-500">Email</div>
                <div className="text-sm text-slate-900">{user?.email || 'Not provided'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-xs text-slate-500">Phone</div>
                <div className="text-sm text-slate-900">{patientData.phone || 'Not provided'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-xs text-slate-500">Address</div>
                <div className="text-sm text-slate-900">{patientData.address || 'Not provided'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Information */}
        <Card>
          <CardHeader>
            <CardTitle>Health Information</CardTitle>
            <CardDescription>Your medical vitals and information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Height</div>
                <div className="text-lg font-semibold text-slate-900">{patientData.height ? `${patientData.height} cm` : 'N/A'}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Weight</div>
                <div className="text-lg font-semibold text-slate-900">{patientData.weight ? `${patientData.weight} kg` : 'N/A'}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Blood Type</div>
                <div className="text-lg font-semibold text-slate-900">{patientData.bloodType || 'N/A'}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">BMI</div>
                <div className="text-lg font-semibold text-slate-900">
                  {patientData.height && patientData.weight
                    ? ((parseFloat(patientData.weight) / Math.pow(parseFloat(patientData.height) / 100, 2)).toFixed(1))
                    : 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Conditions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Allergies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patientData.allergies && patientData.allergies.length > 0 ? (
                <div className="space-y-2">
                  {patientData.allergies.map((allergy, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl"
                    >
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-900 font-medium">{allergy}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No known allergies</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Chronic Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patientData.chronicConditions ? (
                <div className="space-y-2">
                  {patientData.chronicConditions.split(',').map((condition, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl"
                    >
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-blue-900 font-medium">{condition.trim()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No chronic conditions</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
            <CardDescription>Person to contact in case of emergency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {patientData.emergencyContact ? (
              <>
                <div>
                  <div className="text-xs text-slate-500">Name</div>
                  <div className="text-sm font-medium text-slate-900">{patientData.emergencyContact.name || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Relationship</div>
                  <div className="text-sm font-medium text-slate-900">{patientData.emergencyContact.relationship || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Phone Number</div>
                  <div className="text-sm font-medium text-slate-900">{patientData.emergencyContact.phone || 'Not provided'}</div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">No emergency contact provided</p>
            )}
          </CardContent>
        </Card>
          </>
        )}
      </div>
    </div>
  )
}

