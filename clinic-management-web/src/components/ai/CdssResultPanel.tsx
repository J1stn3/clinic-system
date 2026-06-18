import type { CdssResponse } from '../../models/types'
import { Card } from '../ui/PageShell'

export default function CdssResultPanel({ result }: { result: CdssResponse }) {
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="mb-3 font-medium">Possible Diseases</h3>
        <ul className="space-y-2">
          {result.possibleDiseases.map((d) => (
            <li key={d.name}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{d.name}</span>
                <span className="font-medium text-teal-700">{(d.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-teal-600" style={{ width: `${d.confidence * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h3 className="mb-2 font-medium">Recommended Tests</h3>
        <ul className="list-inside list-disc text-sm">{result.recommendedTests.map((t) => <li key={t}>{t}</li>)}</ul>
      </Card>
      <Card>
        <h3 className="mb-2 font-medium">Safety Warnings</h3>
        <ul className="space-y-2 text-sm text-amber-800">
          {result.warnings.map((w) => (
            <li key={w} className="rounded-lg bg-amber-50 px-3 py-2">{w}</li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
