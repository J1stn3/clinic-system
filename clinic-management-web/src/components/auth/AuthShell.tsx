import { useGoogleLogin } from '@react-oauth/google'
import { HeartPulse } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { UserRole } from '../../stores/authStore'

export function TermsContent() {
  return (
    <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1 text-sm text-slate-600">
      <p>
        By using AiCare Clinic Suite, you agree to use the platform for lawful healthcare-related purposes only and to
        provide accurate personal and medical information.
      </p>
      <p>
        Your health data is handled in accordance with applicable privacy regulations. We do not share your information
        with third parties except as required to deliver clinical services or as required by law.
      </p>
      <p>
        Telemedicine sessions, appointments, prescriptions, and AI-assisted guidance are not a substitute for emergency
        care. In an emergency, contact local emergency services immediately.
      </p>
      <p>
        You are responsible for maintaining the confidentiality of your account credentials and for all activity under
        your account.
      </p>
      <p className="font-semibold text-slate-800">
        Patient self-registration is limited to the Patient role. Clinical staff accounts are provisioned by clinic
        administrators.
      </p>
    </div>
  )
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-[100dvh] overflow-hidden">
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-brand lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white shadow-glass backdrop-blur-sm">
            <HeartPulse className="h-7 w-7" />
          </div>
          <h1 className="mt-8 text-5xl font-extrabold leading-tight text-white">
            Smarter Healthcare.
            <br />
            <span className="text-teal-200">Better Care.</span>
          </h1>
          <p className="mt-4 max-w-md text-lg font-medium text-white/80">
            AiCare Clinic Suite — secure access for patients, doctors, and administrators.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-4">
          {[
            { value: '500+', label: 'Patients' },
            { value: '24/7', label: 'AI Support' },
            { value: '99%', label: 'Uptime' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-sm">
              <p className="text-2xl font-extrabold text-white">{stat.value}</p>
              <p className="text-xs font-semibold text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-10 top-1/3 h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl animate-float" />
      </div>

      <div className="relative flex flex-1 items-center justify-center aicare-page-bg p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-mesh" />
        <div className="relative w-full max-w-md animate-slide-up">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow">
              <HeartPulse className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-extrabold">
              <span className="aicare-gradient-text">AiCare</span>
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Clinic Suite</p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-aicare-lg backdrop-blur-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{title}</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SocialAuthButtons({
  disabled,
  onSuccess,
  onError,
}: {
  disabled?: boolean
  onSuccess: (data: { accessToken: string; refreshToken: string; roleName: UserRole; userId: string; fullName: string }) => void
  onError?: (msg: string) => void
}) {
  const [loading, setLoading] = useState<'google' | 'facebook' | null>(null)

  useEffect(() => {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined
    if (!appId || appId === 'PASTE_YOUR_FACEBOOK_APP_ID_HERE') return

    // Define fbAsyncInit BEFORE loading the SDK
    window.fbAsyncInit = function () {
      window.FB?.init({
        appId: appId,
        cookie: true,
        xfbml: false,
        version: 'v19.0',
      })
    }

    // Load SDK dynamically if not already injected
    if (!document.getElementById('facebook-jssdk')) {
      const js = document.createElement('script')
      js.id = 'facebook-jssdk'
      js.src = 'https://connect.facebook.net/en_US/sdk.js'
      js.async = true
      js.defer = true
      document.body.appendChild(js)
    } else if (window.FB) {
      // Re-init if window.FB is already present (e.g. navigation back/refresh)
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: false,
        version: 'v19.0',
      })
    }
  }, [])

  const handleGoogleSuccess = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading('google')
      try {
        // Exchange the authorization code for an ID token via the tokeninfo endpoint
        const infoRes = await fetch(
          `https://www.googleapis.com/oauth2/v3/userinfo`,
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } },
        )
        if (!infoRes.ok) throw new Error('Failed to get Google user info')

        // POST the access_token to our backend which will verify it via the Google library
        const res = await fetch(`${import.meta.env.VITE_API_URL ?? '/api'}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: tokenResponse.access_token }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message ?? 'Google sign-in failed')
        onSuccess(data)
      } catch (e) {
        onError?.((e as Error).message ?? 'Google sign-in failed')
      } finally {
        setLoading(null)
      }
    },
    onError: () => {
      onError?.('Google sign-in was cancelled or failed.')
      setLoading(null)
    },
    flow: 'implicit',
  })

  const handleFacebook = () => {
    if (!window.FB) {
      onError?.('Facebook SDK is not loaded yet. Please try again.')
      return
    }
    setLoading('facebook')
    window.FB.login(
      async (response) => {
        if (!response.authResponse?.accessToken) {
          onError?.('Facebook sign-in was cancelled.')
          setLoading(null)
          return
        }
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL ?? '/api'}/auth/facebook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: response.authResponse.accessToken }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data?.message ?? 'Facebook sign-in failed')
          onSuccess(data)
        } catch (e) {
          onError?.((e as Error).message ?? 'Facebook sign-in failed')
        } finally {
          setLoading(null)
        }
      },
      { scope: 'email,public_profile' },
    )
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <button
        type="button"
        disabled={disabled || loading !== null}
        className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
        onClick={() => handleGoogleSuccess()}
      >
        {loading === 'google' ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
            <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-1.6 3.5-5.1 3.5-3.1 0-5.6-2.5-5.6-5.6s2.5-5.6 5.6-5.6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.9 3.6 14.7 2.6 12 2.6 6.9 2.6 2.6 6.9 2.6 12s4.3 9.4 9.4 9.4c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z" />
          </svg>
        )}
        {loading === 'google' ? 'Signing in…' : 'Continue with Google'}
      </button>
      <button
        type="button"
        disabled={disabled || loading !== null}
        className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
        onClick={handleFacebook}
      >
        {loading === 'facebook' ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#1877F2]" />
        ) : (
          <svg className="h-4 w-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        )}
        {loading === 'facebook' ? 'Signing in…' : 'Continue with Facebook'}
      </button>
    </div>
  )
}

export function TermsCheckbox({
  checked,
  onChange,
  onViewTerms,
  error,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  onViewTerms: () => void
  error?: string
}) {
  return (
    <div>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          className="mt-1 shrink-0"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>
          I agree to the{' '}
          <button type="button" className="font-semibold text-aicare-teal hover:underline" onClick={onViewTerms}>
            Terms and Conditions
          </button>
        </span>
      </label>
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  )
}
