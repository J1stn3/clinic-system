import { Shield, UserCog, Users as UsersIcon } from 'lucide-react'
import { CrudPage } from '../components/ui/CrudPage'
import { StatCard, StatusPill } from '../components/ui/PageShell'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { authStore } from '../stores/authStore'

export default function Users() {
  const { data: stats, isLoading } = useDashboardStats()

  return (
    <CrudPage
      title="User Management"
      description="Manage administrators, doctors, and patients."
      resource="User"
      canCreate={authStore.role === 'Administrator'}
      createLabel="Add User"
      metrics={
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Users" value={isLoading ? '…' : (stats?.patients ?? 0) + (stats?.doctors ?? 0)} tone="info" icon={<UsersIcon className="h-5 w-5" />} />
          <StatCard label="Doctors" value={isLoading ? '…' : (stats?.doctors ?? 0)} tone="success" icon={<UserCog className="h-5 w-5" />} />
          <StatCard label="Patients" value={isLoading ? '…' : (stats?.patients ?? 0)} tone="default" icon={<Shield className="h-5 w-5" />} />
        </div>
      }
      columns={[
        { title: 'Name', dataIndex: 'fullName', render: (v) => <span className="font-medium text-slate-900">{String(v)}</span> },
        { title: 'Email', dataIndex: 'email' },
        {
          title: 'Role',
          dataIndex: 'roleName',
          render: (v) => {
            const role = String(v)
            const variant = role === 'Administrator' ? 'info' : role === 'Doctor' ? 'success' : 'default'
            return <StatusPill variant={variant}>{role}</StatusPill>
          },
        },
        {
          title: 'Status',
          dataIndex: 'isActive',
          render: (v) => <StatusPill variant={v ? 'success' : 'danger'}>{v ? 'Active' : 'Inactive'}</StatusPill>,
        },
      ]}
      fields={[
        { name: 'fullName', label: 'Full Name' },
        { name: 'email', label: 'Email' },
        { name: 'password', label: 'Password' },
        {
          name: 'roleName',
          label: 'Role',
          type: 'select',
          options: [
            { value: 'Administrator', label: 'Administrator' },
            { value: 'Doctor', label: 'Doctor' },
            { value: 'Patient', label: 'Patient' },
          ],
        },
        { name: 'specialty', label: 'Specialty (Doctor)' },
        { name: 'licenseNumber', label: 'License (Doctor)' },
        { name: 'gender', label: 'Gender (Patient)' },
      ]}
    />
  )
}
