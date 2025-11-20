'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function CompleteProfilePage() {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    // Basic Info
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    
    // Health Vitals
    height: '',
    weight: '',
    bloodType: '',
    
    // Medical Info
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    
    // Emergency Contact
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: ''
  })

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSkip = () => {
    // Mark profile as complete (skipped) and redirect
    if (user) {
      localStorage.setItem(`profile-complete-${user.uid}`, 'skipped')
    }
    toast.success('Profile setup skipped. You can complete it later from your profile.')
    router.push('/patient-dashboard')
  }

  const handleSubmit = async () => {
    // In a real app, save to Firestore
    try {
      if (user) {
        localStorage.setItem(`profile-complete-${user.uid}`, 'completed')
        // Here you would save formData to Firestore
        console.log('Saving profile data:', formData)
      }
      toast.success('Profile completed successfully!')
      router.push('/patient-dashboard')
    } catch (error) {
      toast.error('Failed to save profile')
    }
  }

  const totalSteps = 4

  return (
    <div className="min-h-screen bg-gradient-to-br from-helix-primary to-helix-secondary flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Profile</h1>
            <p className="text-slate-600">Help us provide better healthcare by sharing some basic information</p>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Step {step} of {totalSteps}</span>
                <Button variant="ghost" size="sm" onClick={handleSkip} className="text-slate-600">
                  Skip for now
                </Button>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-helix-primary transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Basic Information</h2>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+234 123 456 7890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => updateField('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Your full address"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 2: Health Vitals */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Health Vitals</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => updateField('height', e.target.value)}
                    placeholder="170"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => updateField('weight', e.target.value)}
                    placeholder="68"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select value={formData.bloodType} onValueChange={(value) => updateField('bloodType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-sm text-slate-500 mt-4">
                These measurements help doctors provide more accurate diagnoses and treatment plans.
              </p>
            </div>
          )}

          {/* Step 3: Medical History */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Medical History</h2>
              
              <div className="space-y-2">
                <Label htmlFor="allergies">Known Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => updateField('allergies', e.target.value)}
                  placeholder="e.g., Penicillin, Peanuts, Latex (comma separated)"
                  rows={3}
                />
                <p className="text-xs text-slate-500">List any known allergies to medications, foods, or other substances</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chronicConditions">Chronic Conditions</Label>
                <Textarea
                  id="chronicConditions"
                  value={formData.chronicConditions}
                  onChange={(e) => updateField('chronicConditions', e.target.value)}
                  placeholder="e.g., Diabetes, Hypertension, Asthma (comma separated)"
                  rows={3}
                />
                <p className="text-xs text-slate-500">List any ongoing medical conditions you manage</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentMedications">Current Medications</Label>
                <Textarea
                  id="currentMedications"
                  value={formData.currentMedications}
                  onChange={(e) => updateField('currentMedications', e.target.value)}
                  placeholder="List any medications you're currently taking"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Emergency Contact */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Emergency Contact</h2>
              <p className="text-sm text-slate-600 mb-4">
                Who should we contact in case of an emergency?
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Full Name *</Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyName}
                  onChange={(e) => updateField('emergencyName', e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyRelationship">Relationship *</Label>
                <Select value={formData.emergencyRelationship} onValueChange={(value) => updateField('emergencyRelationship', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Phone Number *</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => updateField('emergencyPhone', e.target.value)}
                  placeholder="+234 123 456 7890"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {step < totalSteps ? (
              <Button onClick={handleNext} className="bg-helix-primary">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-helix-primary">
                <Check className="w-4 h-4 mr-2" />
                Complete Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

