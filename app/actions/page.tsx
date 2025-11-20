'use client'

import { useState, useEffect } from 'react'
import { Heart, Droplet, Activity, Brain, AlertTriangle, Phone, Clock, CheckCircle2, ChevronRight, ChevronLeft, MapPin, Navigation as NavigationIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Navigation from '@/components/landing/navigation'

interface EmergencyAction {
  id: string
  icon: any
  title: string
  description: string
  color: string
  iconBg: string
  iconColor: string
  warningText: string
  steps: {
    title: string
    description: string
    important?: boolean
  }[]
  tips?: string[]
  whenToCall911: string[]
}

export default function EmergencyActionsPage() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Scroll progress for this page
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const maxScroll = documentHeight - windowHeight
      const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial call
    return () => window.removeEventListener('scroll', handleScroll)
  }, [selectedAction]) // Re-run when selectedAction changes to recalculate

  const emergencyActions: EmergencyAction[] = [
    {
      id: 'cpr',
      icon: Heart,
      title: 'CPR (Cardiopulmonary Resuscitation)',
      description: 'Learn how to perform CPR on adults',
      color: 'from-red-500 to-red-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      warningText: 'Only perform CPR if the person is unresponsive and not breathing normally',
      steps: [
        {
          title: 'Call Emergency Services',
          description: 'Call 911 or your local emergency number immediately. Put phone on speaker if alone.',
          important: true
        },
        {
          title: 'Check Responsiveness',
          description: 'Tap the person\'s shoulder firmly and shout "Are you okay?" Check for normal breathing.'
        },
        {
          title: 'Position the Person',
          description: 'Lay the person flat on their back on a firm surface. Kneel beside their chest.'
        },
        {
          title: 'Hand Placement',
          description: 'Place the heel of one hand on the center of the chest (lower half of breastbone). Place your other hand on top and interlock fingers.'
        },
        {
          title: 'Perform Chest Compressions',
          description: 'Push hard and fast - at least 2 inches deep. Compress at a rate of 100-120 per minute (like the beat of "Stayin\' Alive"). Allow chest to fully recoil between compressions.',
          important: true
        },
        {
          title: 'Continue Until Help Arrives',
          description: 'Continue compressions until emergency responders arrive or the person starts breathing normally. If possible, switch with another person every 2 minutes to avoid fatigue.'
        }
      ],
      tips: [
        'Use your body weight, not just your arms',
        'Keep your arms straight',
        'Don\'t stop compressions unless absolutely necessary',
        'If trained, give 2 rescue breaths after every 30 compressions'
      ],
      whenToCall911: [
        'Person is unresponsive',
        'Not breathing or only gasping',
        'No pulse detected'
      ]
    },
    {
      id: 'stop-bleeding',
      icon: Droplet,
      title: 'Stop Severe Bleeding',
      description: 'Control life-threatening bleeding',
      color: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      warningText: 'Severe bleeding can be life-threatening. Act quickly and calmly',
      steps: [
        {
          title: 'Ensure Safety',
          description: 'Make sure the scene is safe for you and the injured person. Wear gloves if available.',
          important: true
        },
        {
          title: 'Call Emergency Services',
          description: 'Call 911 immediately for severe bleeding that won\'t stop.'
        },
        {
          title: 'Apply Direct Pressure',
          description: 'Place a clean cloth or sterile bandage directly on the wound. Press firmly and continuously for 10-15 minutes without checking if bleeding has stopped.',
          important: true
        },
        {
          title: 'Maintain Pressure',
          description: 'If blood soaks through, add more cloth on top without removing the original. Keep applying firm pressure.'
        },
        {
          title: 'Elevate if Possible',
          description: 'If there\'s no suspected fracture, raise the injured area above heart level while maintaining pressure.'
        },
        {
          title: 'Apply Pressure to Artery',
          description: 'If bleeding doesn\'t stop, apply pressure to the artery between the wound and heart using your fingers.'
        },
        {
          title: 'Use a Tourniquet (Last Resort)',
          description: 'Only if bleeding is life-threatening and can\'t be controlled: Apply tourniquet 2-3 inches above wound (not on joint). Tighten until bleeding stops. Note the time applied.'
        }
      ],
      tips: [
        'Never remove the first bandage - add more on top',
        'Don\'t use a tourniquet unless absolutely necessary',
        'Keep the person warm and lying down',
        'Monitor for signs of shock'
      ],
      whenToCall911: [
        'Bleeding won\'t stop after 10 minutes of pressure',
        'Blood is spurting from wound',
        'Wound is from a major injury',
        'Person shows signs of shock'
      ]
    },
    {
      id: 'seizure',
      icon: Activity,
      title: 'Seizure Response',
      description: 'Help someone having a seizure',
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      warningText: 'Most seizures end on their own within 1-2 minutes',
      steps: [
        {
          title: 'Stay Calm and Time It',
          description: 'Note the time the seizure starts. Most seizures last less than 2 minutes.',
          important: true
        },
        {
          title: 'Protect from Injury',
          description: 'Clear the area of hard or sharp objects. Guide the person to the floor if they\'re standing.'
        },
        {
          title: 'Cushion the Head',
          description: 'Place something soft under their head (jacket, pillow, or your hands).'
        },
        {
          title: 'Turn on Side',
          description: 'If possible, gently turn the person onto their side. This helps keep their airway clear and allows fluids to drain.',
          important: true
        },
        {
          title: 'Loosen Tight Clothing',
          description: 'Loosen anything around the neck that might restrict breathing.'
        },
        {
          title: 'Stay with Them',
          description: 'Stay with the person until they are fully awake and aware. Speak calmly and be reassuring as they regain consciousness.'
        },
        {
          title: 'After the Seizure',
          description: 'Let them rest. They may be confused or tired. Don\'t give them anything to eat or drink until fully alert.'
        }
      ],
      tips: [
        'DO NOT put anything in their mouth',
        'DO NOT try to hold them down or stop movements',
        'DO NOT give them water or food during seizure',
        'Time the seizure duration'
      ],
      whenToCall911: [
        'Seizure lasts more than 5 minutes',
        'Person has difficulty breathing after seizure',
        'Person doesn\'t regain consciousness',
        'Another seizure starts right after',
        'Person is injured during seizure',
        'First time having a seizure',
        'Person is pregnant or has diabetes'
      ]
    },
    {
      id: 'heart-attack',
      icon: Heart,
      title: 'Heart Attack Response',
      description: 'Recognize and respond to heart attack symptoms',
      color: 'from-pink-500 to-pink-600',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
      warningText: 'Time is critical - every minute matters in a heart attack',
      steps: [
        {
          title: 'Recognize the Signs',
          description: 'Common symptoms: chest pain/discomfort, shortness of breath, pain in arms/neck/jaw/back, cold sweat, nausea, lightheadedness.',
          important: true
        },
        {
          title: 'Call Emergency Services Immediately',
          description: 'Call 911 right away. Don\'t wait to see if symptoms go away. Don\'t drive to the hospital yourself.',
          important: true
        },
        {
          title: 'Have Person Sit Down',
          description: 'Help them into a comfortable position, usually sitting up or semi-reclined. This makes breathing easier.'
        },
        {
          title: 'Loosen Tight Clothing',
          description: 'Loosen any tight clothing, especially around the neck, chest, and waist.'
        },
        {
          title: 'Give Aspirin if Available',
          description: 'If not allergic and no contraindications, have them chew 1 regular-strength aspirin (or 4 baby aspirin). This helps prevent blood clotting.'
        },
        {
          title: 'Stay Calm and Monitor',
          description: 'Keep the person calm and reassured. Monitor their breathing and consciousness until help arrives.'
        },
        {
          title: 'Be Ready for CPR',
          description: 'If the person becomes unresponsive and stops breathing normally, begin CPR immediately.'
        }
      ],
      tips: [
        'Act fast - don\'t "wait and see"',
        'Symptoms can be different in women',
        'Have the person rest, don\'t let them move around',
        'Note when symptoms started'
      ],
      whenToCall911: [
        'Any suspected heart attack symptoms',
        'Chest pain lasting more than a few minutes',
        'Chest discomfort that goes away and comes back',
        'Pain combined with shortness of breath, sweating, or nausea'
      ]
    },
    {
      id: 'stroke',
      icon: Brain,
      title: 'Stroke - Act F.A.S.T',
      description: 'Recognize and respond to stroke symptoms',
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      warningText: 'Stroke is a medical emergency - every second counts',
      steps: [
        {
          title: 'Remember F.A.S.T',
          description: 'Face drooping: Ask person to smile. Is one side drooping?\nArm weakness: Ask person to raise both arms. Does one drift down?\nSpeech difficulty: Ask person to repeat a simple phrase. Is speech slurred?\nTime to call 911: If any of these signs are present, call immediately.',
          important: true
        },
        {
          title: 'Call 911 Immediately',
          description: 'Call emergency services right away. Note the time symptoms started - this information is crucial for treatment.',
          important: true
        },
        {
          title: 'Keep Person Comfortable',
          description: 'Have them lie down with head and shoulders slightly elevated. Turn head to side if vomiting.'
        },
        {
          title: 'Don\'t Give Anything',
          description: 'Do NOT give the person anything to eat or drink. Stroke can affect ability to swallow.'
        },
        {
          title: 'Loosen Tight Clothing',
          description: 'Loosen any constrictive clothing to help them breathe easier.'
        },
        {
          title: 'Monitor and Reassure',
          description: 'Stay with the person. Monitor their breathing and level of consciousness. Remain calm and reassuring.'
        },
        {
          title: 'Note All Symptoms',
          description: 'Write down all symptoms and when they started. This information helps medical professionals.'
        }
      ],
      tips: [
        'Time is brain - act immediately',
        'Don\'t let person fall asleep',
        'Never give aspirin unless told to by 911 dispatcher',
        'Treatment is most effective within first 3 hours'
      ],
      whenToCall911: [
        'ANY sign of stroke (F.A.S.T)',
        'Sudden numbness or weakness',
        'Sudden confusion or trouble speaking',
        'Sudden trouble seeing',
        'Sudden severe headache',
        'Sudden trouble walking or loss of balance'
      ]
    },
    {
      id: 'choking',
      icon: AlertTriangle,
      title: 'Choking - Heimlich Maneuver',
      description: 'Help someone who is choking',
      color: 'from-yellow-500 to-yellow-600',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      warningText: 'If person can cough forcefully, encourage coughing. Only intervene if they cannot breathe, cough, or speak',
      steps: [
        {
          title: 'Assess the Situation',
          description: 'Ask "Are you choking?" If they can\'t speak, cough effectively, or breathe, they need immediate help.',
          important: true
        },
        {
          title: 'Call for Help',
          description: 'Have someone call 911 while you perform first aid. If alone, perform maneuver first.'
        },
        {
          title: 'Position Yourself',
          description: 'Stand behind the person. Place one foot slightly in front for balance. For a small person or child, kneel down.'
        },
        {
          title: 'Make a Fist',
          description: 'Make a fist with one hand. Place the thumb side of your fist against the person\'s abdomen, just above the navel and below the rib cage.'
        },
        {
          title: 'Grasp Your Fist',
          description: 'Grasp your fist with your other hand. Keep elbows bent and arms away from their rib cage.'
        },
        {
          title: 'Perform Thrusts',
          description: 'Give quick, upward thrusts into the abdomen. Each thrust should be a separate, distinct movement. The goal is to create enough force to dislodge the object.',
          important: true
        },
        {
          title: 'Repeat Until Clear',
          description: 'Continue abdominal thrusts until the object is expelled or person becomes unconscious. If object comes out, have them checked by medical professional.'
        },
        {
          title: 'If Person Becomes Unconscious',
          description: 'Lower them to the ground carefully. Begin CPR starting with chest compressions. Check mouth for object before giving breaths.'
        }
      ],
      tips: [
        'Thrusts should be forceful and upward',
        'Don\'t do abdominal thrusts on infants under 1 year',
        'For pregnant or obese person, do chest thrusts instead',
        'Person should see a doctor even if choking resolved'
      ],
      whenToCall911: [
        'Person cannot breathe, cough, or speak',
        'Choking object doesn\'t come out quickly',
        'Person becomes unconscious',
        'After choking is resolved (for medical evaluation)'
      ]
    }
  ]

  const selectedActionData = emergencyActions.find(a => a.id === selectedAction)

  // Render selected action details
  const renderActionDetails = () => {
    if (!selectedActionData) return null
    const Icon = selectedActionData.icon
    
    return (
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className={`bg-linear-to-r ${selectedActionData.color} text-white py-6 px-6`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{selectedActionData.title}</h1>
                <p className="text-white/90 mt-1">{selectedActionData.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Warning Card */}
          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Important</h3>
                  <p className="text-sm text-red-800">{selectedActionData.warningText}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* When to Call 911 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-bold text-slate-900">When to Call 911</h2>
              </div>
              <ul className="space-y-2">
                {selectedActionData.whenToCall911.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0.5">•</span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Steps */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Step-by-Step Instructions</h2>
            <div className="space-y-4">
              {selectedActionData.steps.map((step, index) => (
                <Card key={index} className={step.important ? 'border-2 border-red-200' : ''}>
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        step.important ? 'bg-red-600 text-white' : 'bg-helix-primary text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-slate-900 mb-2 flex items-center gap-2">
                          {step.title}
                          {step.important && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                              Critical
                            </span>
                          )}
                        </h3>
                        <p className="text-slate-700 whitespace-pre-line">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Tips */}
          {selectedActionData.tips && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Important Tips
                </h3>
                <ul className="space-y-2">
                  {selectedActionData.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-blue-900">
                      <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <Card className="border-slate-300">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-slate-600">
                <strong>Disclaimer:</strong> This guide is for educational purposes only and does not replace professional medical training. 
                Always call emergency services in a medical emergency. Consider taking a certified first aid course.
              </p>
          </CardContent>
        </Card>
      </div>
      </div>
    )
  }

  // Render all emergency cards
  const renderAllCards = () => {
    return (
      <div className="h-full overflow-y-auto bg-slate-50">
        {/* Header */}
        <div className="bg-linear-to-r from-red-600 to-red-700 text-white py-8 px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Emergency Action Guides</h1>
            <p className="text-lg text-white/90">
              Step-by-step instructions for common medical emergencies. Learn life-saving skills.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Warning Card */}
          <Card className="border-2 border-yellow-300 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-700 shrink-0" />
                <div>
                  <h2 className="font-bold text-yellow-900 mb-2">Always Call Emergency Services</h2>
                  <p className="text-sm text-yellow-800">
                    These guides are supplementary. In any serious emergency, call 911 or your local emergency number first. 
                    These techniques should not replace professional medical care or certified training.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hospital Locator Card */}
          <Card className="border-2 border-blue-300 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <MapPin className="w-6 h-6 text-blue-700 shrink-0" />
                  <div>
                    <h2 className="font-bold text-blue-900 mb-2">Find Nearest Hospital</h2>
                    <p className="text-sm text-blue-800 mb-3">
                      Locate emergency services and hospitals near you instantly.
                    </p>
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <NavigationIcon className="w-4 h-4 mr-2" />
                  Find Hospitals
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {emergencyActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  onClick={() => setSelectedAction(action.id)}
                  className="group text-left"
                >
                  <Card className="h-full hover:shadow-xl transition-all border-2 hover:border-slate-300">
                    <CardContent className="p-6">
                      <div className={`${action.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-7 h-7 ${action.iconColor}`} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{action.title}</h3>
                      <p className="text-slate-600 mb-4">{action.description}</p>
                      <div className="flex items-center text-helix-primary font-medium text-sm group-hover:gap-2 transition-all">
                        View Guide
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                    <div className={`h-1 bg-linear-to-r ${action.color}`}></div>
                  </Card>
                </button>
              )
            })}
          </div>

          {/* Call to Action */}
          <Card className="bg-helix-primary text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-3">Get Certified in First Aid</h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                While these guides provide valuable information, nothing replaces hands-on training. 
                Consider taking a certified first aid and CPR course from organizations like the Red Cross or St. John Ambulance.
              </p>
              <Button className="bg-white text-helix-primary hover:bg-slate-100">
                Find Training Near You
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main dashboard layout
  return (
    <>
      <Navigation />
      {/* Progress bar */}
      <div className="fixed top-[72px] left-0 right-0 h-1 bg-slate-100 z-40">
        <div 
          className="h-full bg-red-600 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="flex h-[calc(100vh-73px)] overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`${
          sidebarCollapsed ? 'w-16' : 'w-72'
        } bg-white border-r border-slate-200 transition-all duration-300 shrink-0 ${
          // Mobile: Fixed positioning with slide animation
          'md:relative fixed left-0 top-[73px] bottom-0 z-50 transform md:transform-none'
        } ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          {sidebarCollapsed ? (
            // Collapsed Sidebar
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-slate-200">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(false)}
                  className="w-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {emergencyActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        setSelectedAction(action.id)
                        setMobileSidebarOpen(false)
                      }}
                      className={`w-full p-3 flex items-center justify-center transition-colors ${
                        selectedAction === action.id
                          ? 'bg-red-50 border-l-4 border-red-600'
                          : 'hover:bg-slate-50'
                      }`}
                      title={action.title}
                    >
                      <Icon className={`w-5 h-5 ${selectedAction === action.id ? 'text-red-600' : 'text-slate-600'}`} />
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            // Expanded Sidebar
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Emergency Actions</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(true)}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => setSelectedAction(null)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${
                      selectedAction === null
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-slate-600" />
                    </div>
                    <span className="text-sm">All Guides</span>
                  </button>
                  {emergencyActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <button
                        key={action.id}
                        onClick={() => {
                          setSelectedAction(action.id)
                          setMobileSidebarOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                          selectedAction === action.id
                            ? 'bg-red-50 text-red-900 border border-red-200'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`${action.iconBg} w-8 h-8 rounded-lg flex items-center justify-center shrink-0`}>
                            <Icon className={`w-4 h-4 ${action.iconColor}`} />
                          </div>
                          <span className="text-sm font-medium">{action.title}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden w-full">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {selectedAction ? renderActionDetails() : renderAllCards()}
        </div>
      </div>
    </>
  )
}

