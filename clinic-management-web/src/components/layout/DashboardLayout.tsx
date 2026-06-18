import { observer } from 'mobx-react-lite'
import { Navigate, Outlet } from 'react-router-dom'
import AIcareAssistant from '../ai/AIcareAssistant'
import { canAccess } from '../../hooks/useRoleAccess'
import { authStore } from '../../stores/authStore'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

function DashboardLayoutBase() {
  const path = window.location.pathname
  if (!canAccess(path)) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen bg-aicare-surface">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      {authStore.role === 'Patient' && <AIcareAssistant />}
    </div>
  )
}

export default observer(DashboardLayoutBase)
