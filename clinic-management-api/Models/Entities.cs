using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace clinic_management_api.Models;

public static class RoleNames
{
    public const string Administrator = "Administrator";
    public const string Doctor = "Doctor";
    public const string Patient = "Patient";

    public static readonly string[] All = [Administrator, Doctor, Patient];
}

public abstract class BaseEntity
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
    public bool IsDeleted { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public byte[] RowVersion { get; set; } = new byte[8];
}

public class Role : BaseEntity
{
    [MaxLength(64)]
    public required string Name { get; set; }
}

public class User : BaseEntity
{
    [MaxLength(128)]
    public required string FullName { get; set; }
    [MaxLength(128)]
    public required string Email { get; set; }
    [MaxLength(256)]
    public required string PasswordHash { get; set; }
    [MaxLength(64)]
    public required string RoleName { get; set; }
    public bool IsActive { get; set; } = true;

    public Patient? Patient { get; set; }
    public Doctor? Doctor { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}

public class RefreshToken : BaseEntity
{
    [MaxLength(512)]
    public required string Token { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
}

public class Patient : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    [MaxLength(32)]
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }

    public ICollection<Appointment> Appointments { get; set; } = [];
    public ICollection<MedicalRecord> MedicalRecords { get; set; } = [];
    public ICollection<Prescription> Prescriptions { get; set; } = [];
    public ICollection<Billing> Billings { get; set; } = [];
}

public class Doctor : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    [MaxLength(128)]
    public string? Specialty { get; set; }
    [MaxLength(64)]
    public string? LicenseNumber { get; set; }

    public ICollection<Appointment> Appointments { get; set; } = [];
}

public class Appointment : BaseEntity
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public Guid DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;
    public DateTime ScheduledAt { get; set; }
    [MaxLength(32)]
    public string Status { get; set; } = "Scheduled";
    [MaxLength(512)]
    public string? Notes { get; set; }
    public bool IsVirtual { get; set; }

    public Consultation? Consultation { get; set; }
    public TelemedicineSession? TelemedicineSession { get; set; }
}

public class Consultation : BaseEntity
{
    public Guid AppointmentId { get; set; }
    public Appointment Appointment { get; set; } = null!;
    public Guid DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public string Symptoms { get; set; } = "";
    public string Diagnosis { get; set; } = "";
}

public class MedicalRecord : BaseEntity
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public Guid DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;
    public string History { get; set; } = "";
    public string Vitals { get; set; } = "";
}

public class Prescription : BaseEntity
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public Guid DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;
    public string Medication { get; set; } = "";
    public string Dosage { get; set; } = "";
    public string Instructions { get; set; } = "";
}

public class LaboratoryResult : BaseEntity
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public Guid DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;
    public string TestName { get; set; } = "";
    public string ResultValue { get; set; } = "";
    public string Status { get; set; } = "Requested";
}

public class Medicine : BaseEntity
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    [Column(TypeName = "numeric(10,2)")]
    public decimal UnitPrice { get; set; }
    public int StockQuantity { get; set; }
}

public class Billing : BaseEntity
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    [Column(TypeName = "numeric(10,2)")]
    public decimal Amount { get; set; }
    [Column(TypeName = "numeric(10,2)")]
    public decimal AmountPaid { get; set; }
    public string Status { get; set; } = "Pending";

    public ICollection<Payment> Payments { get; set; } = [];
}

public class Payment : BaseEntity
{
    public Guid BillingId { get; set; }
    public Billing Billing { get; set; } = null!;
    [Column(TypeName = "numeric(10,2)")]
    public decimal AmountPaid { get; set; }
    public string Method { get; set; } = "Cash";
    public string TransactionRef { get; set; } = "";
}

public class TelemedicineSession : BaseEntity
{
    public Guid AppointmentId { get; set; }
    public Appointment Appointment { get; set; } = null!;
    public string MeetingUrl { get; set; } = "";
    public string Status { get; set; } = "Created";
}

public class AIDecisionSupportLog : BaseEntity
{
    public Guid DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public string InputJson { get; set; } = "";
    public string OutputJson { get; set; } = "";
}

public class ClinicSettings : BaseEntity
{
    [MaxLength(256)]
    public string ClinicName { get; set; } = "ICMS Central Clinic";
    [MaxLength(64)]
    public string Timezone { get; set; } = "UTC+8";
    [MaxLength(256)]
    public string ContactEmail { get; set; } = "contact@icms.local";
    [MaxLength(32)]
    public string ContactPhone { get; set; } = "";
}
