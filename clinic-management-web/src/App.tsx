import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import AIClinicalSupport from './pages/AIClinicalSupport'
import Appointments from './pages/Appointments'
import Billing from './pages/Billing'
import Consultations from './pages/Consultations'
import Dashboard from './pages/Dashboard'
import Doctors from './pages/Doctors'
import Laboratory from './pages/Laboratory'
import Login from './pages/Login'
import MedicalRecords from './pages/MedicalRecords'
import NotFound from './pages/NotFound'
import Patients from './pages/Patients'
import Payments from './pages/Payments'
import Pharmacy from './pages/Pharmacy'
import Prescriptions from './pages/Prescriptions'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Telemedicine from './pages/Telemedicine'
import Users from './pages/Users'
import { authStore } from './stores/authStore'

function Guard({ children }: { children: React.ReactNode }) {
  if (!authStore.isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Guard>
            <DashboardLayout />
          </Guard>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/consultations" element={<Consultations />} />
        <Route path="/medical-records" element={<MedicalRecords />} />
        <Route path="/prescriptions" element={<Prescriptions />} />
        <Route path="/laboratory" element={<Laboratory />} />
        <Route path="/pharmacy" element={<Pharmacy />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/telemedicine" element={<Telemedicine />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/ai-clinical-support" element={<AIClinicalSupport />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
