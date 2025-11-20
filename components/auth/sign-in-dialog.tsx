'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { signIn, getUserData } from '@/lib/firebase/auth'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff } from 'lucide-react'

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  userType: z.enum(['doctor', 'patient']),
})

type SignInFormData = z.infer<typeof signInSchema>

interface SignInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      userType: 'patient',
    },
  })

  const userType = watch('userType')

  const onSubmit = async (data: SignInFormData) => {
    setLoading(true)
    try {
      const user = await signIn(data.email, data.password)
      const userData = await getUserData(user.uid)
      
      // Check if user type matches the selected type
      if (userData && userData.userType !== data.userType) {
        toast.error(`This account is registered as a ${userData.userType}. Please select the correct account type.`)
        setLoading(false)
        return
      }
      
      toast.success('Signed in successfully!')
      onOpenChange(false)
      
      // Redirect based on user type
      if (data.userType === 'doctor') {
        router.push('/dashboard')
      } else {
        router.push('/patient-dashboard')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>
            Enter your credentials to access your HELIX account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setValue('userType', 'doctor')}
                className={`py-2.5 px-4 rounded-md font-medium text-sm transition-all ${
                  userType === 'doctor'
                    ? 'bg-white text-helix-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => setValue('userType', 'patient')}
                className={`py-2.5 px-4 rounded-md font-medium text-sm transition-all ${
                  userType === 'patient'
                    ? 'bg-white text-helix-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Patient
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

