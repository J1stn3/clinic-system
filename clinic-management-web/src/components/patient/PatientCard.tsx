type Props = { name?: string; gender?: string; id: string }

export default function PatientCard({ name, gender, id }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
      <p className="font-medium">{name ?? 'Patient'}</p>
      <p className="text-slate-500">{gender ?? '—'}</p>
      <p className="text-xs text-slate-400">{id}</p>
    </div>
  )
}
