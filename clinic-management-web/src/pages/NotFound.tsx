import { Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/PageShell'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-4">
      <Card className="max-w-md text-center">
        <p className="text-6xl font-bold text-aicare-teal">404</p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">The page you requested does not exist or you may not have access.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button variant="accent">
            <Home className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  )
}
