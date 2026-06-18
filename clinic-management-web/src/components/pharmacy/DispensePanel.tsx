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
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="w-full min-w-0 sm:flex-1">
        <Label>Medicine ID</Label>
        <Input className="aicare-input mt-1" value={medicineId} onChange={(e) => onMedicineId(e.target.value)} />
      </div>
      <div className="w-full min-w-0 sm:w-28">
        <Label>Quantity</Label>
        <Input className="aicare-input mt-1" type="number" value={quantity} onChange={(e) => onQuantity(e.target.value)} />
      </div>
      <Button className="w-full sm:w-auto" onClick={onDispense}>
        Dispense
      </Button>
    </div>
  )
}
