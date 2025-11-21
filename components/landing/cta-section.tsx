export default function CTASection() {
  return (
    <section className="py-20 px-6 bg-linear-to-r from-helix-primary to-helix-secondary">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Join the Next Generation of African Healthcare
        </h2>
        <p className="text-xl text-white text-opacity-90 mb-8 flex items-center justify-center flex-wrap">
          Transform how African clinics manage patient care with
          <span className="inline-flex items-center">
            <img src="/helix.png" alt="H" className="h-6 w-auto brightness-0 invert inline" />
            <span className="font-semibold">ELIX</span>
          </span>
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button className="px-8 py-4 bg-white text-helix-primary font-bold rounded-full hover:bg-white/90 transition shadow-lg">
            Get Started Today
          </button>
          <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-opacity-20 transition">
            Schedule a Demo
          </button>
        </div>
      </div>
    </section>
  )
}

