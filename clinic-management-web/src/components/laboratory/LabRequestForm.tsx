import { Input, Label } from '../ui/input'

export default function LabRequestForm({
  patientId,
  testName,
  onPatientId,
  onTestName,
}: {
  patientId: string
  testName: string
  onPatientId: (v: string) => void
  onTestName: (v: string) => void
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <Label>Patient ID</Label>
        <Input value={patientId} onChange={(e) => onPatientId(e.target.value)} />
      </div>
      <div>
        <Label>Test Name</Label>
        <Input value={testName} onChange={(e) => onTestName(e.target.value)} />
      </div>
    </div>
  )
}
