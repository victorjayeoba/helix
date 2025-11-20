import Navigation from '@/components/landing/navigation'
import HeroSection from '@/components/landing/hero-section'
import FeaturesSection from '@/components/landing/features-section'
import WhyHelixSection from '@/components/landing/why-helix-section'
import ProductPreviewSection from '@/components/landing/product-preview-section'
import CTASection from '@/components/landing/cta-section'
import Footer from '@/components/landing/footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <WhyHelixSection />
      <ProductPreviewSection />
      <CTASection />
      <Footer />
    </div>
  )
}
