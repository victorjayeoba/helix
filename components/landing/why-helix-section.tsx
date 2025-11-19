import { CheckCircle2 } from 'lucide-react'

export default function WhyHelixSection() {
  const benefits = [
    {
      title: "Reduces Paperwork",
      desc: "Digitize patient records and eliminate manual documentation",
      points: ["Instant data entry", "Automated workflows", "Reduced errors"],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80",
      imageAlt: "Medical Dashboard Preview - Patient Records"
    },
    {
      title: "Improves Follow-ups",
      desc: "Never miss a patient appointment or test result",
      points: ["Smart reminders", "Patient notifications", "Automated alerts"],
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&q=80",
      imageAlt: "Medical Dashboard Preview - Analytics"
    },
    {
      title: "Simple for Healthcare Workers",
      desc: "Intuitive interface designed for busy medical professionals",
      points: ["Quick training", "Fast workflows", "Minimal disruption"],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80",
      imageAlt: "Medical Dashboard Preview - Patient Records"
    },
    {
      title: "Built for African Environments",
      desc: "Optimized for local healthcare systems and connectivity",
      points: ["Offline support", "Low bandwidth", "Local support"],
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&q=80",
      imageAlt: "Medical Dashboard Preview - Analytics"
    }
  ]

  return (
    <section id="why" className="py-20 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Why Choose HELIX?</h2>
        
        <div className="space-y-12">
          {benefits.map((benefit, i) => (
            <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {i % 2 === 0 ? (
                <>
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-4">{benefit.title}</h3>
                    <p className="text-slate-600 mb-6">{benefit.desc}</p>
                    <ul className="space-y-3">
                      {benefit.points.map((point, j) => (
                        <li key={j} className="flex items-center gap-3 text-slate-700">
                          <CheckCircle2 className="w-5 h-5 text-helix-green flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-xl hidden lg:block h-80">
                    <img 
                      src={benefit.image} 
                      alt={benefit.imageAlt} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-2xl overflow-hidden shadow-xl hidden lg:block h-80">
                    <img 
                      src={benefit.image} 
                      alt={benefit.imageAlt} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-4">{benefit.title}</h3>
                    <p className="text-slate-600 mb-6">{benefit.desc}</p>
                    <ul className="space-y-3">
                      {benefit.points.map((point, j) => (
                        <li key={j} className="flex items-center gap-3 text-slate-700">
                          <CheckCircle2 className="w-5 h-5 text-helix-green flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

