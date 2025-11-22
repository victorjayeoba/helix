import { Zap, Users, FileText, TrendingUp, MapPin, Shield } from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    { icon: Zap, title: "Agentic AI Documentation", desc: "Agentic AI autonomously transforms natural language into structured medical records" },
    { icon: Users, title: "Smart Appointments", desc: "Agentic AI-powered automated scheduling and intelligent patient reminders" },
    { icon: FileText, title: "Patient Management", desc: "Complete medical histories and easy access" },
    { icon: TrendingUp, title: "Test Tracking", desc: "Organize and monitor all test results" },
    { icon: MapPin, title: "Healthcare Locator", desc: "Route to available hospitals & pharmacies for your specific case" },
    { icon: Shield, title: "Agentic AI Drug Safety", desc: "Agentic AI analyzes and rates safety & severity of drug combinations" },
  ]

  return (
    <section id="features" className="py-20 px-6 bg-slate-50">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Key Features</h2>
          <p className="text-lg text-slate-600">Built to streamline healthcare workflows across African clinics</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition">
              <feature.icon className="w-8 h-8 text-helix-primary mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

