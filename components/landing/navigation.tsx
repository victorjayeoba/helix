'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { logOut } from '@/lib/firebase/auth'
import { SignInDialog } from '@/components/auth/sign-in-dialog'
import { SignUpDialog } from '@/components/auth/sign-up-dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

interface NavigationProps {
  showScrollProgress?: boolean
}

export default function Navigation({ showScrollProgress = false }: NavigationProps = {}) {
  const pathname = usePathname()
  const [signInOpen, setSignInOpen] = useState(false)
  const [signUpOpen, setSignUpOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeSection, setActiveSection] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, userData, loading } = useAuth()

  useEffect(() => {
    if (!showScrollProgress) return

    const handleScroll = () => {
      // Calculate scroll progress
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const maxScroll = documentHeight - windowHeight
      const progress = (scrollTop / maxScroll) * 100
      setScrollProgress(progress)

      // Determine active section based on scroll position
      const sections = ['features', 'why', 'product']
      const sectionElements = sections.map(id => ({
        id,
        element: document.getElementById(id)
      }))

      // Find which section is currently in view (with offset for header)
      const offset = 150
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i]
        if (section.element) {
          const rect = section.element.getBoundingClientRect()
          if (rect.top <= offset) {
            setActiveSection(section.id)
            break
          }
        }
      }

      // Reset active section if at top
      if (scrollTop < 100) {
        setActiveSection('')
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [showScrollProgress])

  const handleSignOut = async () => {
    try {
      await logOut()
      toast.success('Signed out successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out')
    }
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80 // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  const isHomePage = pathname === '/'
  const isActionsPage = pathname === '/actions'

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-bold text-helix-primary hover:opacity-80 transition">
            HELIX
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-8 text-sm font-medium text-slate-600">
            {isHomePage ? (
              <>
                <button 
                  onClick={() => scrollToSection('features')}
                  className={`hover:text-helix-primary transition relative pb-1 ${
                    activeSection === 'features' ? 'text-helix-primary' : ''
                  }`}
                >
                  Features
                  {activeSection === 'features' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-helix-primary"></span>
                  )}
                </button>
                <button 
                  onClick={() => scrollToSection('why')}
                  className={`hover:text-helix-primary transition relative pb-1 ${
                    activeSection === 'why' ? 'text-helix-primary' : ''
                  }`}
                >
                  Why HELIX
                  {activeSection === 'why' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-helix-primary"></span>
                  )}
                </button>
                <button 
                  onClick={() => scrollToSection('product')}
                  className={`hover:text-helix-primary transition relative pb-1 ${
                    activeSection === 'product' ? 'text-helix-primary' : ''
                  }`}
                >
                  Product
                  {activeSection === 'product' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-helix-primary"></span>
                  )}
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/"
                  className="hover:text-helix-primary transition relative pb-1"
                >
                  Home
                </Link>
                <Link 
                  href="/#features"
                  className="hover:text-helix-primary transition relative pb-1"
                >
                  Features
                </Link>
                <Link 
                  href="/#why"
                  className="hover:text-helix-primary transition relative pb-1"
                >
                  Why HELIX
                </Link>
              </>
            )}
            <Link 
              href="/actions"
              className={`hover:text-helix-primary transition relative pb-1 ${
                isActionsPage ? 'text-helix-primary' : ''
              }`}
            >
              Emergency Guide
              {isActionsPage && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-helix-primary"></span>
              )}
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex gap-3 items-center">
            {loading ? (
              <div className="px-4 py-2 text-sm text-slate-600">Loading...</div>
            ) : user ? (
              <>
                <div className="hidden lg:block px-4 py-2 text-sm text-slate-600">
                  {userData?.displayName || user.email} ({userData?.userType})
                </div>
                <Link href={userData?.userType === 'doctor' ? '/dashboard' : '/patient-dashboard'}>
                  <Button 
                    variant="outline"
                    className="px-4 py-2 text-sm"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline"
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setSignInOpen(true)}
                  className="px-4 py-2 text-helix-primary text-sm font-medium hover:bg-helix-light transition rounded-lg"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => setSignUpOpen(true)}
                  className="px-4 py-2 bg-helix-primary text-white text-sm font-medium rounded-lg hover:bg-helix-secondary transition"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-600" />
            ) : (
              <Menu className="w-6 h-6 text-slate-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              {isHomePage ? (
                <>
                  <button
                    onClick={() => {
                      scrollToSection('features')
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                  >
                    Features
                  </button>
                  <button
                    onClick={() => {
                      scrollToSection('why')
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                  >
                    Why HELIX
                  </button>
                  <button
                    onClick={() => {
                      scrollToSection('product')
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                  >
                    Product
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                  >
                    Home
                  </Link>
                  <Link
                    href="/#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                  >
                    Features
                  </Link>
                  <Link
                    href="/#why"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                  >
                    Why HELIX
                  </Link>
                </>
              )}
              <Link
                href="/actions"
                onClick={() => setMobileMenuOpen(false)}
                className={`block w-full text-left px-4 py-2 text-sm font-medium rounded-lg ${
                  isActionsPage ? 'bg-helix-primary text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Emergency Guide
              </Link>

              {!loading && (
                <div className="border-t border-slate-200 pt-3 mt-3">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm text-slate-600 mb-2">
                        {userData?.displayName || user.email} ({userData?.userType})
                      </div>
                      <Link href={userData?.userType === 'doctor' ? '/dashboard' : '/patient-dashboard'}>
                        <Button
                          variant="outline"
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full mb-2"
                        >
                          Dashboard
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleSignOut()
                          setMobileMenuOpen(false)
                        }}
                        className="w-full"
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSignInOpen(true)
                          setMobileMenuOpen(false)
                        }}
                        className="w-full mb-2 justify-start"
                      >
                        Sign In
                      </Button>
                      <Button
                        onClick={() => {
                          setSignUpOpen(true)
                          setMobileMenuOpen(false)
                        }}
                        className="w-full bg-helix-primary"
                      >
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scroll progress bar - only show on homepage */}
        {showScrollProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
            <div 
              className="h-full bg-helix-primary transition-all duration-150"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        )}
      </nav>
      {/* Spacer to prevent content from going under fixed nav */}
      <div className="h-[72px]" />
      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
      <SignUpDialog open={signUpOpen} onOpenChange={setSignUpOpen} />
    </>
  )
}

