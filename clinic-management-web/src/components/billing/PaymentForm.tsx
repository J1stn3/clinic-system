import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useBillings } from '../../hooks/useEntityOptions'
import { api } from '../../services/api'
import { Button } from '../ui/button'
import { DialogContent, DialogRoot, DialogTitle } from '../ui/dialog'
import { Input, Label } from '../ui/input'

const schema = z.object({
  billingId: z.string().uuid(),
  amountPaid: z.number().positive(),
  method: z.string().min(1),
  transactionRef: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function PaymentForm({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const billings = useBillings()
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { method: 'Cash' },
  })

  const mutation = useMutation({
    mutationFn: async (values: FormData) => api.post('/Payment', values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Payment'] })
      queryClient.invalidateQueries({ queryKey: ['Billing'] })
      toast.success('Payment recorded')
      onOpenChange(false)
    },
    onError: () => toast.error('Payment failed'),
  })

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Record Payment</DialogTitle>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <div>
            <Label>Billing</Label>
            <select className="w-full rounded-md border px-3 py-2" {...register('billingId')}>
              <option value="">Select bill...</option>
              {(billings.data ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id.slice(0, 8)}... — ${b.amount} ({b.status})
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Amount Paid</Label>
            <Input type="number" step="0.01" {...register('amountPaid', { valueAsNumber: true })} />
          </div>
          <div>
            <Label>Method</Label>
            <select className="w-full rounded-md border px-3 py-2" {...register('method')}>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Online">Online</option>
            </select>
          </div>
          <div>
            <Label>Transaction Ref (optional)</Label>
            <Input {...register('transactionRef')} />
          </div>
          <Button type="submit" disabled={formState.isSubmitting}>
            Submit Payment
          </Button>
        </form>
      </DialogContent>
    </DialogRoot>
  )
}
