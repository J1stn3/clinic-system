import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Building2, Clock, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/input'
import { Card, PageShell } from '../components/ui/PageShell'
import { api } from '../services/api'
import { authStore } from '../stores/authStore'

export default function Settings() {
  const isAdmin = authStore.role === 'Administrator'
  const { data, refetch, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get('/Settings')).data,
  })

  const [form, setForm] = useState({
    clinicName: '',
    timezone: '',
    contactEmail: '',
    contactPhone: '',
  })

  useEffect(() => {
    if (data) {
      setForm({
        clinicName: data.clinicName,
        timezone: data.timezone,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
      })
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: async () => api.put('/Settings', form),
    onSuccess: () => {
      toast.success('Settings updated')
      refetch()
    },
    onError: () => toast.error('Failed to update settings'),
  })

  const fields = [
    { key: 'clinicName' as const, label: 'Clinic Name', icon: Building2 },
    { key: 'timezone' as const, label: 'Timezone', icon: Clock },
    { key: 'contactEmail' as const, label: 'Contact Email', icon: Mail },
    { key: 'contactPhone' as const, label: 'Contact Phone', icon: Phone },
  ]

  return (
    <PageShell title="Clinic Settings" description="System configuration and clinic preferences.">
      <Card>
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading settings…</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {fields.map(({ key, label, icon: Icon }) => (
              <div key={key}>
                <Label className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-aicare-teal" />
                  {label}
                </Label>
                <input
                  className="aicare-input mt-1.5"
                  value={form[key]}
                  disabled={!isAdmin}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        )}
        {isAdmin ? (
          <Button className="mt-6 w-full sm:w-auto" variant="accent" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save Settings'}
          </Button>
        ) : (
          <p className="mt-6 text-sm text-slate-500">Only administrators can edit clinic settings.</p>
        )}
      </Card>
    </PageShell>
  )
}
