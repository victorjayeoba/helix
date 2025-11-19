export default function CTASection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-r from-helix-primary to-helix-secondary">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Join the Next Generation of African Healthcare
        </h2>
        <p className="text-xl text-white text-opacity-90 mb-8">
          Transform how African clinics manage patient care with HELIX
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button className="px-8 py-4 bg-helix-green text-white font-bold rounded-full hover:bg-opacity-90 transition shadow-lg">
            Get Started Today
          </button>
          <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:bg-opacity-10 transition">
            Schedule a Demo
          </button>
        </div>
      </div>
    </section>
  )
}

