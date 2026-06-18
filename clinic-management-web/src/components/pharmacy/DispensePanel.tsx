import { Button } from '../ui/button'
import { Input, Label } from '../ui/input'

export default function DispensePanel({
  medicineId,
  quantity,
  onMedicineId,
  onQuantity,
  onDispense,
}: {
  medicineId: string
  quantity: string
  onMedicineId: (v: string) => void
  onQuantity: (v: string) => void
  onDispense: () => void
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <Label>Medicine ID</Label>
        <Input value={medicineId} onChange={(e) => onMedicineId(e.target.value)} />
      </div>
      <div>
        <Label>Quantity</Label>
        <Input type="number" value={quantity} onChange={(e) => onQuantity(e.target.value)} />
      </div>
      <Button onClick={onDispense}>Dispense</Button>
    </div>
  )
}
