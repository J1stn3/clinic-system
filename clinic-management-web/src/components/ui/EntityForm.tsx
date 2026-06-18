import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from './button'
import { Input, Label } from './input'
import { DialogContent, DialogRoot, DialogTitle } from './dialog'

export type FormField = {
  name: string
  label: string
  type?: 'text' | 'number' | 'datetime-local' | 'select'
  options?: { value: string; label: string }[]
}

type EntityFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  fields: FormField[]
  schema: z.ZodTypeAny
  defaultValues?: Record<string, unknown>
  onSubmit: (values: Record<string, unknown>) => Promise<void>
}

export function EntityForm({
  open,
  onOpenChange,
  title,
  fields,
  schema,
  defaultValues,
  onSubmit,
}: EntityFormProps) {
  const { register, handleSubmit, formState } = useForm({
    // zod v4 + @hookform/resolvers types are not fully aligned yet
    resolver: zodResolver(schema as Parameters<typeof zodResolver>[0]) as never,
    defaultValues,
  })

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <form
          className="mt-4 space-y-3"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values)
            onOpenChange(false)
          })}
        >
          {fields.map((field) => (
            <div key={field.name}>
              <Label>{field.label}</Label>
              {field.type === 'select' ? (
                <select className="w-full rounded-md border px-3 py-2" {...register(field.name)}>
                  <option value="">Select...</option>
                  {field.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input type={field.type ?? 'text'} {...register(field.name, { valueAsNumber: field.type === 'number' })} />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogRoot>
  )
}
