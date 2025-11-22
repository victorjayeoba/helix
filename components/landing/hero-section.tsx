import { ArrowRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <section 
      className="relative pt-12 pb-32 px-6"
      style={{
        backgroundColor: '#ffffff',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 200 200'%3E%3Cpolygon fill='%230D4C73' fill-opacity='0.04' points='100 0 0 100 100 100 100 200 200 100 200 0'/%3E%3C/svg%3E")`
      }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-12">
          <div className="space-y-6 w-full text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              Agentic AI-Powered Medical Records for African&nbsp;Clinics.
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Fast documentation. Smarter scheduling. Complete patient care.
            </p>
            <div className="flex gap-4 pt-4 justify-center">
              <button className="px-8 py-3 bg-helix-primary text-white font-medium rounded-full hover:bg-helix-secondary transition flex items-center gap-2 shadow-lg">
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-3 border-2 border-helix-primary text-helix-primary font-medium rounded-full hover:bg-helix-light transition">
                Request Demo
              </button>
            </div>
          </div>
          
          {/* Dashboard Image */}
          <div className="relative w-full">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop&q=80" 
                alt="HELIX Medical Dashboard Preview" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

