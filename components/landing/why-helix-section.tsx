'use client'

import { useState } from 'react'
import { 
  FileText, 
  Zap, 
  Bell, 
  Calendar,
  FileCheck,
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Feature {
  id: string
  icon: typeof FileText
  title: string
  description: string
  angle: number
}

interface Group {
  title: string
  subtitle: string
  icon: string // SVG path
  features: Feature[]
}

export default function WhyHelixSection() {
  // Set first feature of each group as active by default
  const [activeFeatures, setActiveFeatures] = useState<Record<string, string>>({
    'For Doctors': 'ai-docs',
    'For Patients': 'appointments'
  })
  
  // Track which feature is currently hovered
  const [hoveredFeatures, setHoveredFeatures] = useState<Record<string, string>>({})
  
  // Track selected feature for navigation (separate from hover)
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string>>({
    'For Doctors': 'ai-docs',
    'For Patients': 'appointments'
  })

  const groups: Group[] = [
    {
      title: "For Doctors",
      subtitle: "Streamline your practice with powerful tools",
      icon: "/assets/doctor.svg",
      features: [
        {
          id: 'ai-docs',
          icon: Zap,
          title: "AI Documentation",
          description: "Transform your spoken notes into structured medical records instantly. Our AI understands medical terminology and automatically formats your documentation, saving hours of paperwork every day.",
          angle: 60
        },
        {
          id: 'quick-access',
          icon: FileText,
          title: "Quick Patient Access",
          description: "Access complete patient histories, test results, and treatment plans in seconds. No more searching through filing cabinets or waiting for records to be retrieved.",
          angle: 80
        },
        {
          id: 'appointments',
          icon: Calendar,
          title: "Smart Scheduling",
          description: "Automated appointment management with intelligent reminders. Reduce no-shows and optimize your daily schedule with AI-powered scheduling suggestions.",
          angle: 100
        },
        {
          id: 'test-tracking',
          icon: FileCheck,
          title: "Test Result Tracking",
          description: "Never miss a test result again. Get instant notifications when results are available, with automatic flagging of critical values that need immediate attention.",
          angle: 120
        }
      ]
    },
    {
      title: "For Patients",
      subtitle: "Take control of your health journey",
      icon: "/assets/female-avatar.svg",
      features: [
        {
          id: 'appointments',
          icon: Calendar,
          title: "Easy Appointments",
          description: "Book, reschedule, or cancel appointments directly from your phone. Receive automatic reminders via SMS or email so you never miss an important visit.",
          angle: 60
        },
        {
          id: 'records',
          icon: FileText,
          title: "Your Health Records",
          description: "Access your complete medical history anytime, anywhere. View test results, prescriptions, and treatment plans all in one secure place.",
          angle: 80
        },
        {
          id: 'reminders',
          icon: Bell,
          title: "Health Reminders",
          description: "Get personalized reminders for medication, follow-up appointments, and preventive care. Stay on top of your health with automated notifications.",
          angle: 100
        },
        {
          id: 'locator',
          icon: MapPin,
          title: "Healthcare Locator",
          description: "Instantly find nearby hospitals and pharmacies for your specific needs. Our smart locator simplifies routes to capable centers, eliminating complex map navigation during emergencies.",
          angle: 120
        }
      ]
    }
  ]

  return (
    <section id="why" className="py-20 px-6 bg-slate-50 overflow-x-hidden">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center flex items-center justify-center flex-wrap">
          Why Choose 
          <span className="inline-flex items-center">
            <img src="/helix.png" alt="H" className="h-10 w-auto" />
            <span>ELIX?</span>
          </span>
        </h2>
        <p className="text-lg text-slate-600 text-center mb-16">Designed for both healthcare providers and patients</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
          {groups.map((group) => {
            const radius = 140
            const centerX = 180
            const centerY = 280 // Move center down for bottom arc

            return (
              <div key={group.title} className="relative">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-slate-900 mb-2">{group.title}</h3>
                  <p className="text-slate-600">{group.subtitle}</p>
                </div>

                {/* Circular Feature Layout - Arc at Bottom */}
                <div className="relative">
                  <div className="relative h-64 flex items-end justify-center -mt-10 overflow-visible pb-8">
                    <div className="relative w-full h-full max-w-md mx-auto overflow-visible">
                      <svg 
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 360 360"
                        style={{ overflow: 'visible' }}
                      >
                        {/* Connection Lines */}
                        {group.features.map((feature) => {
                          const radian = (feature.angle * Math.PI) / 180
                          const x = centerX + radius * Math.cos(radian)
                          const y = centerY + radius * Math.sin(radian)

                          return (
                            <line
                              key={`line-${feature.id}`}
                              x1={centerX}
                              y1={centerY}
                              x2={x}
                              y2={y}
                              stroke="#0D4C73"
                              strokeWidth="2"
                              opacity="0.2"
                              strokeDasharray="4,4"
                            />
                          )
                        })}

                      {/* Gradient Definition */}
                      <defs>
                        <linearGradient id={`gradient-${group.title.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#0D4C73" />
                          <stop offset="100%" stopColor="#1A6FA1" />
                        </linearGradient>
                      </defs>

                      {/* Center Circle */}
                      <circle
                        cx={centerX}
                        cy={centerY}
                        r={60}
                        fill={`url(#gradient-${group.title.replace(/\s+/g, '-')})`}
                        className="drop-shadow-lg"
                      />
                    </svg>

                    {/* Center Icon - Positioned at bottom */}
                    <div 
                      className="absolute"
                      style={{
                        left: '50%',
                        bottom: '0',
                        transform: 'translateX(-50%)',
                        width: '120px',
                        height: '120px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <img 
                        src={group.icon} 
                        alt={group.title}
                        className={`w-full h-full object-contain drop-shadow-lg ${
                          group.title === "For Patients" ? 'p-1' : 'p-3'
                        }`}
                      />
                    </div>

                    {/* Feature Icons in Arc */}
                    {group.features.map((feature) => {
                      const FeatureIcon = feature.icon
                      const radian = (feature.angle * Math.PI) / 180
                      const x = centerX + radius * Math.cos(radian)
                      const y = centerY + radius * Math.sin(radian)
                      const percentageX = (x / 360) * 100
                      const percentageY = (y / 360) * 100

                      // Check if this feature is active (selected, hovered, or default)
                      const isHovered = hoveredFeatures[group.title] === feature.id
                      const isSelected = selectedFeatures[group.title] === feature.id
                      const isActiveDefault = activeFeatures[group.title] === feature.id && !hoveredFeatures[group.title] && !selectedFeatures[group.title]
                      const isActive = isHovered || isSelected || isActiveDefault

                      const handleMouseEnter = () => {
                        // Set this feature as hovered and selected
                        setHoveredFeatures(prev => ({
                          ...prev,
                          [group.title]: feature.id
                        }))
                        setSelectedFeatures(prev => ({
                          ...prev,
                          [group.title]: feature.id
                        }))
                      }

                      const handleMouseLeave = () => {
                        // Clear hovered state, but keep selected state
                        setHoveredFeatures(prev => {
                          const newState = { ...prev }
                          delete newState[group.title]
                          return newState
                        })
                      }

                      return (
                        <div
                          key={feature.id}
                          className="group absolute"
                          style={{
                            left: `${percentageX}%`,
                            top: `${percentageY}%`,
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10
                          }}
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                        >
                          {/* Icon Button */}
                          <div className="cursor-pointer hover:scale-110 transition-transform">
                            <div className={`rounded-full flex items-center justify-center transition-all drop-shadow-md border-2 border-helix-primary ${
                              isActive 
                                ? 'bg-helix-primary w-14 h-14' 
                                : 'bg-white w-12 h-12 group-hover:bg-helix-primary group-hover:w-14 group-hover:h-14'
                            } group-hover:border-helix-primary`}>
                              <FeatureIcon 
                                className={`w-6 h-6 transition-all duration-200 ${
                                  isActive 
                                    ? 'text-white fill-white' 
                                    : 'text-helix-primary group-hover:text-white group-hover:fill-white'
                                }`}
                                strokeWidth={2}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                </div>

                {/* Content Area Below Arc - Shows Active Feature */}
                <div className="relative mt-16 h-[240px]">
                  {group.features
                    .filter(f => {
                      // Show hovered feature if hovering, otherwise show selected feature
                      const isHovered = hoveredFeatures[group.title] === f.id
                      const isSelected = selectedFeatures[group.title] === f.id && !hoveredFeatures[group.title]
                      return isHovered || isSelected
                    })
                    .map((feature) => {
                      const FeatureIcon = feature.icon
                      const currentIndex = group.features.findIndex(f => f.id === feature.id)
                      const totalFeatures = group.features.length
                      
                      const handleNext = () => {
                        const nextIndex = (currentIndex + 1) % totalFeatures
                        setSelectedFeatures(prev => ({
                          ...prev,
                          [group.title]: group.features[nextIndex].id
                        }))
                        // Clear hover when navigating
                        setHoveredFeatures(prev => {
                          const newState = { ...prev }
                          delete newState[group.title]
                          return newState
                        })
                      }
                      
                      const handlePrev = () => {
                        const prevIndex = (currentIndex - 1 + totalFeatures) % totalFeatures
                        setSelectedFeatures(prev => ({
                          ...prev,
                          [group.title]: group.features[prevIndex].id
                        }))
                        // Clear hover when navigating
                        setHoveredFeatures(prev => {
                          const newState = { ...prev }
                          delete newState[group.title]
                          return newState
                        })
                      }
                      
                      return (
                        <div 
                          key={feature.id} 
                          className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 transition-all duration-300 h-full flex flex-col"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-helix-light rounded-lg">
                                <FeatureIcon className="w-6 h-6 text-helix-primary" />
                              </div>
                              <h4 className="text-2xl font-bold text-slate-900">{feature.title}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handlePrev}
                                className="p-2 rounded-lg border border-slate-300 hover:border-helix-primary hover:bg-helix-light transition-colors"
                                aria-label="Previous feature"
                              >
                                <ChevronLeft className="w-5 h-5 text-slate-600 hover:text-helix-primary" />
                              </button>
                              <button
                                onClick={handleNext}
                                className="p-2 rounded-lg border border-slate-300 hover:border-helix-primary hover:bg-helix-light transition-colors"
                                aria-label="Next feature"
                              >
                                <ChevronRight className="w-5 h-5 text-slate-600 hover:text-helix-primary" />
                              </button>
                            </div>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-lg flex-1 overflow-y-auto">{feature.description}</p>
                        </div>
                      )
                    })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
