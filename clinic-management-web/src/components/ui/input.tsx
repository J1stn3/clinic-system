import { cn } from '@/lib/utils'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('aicare-input', className)} {...props} />
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('mb-1.5 block text-sm font-medium text-slate-700', className)} {...props} />
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition-colors focus:border-aicare-teal focus:outline-none focus:ring-2 focus:ring-aicare-teal/20',
        className,
      )}
      {...props}
    />
  )
}

export function Badge({
  className,
  children,
  variant = 'default',
}: {
  className?: string
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'info'
}) {
  const variants = {
    default: 'bg-aicare-blue/10 text-aicare-blue',
    success: 'bg-green-50 text-success',
    warning: 'bg-amber-50 text-warning',
    info: 'bg-sky-50 text-aicare-azure',
  }
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
