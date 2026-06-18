import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-aicare-teal/25 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-aicare-blue to-sky-600 text-white shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/30 hover:brightness-110',
        outline:
          'border-2 border-slate-200 bg-white text-slate-700 shadow-sm hover:border-teal-300 hover:bg-gradient-to-br hover:from-teal-50 hover:to-cyan-50 hover:text-aicare-teal',
        ghost:
          'text-slate-600 hover:bg-gradient-to-br hover:from-slate-50 hover:to-teal-50/50 hover:text-aicare-teal',
        accent:
          'bg-gradient-to-r from-aicare-teal to-emerald-500 text-white shadow-md shadow-teal-500/30 hover:shadow-lg hover:shadow-teal-500/40 hover:brightness-110',
        danger:
          'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/25 hover:shadow-lg hover:brightness-110',
        violet:
          'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/25 hover:shadow-lg hover:brightness-110',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 px-3.5 text-xs',
        lg: 'h-12 px-7 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
