import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthShell, SocialAuthButtons, TermsCheckbox, TermsContent } from '../components/auth/AuthShell'
import { Button } from '../components/ui/button'
import { DialogContent, DialogRoot, DialogTitle } from '../components/ui/dialog'
import { forgotPasswordSchema, loginSchema, type ForgotPasswordFormData, type LoginFormData } from '../lib/authSchemas'
import { api } from '../services/api'
import { authStore } from '../stores/authStore'

export default function Login() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotSubmitting, setForgotSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { acceptTerms: false },
  })

  const acceptTerms = watch('acceptTerms')

  const forgotForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (values: LoginFormData) => {
    if (submitting) return
    setSubmitting(true)
    try {
      const { data } = await api.post('/auth/login', {
        email: values.email.trim().toLowerCase(),
        password: values.password,
      })
      authStore.login({
        token: data.accessToken,
        refreshToken: data.refreshToken,
        role: data.roleName,
        fullName: data.fullName,
      })
      toast.success(`Welcome to AiCare, ${data.fullName?.split(' ')[0] ?? 'there'}!`)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } }
      const status = axiosErr.response?.status
      if (!axiosErr.response || status === 502 || status === 503) {
        toast.error('Backend API is not running. Please try again later.')
      } else if (status === 401) {
        toast.error('Invalid email or password.')
      } else {
        toast.error('Login failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const onForgotPassword = async (values: ForgotPasswordFormData) => {
    if (forgotSubmitting) return
    setForgotSubmitting(true)
    try {
      const { data } = await api.post<{ message: string }>('/auth/forgot-password', {
        email: values.email.trim().toLowerCase(),
      })
      toast.success(data.message)
      setForgotOpen(false)
      forgotForm.reset()
    } catch {
      toast.error('Unable to process request. Please try again.')
    } finally {
      setForgotSubmitting(false)
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your healthcare workspace">
      <div className="space-y-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="aicare-input pl-10"
                placeholder="you@clinic.com"
                autoComplete="email"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="text-sm font-bold text-slate-700">Password</label>
              <button
                type="button"
                className="text-xs font-semibold text-aicare-teal hover:underline"
                onClick={() => setForgotOpen(true)}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="aicare-input pr-11"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password')}
              />
              <button
                type="button"
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-aicare-teal"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
          </div>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs font-semibold uppercase tracking-wide">
              <span className="bg-white px-3 text-slate-400">or continue with</span>
            </div>
          </div>

          <SocialAuthButtons disabled={submitting} />

          <TermsCheckbox
            checked={Boolean(acceptTerms)}
            onChange={(v) => setValue('acceptTerms', v, { shouldValidate: true })}
            onViewTerms={() => setTermsOpen(true)}
            error={errors.acceptTerms?.message}
          />

          <Button
            type="submit"
            variant="accent"
            className="w-full"
            size="lg"
            disabled={submitting || !acceptTerms}
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600">
          New patient?{' '}
          <Link to="/signup" className="font-bold text-aicare-teal hover:underline">
            Create a patient account
          </Link>
        </p>
        <p className="text-center text-xs text-slate-400">
          Doctors and administrators cannot self-register — contact your clinic.
        </p>
      </div>

      <DialogRoot open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent>
          <DialogTitle>Terms and Conditions</DialogTitle>
          <div className="mt-4">
            <TermsContent />
          </div>
          <Button className="mt-4 w-full" variant="accent" onClick={() => setTermsOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogTitle>Reset your password</DialogTitle>
          <p className="mt-2 text-sm text-slate-600">
            Enter the email associated with your account. We will send reset instructions if the account exists.
          </p>
          <form className="mt-4 space-y-4" onSubmit={forgotForm.handleSubmit(onForgotPassword)}>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Email address</label>
              <input
                className="aicare-input"
                type="email"
                placeholder="you@email.com"
                {...forgotForm.register('email')}
              />
              {forgotForm.formState.errors.email && (
                <p className="mt-1 text-xs text-rose-600">{forgotForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="aicare-page-actions">
              <Button type="button" variant="outline" onClick={() => setForgotOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" disabled={forgotSubmitting}>
                {forgotSubmitting ? 'Sending…' : 'Send reset link'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </DialogRoot>
    </AuthShell>
  )
}
