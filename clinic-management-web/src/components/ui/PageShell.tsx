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
    <section className="animate-fade-in space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="relative min-w-0 flex-1 pl-3 sm:pl-4">
          <div className="absolute bottom-0 left-0 top-0 w-1 rounded-full bg-gradient-brand" />
          <h1 className="aicare-page-title break-words">
            <span className="aicare-gradient-text">{title.split(',')[0]}</span>
            {title.includes(',') && (
              <span className="text-slate-800">{title.slice(title.indexOf(','))}</span>
            )}
          </h1>
          <p className="aicare-page-desc">{description}</p>
        </div>
        {action && <div className="aicare-page-actions shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  )
}

const metricTones = {
  default: 'stat-tone-default',
  success: 'stat-tone-success',
  warning: 'stat-tone-warning',
  info: 'stat-tone-info',
  danger: 'stat-tone-danger',
  violet: 'stat-tone-violet',
}

const statAccentColors: Record<keyof typeof metricTones, string> = {
  default: 'from-slate-400 to-slate-500',
  success: 'from-emerald-400 to-teal-500',
  warning: 'from-amber-400 to-orange-500',
  info: 'from-sky-400 to-blue-500',
  danger: 'from-rose-400 to-red-500',
  violet: 'from-violet-400 to-purple-500',
}

export function StatCard({
  label,
  value,
  tone = 'default',
  icon,
  subtitle,
}: {
  label: string
  value: string | number
  tone?: keyof typeof metricTones
  icon?: React.ReactNode
  subtitle?: string
}) {
  return (
    <div className={cn('aicare-stat-card group', metricTones[tone])}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{value}</p>
          {subtitle && <p className="mt-1 text-xs font-medium text-slate-400">{subtitle}</p>}
        </div>
        {icon && (
          <div className={cn('aicare-metric-icon transition-transform duration-300 group-hover:scale-110')}>
            {icon}
          </div>
        )}
      </div>
      <div
        className={cn(
          'absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 blur-2xl transition-opacity group-hover:opacity-20',
          statAccentColors[tone],
        )}
      />
    </div>
  )
}

export function StatusPill({
  children,
  variant = 'default',
}: {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'violet'
}) {
  const variants = {
    default: 'border border-slate-200 bg-slate-100 text-slate-700',
    success: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border border-amber-200 bg-amber-50 text-amber-700',
    danger: 'border border-rose-200 bg-rose-50 text-rose-700',
    info: 'border border-sky-200 bg-sky-50 text-sky-700',
    violet: 'border border-violet-200 bg-violet-50 text-violet-700',
  }
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold', variants[variant])}>
      {children}
    </span>
  )
}

const avatarGradients = [
  'from-teal-400 to-emerald-500',
  'from-sky-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-rose-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-cyan-400 to-teal-500',
]

function pickGradient(name: string) {
  const code = name.charCodeAt(0) + (name.charCodeAt(1) ?? 0)
  return avatarGradients[code % avatarGradients.length]
}

export function AvatarInitials({ name, className }: { name: string; className?: string }) {
  const initial = name?.charAt(0)?.toUpperCase() ?? '?'
  const gradient = pickGradient(name || 'U')
  return (
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-md',
        gradient,
        className,
      )}
    >
      {initial}
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-teal-200/60 bg-gradient-to-br from-teal-50/30 to-cyan-50/20 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-2xl text-white shadow-glow">
        ✦
      </div>
      <p className="text-base font-bold text-slate-800">{title}</p>
      {description && <p className="mt-2 max-w-sm text-sm font-medium text-slate-500">{description}</p>}
    </div>
  )
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex min-w-0 flex-wrap items-center justify-between gap-2">
      <h3 className="min-w-0 flex-1 text-base font-bold text-slate-900">{title}</h3>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
