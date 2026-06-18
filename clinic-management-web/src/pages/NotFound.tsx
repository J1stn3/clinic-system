import { Home, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center aicare-page-bg p-4">
      <div className="max-w-md animate-slide-up text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-brand text-white shadow-glow">
          <SearchX className="h-10 w-10" />
        </div>
        <p className="text-7xl font-extrabold">
          <span className="aicare-gradient-text">404</span>
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Page not found</h1>
        <p className="mt-3 text-sm font-medium text-slate-500">
          The page you requested does not exist or you may not have access.
        </p>
        <Link to="/" className="mt-8 inline-block">
          <Button variant="accent" size="lg">
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
