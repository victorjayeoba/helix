import { ArrowRight } from 'lucide-react'

export default function ProductPreviewSection() {
  return (
    <section id="product" className="py-20 px-6 bg-slate-50">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">See HELIX in Action</h2>
        <p className="text-lg text-slate-600 text-center mb-12">A modern EMR system designed for 2025</p>
        
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
          <div className="bg-gradient-to-r from-helix-primary to-helix-secondary p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-white opacity-75"></div>
              <div className="w-3 h-3 rounded-full bg-white opacity-75"></div>
              <div className="w-3 h-3 rounded-full bg-white opacity-75"></div>
            </div>
            <p className="text-white text-sm font-medium">EMR Dashboard Preview</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-4">
                <div className="bg-slate-100 rounded-lg p-4 space-y-3">
                  <div className="h-4 bg-slate-300 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-helix-light rounded-lg p-4 border-l-4 border-helix-green">
                    <div className="text-sm text-slate-600">Upcoming Appointments</div>
                    <div className="text-2xl font-bold text-helix-primary">12</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-helix-secondary">
                    <div className="text-sm text-slate-600">Active Patients</div>
                    <div className="text-2xl font-bold text-helix-secondary">45</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-100 rounded-lg p-4 space-y-3 border-l-4 border-helix-green">
                <div className="text-xs font-bold text-slate-600 uppercase">AI Assistant</div>
                <div className="space-y-2">
                  <div className="h-2 bg-slate-200 rounded w-full"></div>
                  <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-2 bg-helix-green rounded-full w-3/4 opacity-50"></div>
                </div>
                <div className="text-xs text-slate-600 pt-2">Processing...</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-4 text-slate-600">
                <div className="w-8 h-8 rounded-full bg-helix-primary text-white flex items-center justify-center text-sm font-bold">1</div>
                <ArrowRight className="w-6 h-6" />
                <div className="w-8 h-8 rounded-full bg-helix-primary text-white flex items-center justify-center text-sm font-bold">2</div>
                <ArrowRight className="w-6 h-6" />
                <div className="w-8 h-8 rounded-full bg-helix-green text-white flex items-center justify-center text-sm font-bold">3</div>
              </div>
            </div>
            <p className="text-center text-sm text-slate-600">AI → Structured Records → Better Patient Care</p>
          </div>
        </div>
      </div>
    </section>
  )
}

