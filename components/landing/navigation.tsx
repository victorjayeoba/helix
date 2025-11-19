export default function Navigation() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-helix-primary">HELIX</div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-helix-primary transition">Features</a>
          <a href="#why" className="hover:text-helix-primary transition">Why HELIX</a>
          <a href="#product" className="hover:text-helix-primary transition">Product</a>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-helix-primary text-sm font-medium hover:bg-helix-light transition rounded-lg">Sign In</button>
          <button className="px-4 py-2 bg-helix-primary text-white text-sm font-medium rounded-lg hover:bg-helix-secondary transition">Get Started</button>
        </div>
      </div>
    </nav>
  )
}

