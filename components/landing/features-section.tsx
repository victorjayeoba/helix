import { Zap, Users, FileText, TrendingUp } from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    { icon: Zap, title: "AI Documentation", desc: "Natural language to structured medical records" },
    { icon: Users, title: "Smart Appointments", desc: "Automated scheduling and patient reminders" },
    { icon: FileText, title: "Patient Management", desc: "Complete medical histories and easy access" },
    { icon: TrendingUp, title: "Test Tracking", desc: "Organize and monitor all test results" },
  ]

  return (
    <section id="features" className="py-20 px-6 bg-slate-50">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Key Features</h2>
          <p className="text-lg text-slate-600">Built to streamline healthcare workflows across African clinics</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

