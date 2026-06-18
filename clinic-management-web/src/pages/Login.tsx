import { zodResolver } from '@hookform/resolvers/zod'
import { HeartPulse } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/PageShell'
import { api } from '../services/api'
import { authStore } from '../stores/authStore'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type FormData = z.infer<typeof schema>

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@icms.local' },
  { label: 'Doctor', email: 'doctor@icms.local' },
  { label: 'Patient', email: 'patient@icms.local' },
]

export default function Login() {
  const navigate = useNavigate()
  const { register, handleSubmit, setValue, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'admin@icms.local', password: 'Admin@123' },
  })

  const onSubmit = async (values: FormData) => {
    try {
      const { data } = await api.post('/auth/login', values)
      authStore.login({
        token: data.accessToken,
        refreshToken: data.refreshToken,
        role: data.roleName,
        fullName: data.fullName,
      })
      toast.success(`Welcome to AiCare, ${data.fullName?.split(' ')[0] ?? 'there'}`)
      navigate('/')
    } catch {
      toast.error('Invalid credentials — ensure the API is running on port 5064')
    }
  }

  const quickLogin = (email: string) => {
    setValue('email', email)
    setValue('password', 'Admin@123')
    void handleSubmit(onSubmit)()
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8fafc] p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(13,148,136,0.14),_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(15,118,110,0.08),_transparent_50%)]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-aicare-teal text-white shadow-lg">
            <HeartPulse className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">AiCare</h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Clinic Suite</p>
          <p className="mt-2 text-sm text-slate-500">Smarter Healthcare. Better Care.</p>
        </div>

        <Card>
          <h2 className="text-xl font-semibold text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Access your healthcare workspace securely.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input className="aicare-input" {...register('email')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <input type="password" className="aicare-input" {...register('password')} />
            </div>
            <Button type="submit" variant="accent" className="w-full" size="lg" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-5">
            <p className="mb-2 text-xs font-medium text-slate-500">Quick demo login</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => quickLogin(acc.email)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-aicare-teal hover:text-aicare-teal"
                >
                  {acc.label}
                </button>
              ))}
            </div>
            <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Password for all demo accounts: <strong>Admin@123</strong>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
