namespace clinic_management_api.DTOs;

// User
public record UserDto(Guid Id, string FullName, string Email, string RoleName, bool IsActive, DateTime CreatedAt);
public record CreateUserRequest(string FullName, string Email, string Password, string RoleName, string? Gender, string? Specialty, string? LicenseNumber);
public record UpdateUserRequest(string FullName, string Email, string RoleName, bool IsActive);
public record UserProfileDto(Guid UserId, string FullName, string Email, string RoleName, Guid? PatientId, Guid? DoctorId);

// Patient / Doctor
public record PatientDto(Guid Id, Guid UserId, string? FullName, string? Gender, DateTime? DateOfBirth);
public record DoctorDto(Guid Id, Guid UserId, string? FullName, string? Specialty, string? LicenseNumber);
public record CreatePatientRequest(Guid UserId, string? Gender, DateTime? DateOfBirth);
public record CreateDoctorRequest(Guid UserId, string? Specialty, string? LicenseNumber);

// Appointment
public record AppointmentDto(
    Guid Id, Guid PatientId, Guid DoctorId, DateTime ScheduledAt, string Status, string? Notes, bool IsVirtual,
    string? PatientName, string? DoctorName, string? MeetingUrl = null, string? TelemedicineStatus = null);
public record CreateAppointmentRequest(Guid? DoctorId, DateTime ScheduledAt, string? Notes, bool IsVirtual, Guid? PatientId = null);
public record UpdateAppointmentRequest(string Status, string? Notes);

// Consultation
public record ConsultationDto(Guid Id, Guid AppointmentId, Guid DoctorId, Guid PatientId, string Symptoms, string Diagnosis);
public record CreateConsultationRequest(Guid AppointmentId, string Symptoms, string Diagnosis);
public record UpdateConsultationRequest(string Symptoms, string Diagnosis);

// Medical Record
public record MedicalRecordDto(Guid Id, Guid PatientId, Guid DoctorId, string History, string Vitals, DateTime CreatedAt);
public record CreateMedicalRecordRequest(Guid PatientId, string History, string Vitals);

// Prescription
public record PrescriptionDto(Guid Id, Guid PatientId, Guid DoctorId, string Medication, string Dosage, string Instructions);
public record CreatePrescriptionRequest(Guid PatientId, string Medication, string Dosage, string Instructions);

// Laboratory
public record LaboratoryDto(Guid Id, Guid PatientId, Guid DoctorId, string TestName, string ResultValue, string Status);
public record CreateLaboratoryRequest(Guid PatientId, string TestName);
public record UpdateLaboratoryRequest(string ResultValue, string Status);

// Pharmacy
public record MedicineDto(Guid Id, string Name, string Description, decimal UnitPrice, int StockQuantity);
public record CreateMedicineRequest(string Name, string Description, decimal UnitPrice, int StockQuantity);
public record DispenseRequest(Guid MedicineId, int Quantity);

// Billing / Payment
public record BillingDto(Guid Id, Guid PatientId, decimal Amount, decimal AmountPaid, string Status);
public record CreateBillingRequest(Guid PatientId, decimal Amount);
public record PaymentDto(Guid Id, Guid BillingId, decimal AmountPaid, string Method, string TransactionRef);
public record CreatePaymentRequest(Guid BillingId, decimal AmountPaid, string Method, string? TransactionRef);

// Telemedicine
public record TelemedicineDto(
    Guid Id, Guid AppointmentId, string MeetingUrl, string Status,
    string? PatientName = null, string? DoctorName = null, DateTime? ScheduledAt = null);
public record CreateTelemedicineRequest(Guid AppointmentId);
public record UpdateTelemedicineRequest(string Status);

// Settings
public record ClinicSettingsDto(Guid Id, string ClinicName, string Timezone, string ContactEmail, string ContactPhone);
public record UpdateClinicSettingsRequest(string ClinicName, string Timezone, string ContactEmail, string ContactPhone);

// Reports
public record ReportsSummaryDto(int Patients, int Doctors, int Appointments, int PendingBills, int CdssEvaluations, decimal TotalRevenue);

// Dashboard (role-aware)
public record LabResultPreviewDto(string Name, string Value, string ReferenceRange, string Flag);

public record DashboardStatsDto(
    int Patients,
    int Doctors,
    int Appointments,
    int AppointmentsToday,
    int UpcomingAppointments,
    int Consultations,
    int ActiveConsultations,
    int Prescriptions,
    int PendingLabTests,
    int ActiveLabTests,
    int CompletedLabToday,
    int AwaitingLabVerification,
    int TotalMedicines,
    int LowStockMedicines,
    int CriticalStockMedicines,
    int ExpiringSoonMedicines,
    int DispensedToday,
    int PendingBills,
    int TelemedicineSessions,
    int ActiveTelemedicineSessions,
    int UpcomingVirtualAppointments,
    int AiAnalyses,
    decimal TotalRevenue,
    int NewPatientsThisMonth,
    string? NextAppointmentAt,
    IReadOnlyList<LabResultPreviewDto> LatestLabResults);
