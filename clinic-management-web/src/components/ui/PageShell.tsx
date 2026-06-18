import { cn } from '../../lib/utils'

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('aicare-panel p-5', className)}>{children}</div>
}

export function PageShell({
  title,
  description,
  children,
  action,
}: {
  title: string
  description: string
  children?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

const metricTones = {
  default: 'bg-slate-100 text-slate-600',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  info: 'bg-sky-50 text-sky-600',
  danger: 'bg-red-50 text-red-600',
}

export function StatCard({
  label,
  value,
  tone = 'default',
  icon,
}: {
  label: string
  value: string | number
  tone?: keyof typeof metricTones
  icon?: React.ReactNode
}) {
  return (
    <div className="aicare-stat-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        {icon && (
          <div className={cn('aicare-metric-icon', metricTones[tone])}>{icon}</div>
        )}
      </div>
    </div>
  )
}

export function StatusPill({
  children,
  variant = 'default',
}: {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  }
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', variants[variant])}>
      {children}
    </span>
  )
}

export function AvatarInitials({ name, className }: { name: string; className?: string }) {
  const initial = name?.charAt(0)?.toUpperCase() ?? '?'
  return (
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-aicare-teal',
        className,
      )}
    >
      {initial}
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
      <p className="font-medium text-slate-700">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  )
}
