import { useQuery } from '@tanstack/react-query'
import { BarChart3, Download, TrendingUp } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '../components/ui/button'
import { Card, PageShell, StatCard } from '../components/ui/PageShell'
import { TableSkeleton } from '../components/ui/skeleton'
import { api } from '../services/api'

export default function Reports() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => (await api.get('/reports/summary')).data,
  })

  const chartData = data
    ? [
        { name: 'Patients', value: data.patients },
        { name: 'Doctors', value: data.doctors },
        { name: 'Appointments', value: data.appointments },
        { name: 'Pending Bills', value: data.pendingBills },
        { name: 'CDSS', value: data.cdssEvaluations },
      ]
    : []

  const metrics = [
    { label: 'Total Patients', value: data?.patients ?? 0, tone: 'info' as const },
    { label: 'Total Doctors', value: data?.doctors ?? 0, tone: 'default' as const },
    { label: 'Appointments', value: data?.appointments ?? 0, tone: 'info' as const },
    { label: 'Pending Bills', value: data?.pendingBills ?? 0, tone: 'warning' as const },
    { label: 'AI Analyses', value: data?.cdssEvaluations ?? 0, tone: 'success' as const },
    {
      label: 'Total Revenue',
      value: `₱${(data?.totalRevenue ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      tone: 'success' as const,
    },
  ]

  return (
    <PageShell
      title="Reports & Analytics"
      description="Operational and clinical analytics for administrators."
      action={
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      }
    >
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((m) => (
              <StatCard key={m.label} label={m.label} value={m.value} tone={m.tone} icon={<TrendingUp className="h-5 w-5" />} />
            ))}
          </div>
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-aicare-teal" />
              <h3 className="font-semibold text-slate-900">Clinic Overview</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0D9488" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </PageShell>
  )
}
