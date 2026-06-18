type Props = { name?: string; specialty?: string; id: string }

export default function DoctorCard({ name, specialty, id }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
      <p className="font-medium">{name ?? 'Doctor'}</p>
      <p className="text-slate-500">{specialty ?? '—'}</p>
      <p className="text-xs text-slate-400">{id}</p>
    </div>
  )
}
