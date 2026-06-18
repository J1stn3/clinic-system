import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Eye, EyeOff, Mail, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthShell, TermsCheckbox, TermsContent } from '../components/auth/AuthShell'
import { Button } from '../components/ui/button'
import { DialogContent, DialogRoot, DialogTitle } from '../components/ui/dialog'
import { signUpSchema, type SignUpFormData } from '../lib/authSchemas'
import { api } from '../services/api'

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say']

export default function SignUp() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { acceptTerms: false },
  })

  const acceptTerms = watch('acceptTerms')

  const onSubmit = async (values: SignUpFormData) => {
    if (submitting) return
    setSubmitting(true)
    try {
      const { data } = await api.post<{ message: string; roleName: string }>('/auth/register/patient', {
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        gender: values.gender,
        dateOfBirth: new Date(values.dateOfBirth).toISOString(),
      })
      if (data.roleName !== 'Patient') {
        toast.error('Registration failed: only patient accounts are allowed.')
        return
      }
      toast.success('Your patient account was created. Please sign in.')
      navigate('/login', { replace: true })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; title?: string } } }
      const message =
        axiosErr.response?.data?.message ??
        axiosErr.response?.data?.title ??
        'Registration failed. Please check your details and try again.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Create patient account"
      subtitle="Self-registration is for patients only. Doctors and staff are added by your clinic administrator."
    >
      <div className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wide text-teal-800">Account type</p>
        <p className="mt-1 text-sm font-semibold text-teal-900">Patient — fixed for all sign-ups</p>
        <p className="mt-1 text-xs text-teal-700">
          You cannot register as Doctor or Administrator. Those accounts are created by clinic staff only.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">Full name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="aicare-input pl-10" placeholder="Juan Dela Cruz" {...register('fullName')} />
          </div>
          {errors.fullName && <p className="mt-1 text-xs text-rose-600">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="aicare-input pl-10"
              type="email"
              placeholder="you@email.com"
              autoComplete="email"
              {...register('email')}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Gender</label>
            <select className="aicare-input" {...register('gender')}>
              <option value="">Select gender</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {errors.gender && <p className="mt-1 text-xs text-rose-600">{errors.gender.message}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Date of birth</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="aicare-input pl-10" type="date" {...register('dateOfBirth')} />
            </div>
            {errors.dateOfBirth && <p className="mt-1 text-xs text-rose-600">{errors.dateOfBirth.message}</p>}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="aicare-input pr-11"
              placeholder="Create a strong password"
              autoComplete="new-password"
              {...register('password')}
            />
            <button
              type="button"
              className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
          <p className="mt-1 text-xs text-slate-500">
            8+ characters with uppercase, lowercase, number, and special character.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">Confirm password</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              className="aicare-input pr-11"
              placeholder="Re-enter password"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword.message}</p>}
        </div>

        <TermsCheckbox
          checked={Boolean(acceptTerms)}
          onChange={(v) => setValue('acceptTerms', v, { shouldValidate: true })}
          onViewTerms={() => setTermsOpen(true)}
          error={errors.acceptTerms?.message}
        />

        <Button type="submit" variant="accent" className="w-full" size="lg" disabled={submitting}>
          {submitting ? 'Registering…' : 'Register'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-aicare-teal hover:underline">
          Sign in
        </Link>
      </p>

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
    </AuthShell>
  )
}
