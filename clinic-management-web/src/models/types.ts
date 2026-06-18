export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt?: string
}

export interface Patient extends BaseEntity {
  userId: string
  gender?: string
  dateOfBirth?: string
}

export interface Doctor extends BaseEntity {
  userId: string
  specialty?: string
  licenseNumber?: string
}

export interface Appointment extends BaseEntity {
  patientId: string
  doctorId: string
  scheduledAt: string
  status: string
  notes?: string
}

export interface Consultation extends BaseEntity {
  appointmentId: string
  doctorId: string
  patientId: string
  symptoms: string
  diagnosis: string
}

export interface MedicalRecord extends BaseEntity {
  patientId: string
  doctorId: string
  history: string
  vitals: string
}

export interface Prescription extends BaseEntity {
  patientId: string
  doctorId: string
  medication: string
  dosage: string
  instructions: string
}

export interface LaboratoryResult extends BaseEntity {
  patientId: string
  doctorId: string
  testName: string
  resultValue: string
  status: string
}

export interface Medicine extends BaseEntity {
  name: string
  description: string
  unitPrice: number
  stockQuantity: number
}

export interface Billing extends BaseEntity {
  patientId: string
  amount: number
  status: string
}

export interface Payment extends BaseEntity {
  billingId: string
  amountPaid: number
  method: string
  transactionRef: string
}

export interface TelemedicineSession extends BaseEntity {
  appointmentId: string
  meetingUrl: string
  status: string
}

export interface DiseaseSuggestion {
  name: string
  confidence: number
}

export interface CdssResponse {
  possibleDiseases: DiseaseSuggestion[]
  recommendedTests: string[]
  warnings: string[]
}

export interface ReportsSummary {
  patients: number
  doctors: number
  appointments: number
  pendingBills: number
  cdssEvaluations: number
}
