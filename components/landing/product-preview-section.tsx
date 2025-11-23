export default function ProductPreviewSection() {
  return (
    <section id="product" className="py-20 px-6 bg-slate-50">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">See HELIX in Action</h2>
        <p className="text-lg text-slate-600 text-center mb-12">A modern EMR system designed for 2025</p>
        
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
          <div className="rounded-2xl overflow-hidden">
            <video 
              src="/assets/helix-cobrain.mp4" 
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto object-cover"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </section>
  )
}

