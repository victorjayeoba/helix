'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { logOut } from '@/lib/firebase/auth'
import { SignInDialog } from '@/components/auth/sign-in-dialog'
import { SignUpDialog } from '@/components/auth/sign-up-dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function Navigation() {
  const [signInOpen, setSignInOpen] = useState(false)
  const [signUpOpen, setSignUpOpen] = useState(false)
  const { user, userData, loading } = useAuth()

  const handleSignOut = async () => {
    try {
      await logOut()
      toast.success('Signed out successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out')
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-helix-primary">HELIX</div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-helix-primary transition">Features</a>
            <a href="#why" className="hover:text-helix-primary transition">Why HELIX</a>
            <a href="#product" className="hover:text-helix-primary transition">Product</a>
          </div>
          <div className="flex gap-3 items-center">
            {loading ? (
              <div className="px-4 py-2 text-sm text-slate-600">Loading...</div>
            ) : user ? (
              <>
                <div className="px-4 py-2 text-sm text-slate-600">
                  {userData?.displayName || user.email} ({userData?.userType})
                </div>
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
        </div>
      </nav>
      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
      <SignUpDialog open={signUpOpen} onOpenChange={setSignUpOpen} />
    </>
  )
}

