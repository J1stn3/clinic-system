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
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
      <Dialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-6 shadow-lg',
          className,
        )}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  )
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <Dialog.Title className="text-lg font-semibold">{children}</Dialog.Title>
}
