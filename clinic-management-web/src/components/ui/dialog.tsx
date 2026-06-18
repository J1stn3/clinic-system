import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '../../lib/utils'

export function DialogRoot({ open, onOpenChange, children }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  )
}

export function DialogContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm" />
      <Dialog.Content
        className={cn(
          'fixed z-50 flex max-h-[90dvh] w-full flex-col overflow-hidden bg-white shadow-aicare-lg animate-slide-up',
          'max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:max-h-[92dvh] max-sm:rounded-t-3xl max-sm:rounded-b-none',
          'sm:left-1/2 sm:top-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border sm:border-slate-200/80',
          className,
        )}
      >
        <div className="h-1.5 shrink-0 bg-gradient-brand" />
        <div className="overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  )
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <Dialog.Title className="text-lg font-extrabold text-slate-900 sm:text-xl">{children}</Dialog.Title>
}
