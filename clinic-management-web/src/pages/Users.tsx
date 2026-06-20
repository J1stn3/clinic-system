import { Shield, UserCog, Users as UsersIcon } from 'lucide-react'
import { CrudPage } from '../components/ui/CrudPage'
import { StatCard, StatusPill } from '../components/ui/PageShell'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { authStore } from '../stores/authStore'

export default function Users() {
  const { data: stats, isLoading } = useDashboardStats()

  const isAdmin = authStore.role === 'Administrator'

  return (
    <CrudPage
      title="User Management"
      description="Manage administrators, doctors, and patients."
      resource="User"
      canCreate={isAdmin}
      canEdit={isAdmin}
      canDelete={isAdmin}
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
      createFields={[
        { name: 'fullName', label: 'Full Name' },
        { name: 'email', label: 'Email Address' },
        { name: 'password', label: 'Password', type: 'password' },
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
        { name: 'specialty', label: 'Specialty (Doctor only)' },
        { name: 'licenseNumber', label: 'License Number (Doctor only)' },
        {
          name: 'gender',
          label: 'Gender (Patient only)',
          type: 'select',
          options: [
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
            { value: 'Other', label: 'Other' },
            { value: 'Prefer not to say', label: 'Prefer not to say' },
          ],
        },
        { name: 'dateOfBirth', label: 'Date of Birth (Patient only)', type: 'date' },
      ]}
      fields={[
        { name: 'fullName', label: 'Full Name' },
        { name: 'email', label: 'Email Address' },
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
        { name: 'isActive', label: 'Active', type: 'checkbox' },
      ]}
    />
  )
}
