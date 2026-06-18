using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using clinic_management_api.Models;
using Microsoft.EntityFrameworkCore;

namespace clinic_management_api.Data;

public static class DbSeeder
{
    public const int MinRecordsPerModule = 10;
    public const string DefaultPassword = "Admin@123";

    // Exactly three demo logins — one per role (Administrator, Doctor, Patient)
    public static readonly Guid AdminUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid DoctorUserId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid PatientUserId = Guid.Parse("33333333-3333-3333-3333-333333333333");
    public static readonly Guid DoctorProfileId = Guid.Parse("44444444-4444-4444-4444-444444444444");
    public static readonly Guid PatientProfileId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    private const string AdminEmail = "admin@icms.local";
    private const string DoctorEmail = "doctor@icms.local";
    private const string PatientEmail = "patient@icms.local";

    private static readonly (string Name, string Description, decimal Price, int Stock)[] MedicineCatalog =
    [
        ("Amoxicillin", "Antibiotic capsule 500mg", 12.50m, 240),
        ("Paracetamol", "Analgesic tablet 500mg", 3.00m, 520),
        ("Ibuprofen", "NSAID tablet 400mg", 5.50m, 310),
        ("Metformin", "Antidiabetic tablet 500mg", 8.00m, 180),
        ("Losartan", "Antihypertensive tablet 50mg", 9.75m, 220),
        ("Salbutamol Inhaler", "Bronchodilator inhaler", 185.00m, 45),
        ("Omeprazole", "Proton pump inhibitor 20mg", 6.25m, 275),
        ("Cetirizine", "Antihistamine tablet 10mg", 4.50m, 340),
        ("Azithromycin", "Macrolide antibiotic 250mg", 18.00m, 95),
        ("Amlodipine", "Calcium channel blocker 5mg", 7.80m, 190),
        ("Insulin Glargine", "Long-acting insulin pen", 650.00m, 28),
        ("Vitamin B Complex", "Supplement tablet", 2.75m, 400),
    ];

    private static readonly string[] Symptoms =
    [
        "fever, cough, sore throat", "chest tightness, shortness of breath", "abdominal pain, nausea",
        "joint pain, morning stiffness", "skin rash, itching", "headache, dizziness",
        "frequent urination, fatigue", "back pain after lifting", "ear pain, mild fever",
        "blurred vision, eye strain", "anxiety, insomnia", "leg swelling, weight gain",
    ];

    private static readonly string[] Diagnoses =
    [
        "Acute upper respiratory tract infection", "Hypertensive urgency, stable", "Acute gastroenteritis",
        "Osteoarthritis flare", "Contact dermatitis", "Tension-type headache",
        "Type 2 diabetes mellitus, uncontrolled", "Lumbar muscle strain", "Otitis media, mild",
        "Refractive error, no acute pathology", "Generalized anxiety disorder", "Chronic venous insufficiency",
    ];

    private static readonly string[] LabTests =
    [
        "Complete Blood Count (CBC)", "Fasting Blood Glucose", "HbA1c", "Lipid Panel",
        "Chest X-Ray", "Urinalysis", "Thyroid Stimulating Hormone (TSH)", "ECG",
        "Liver Function Test", "Renal Function Panel", "Dengue NS1 Antigen", "COVID-19 Rapid Antigen",
    ];

    public static async Task SeedAsync(ApplicationDbContext db)
    {
        await db.Database.MigrateAsync();
        await EnsureClinicSettingsAsync(db);
        await EnsureRolesAsync(db);
        await EnsureRealWorldDatasetAsync(db);
    }

    private static Guid AppointmentGuid(int index) => SeedGuid("appointment", index);
    private static Guid BillingGuid(int index) => SeedGuid("billing", index);

    private static Guid SeedGuid(string category, int index)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes($"icms-seed-{category}-{index}"));
        var bytes = new byte[16];
        Array.Copy(hash, bytes, 16);
        bytes[6] = (byte)((bytes[6] & 0x0F) | 0x40);
        bytes[8] = (byte)((bytes[8] & 0x3F) | 0x80);
        return new Guid(bytes);
    }

    private static async Task EnsureClinicSettingsAsync(ApplicationDbContext db)
    {
        if (await db.ClinicSettings.AnyAsync()) return;
        db.ClinicSettings.Add(new ClinicSettings
        {
            ClinicName = "ICMS Central Clinic — Makati Branch",
            Timezone = "UTC+8",
            ContactEmail = "frontdesk@icms-central.ph",
            ContactPhone = "+63-2-8888-1200"
        });
        await db.SaveChangesAsync();
    }

    private static async Task EnsureRolesAsync(ApplicationDbContext db)
    {
        foreach (var roleName in RoleNames.All)
        {
            if (await db.Roles.AnyAsync(r => r.Name == roleName)) continue;
            db.Roles.Add(new Role { Name = roleName });
        }
        if (db.ChangeTracker.HasChanges()) await db.SaveChangesAsync();
    }

    private static async Task<bool> HasCompleteFeatureDatasetAsync(ApplicationDbContext db) =>
        await db.Appointments.CountAsync() >= MinRecordsPerModule
        && await db.Consultations.CountAsync() >= MinRecordsPerModule
        && await db.MedicalRecords.CountAsync() >= MinRecordsPerModule
        && await db.Prescriptions.CountAsync() >= MinRecordsPerModule
        && await db.LaboratoryResults.CountAsync() >= MinRecordsPerModule
        && await db.Medicines.CountAsync() >= MinRecordsPerModule
        && await db.Billings.CountAsync() >= MinRecordsPerModule
        && await db.TelemedicineSessions.CountAsync() >= MinRecordsPerModule
        && await db.AIDecisionSupportLogs.CountAsync() >= MinRecordsPerModule;

    private static async Task EnsureRealWorldDatasetAsync(ApplicationDbContext db)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(DefaultPassword);

        await EnsureCanonicalUsersAsync(db, passwordHash);

        if (await HasCompleteFeatureDatasetAsync(db)) return;

        await EnsureMedicinesAsync(db);

        var doctorId = await db.Doctors.Where(d => d.Id == DoctorProfileId).Select(d => d.Id).FirstAsync();
        var patientId = await db.Patients.Where(p => p.Id == PatientProfileId).Select(p => p.Id).FirstAsync();

        await EnsureAppointmentsAsync(db, doctorId, patientId);
        await EnsureConsultationsAsync(db, doctorId, patientId);
        await EnsureMedicalRecordsAsync(db, doctorId, patientId);
        await EnsurePrescriptionsAsync(db, doctorId, patientId);
        await EnsureLaboratoryResultsAsync(db, doctorId, patientId);
        await EnsureBillingsAndPaymentsAsync(db, patientId);
        await EnsureTelemedicineAsync(db);
        await EnsureCdssLogsAsync(db, doctorId, patientId);
    }

    /// <summary>
    /// Seeds exactly three user accounts: one Administrator, one Doctor, one Patient.
    /// </summary>
    private static async Task EnsureCanonicalUsersAsync(ApplicationDbContext db, string passwordHash)
    {
        if (!await db.Users.AnyAsync(u => u.Email == AdminEmail))
        {
            db.Users.Add(new User
            {
                Id = AdminUserId,
                FullName = "Roberto Villanueva",
                Email = AdminEmail,
                PasswordHash = passwordHash,
                RoleName = RoleNames.Administrator,
                IsActive = true
            });
        }

        if (!await db.Users.AnyAsync(u => u.Email == DoctorEmail))
        {
            db.Users.Add(new User
            {
                Id = DoctorUserId,
                FullName = "Dr. Maria Jane Reyes",
                Email = DoctorEmail,
                PasswordHash = passwordHash,
                RoleName = RoleNames.Doctor,
                IsActive = true
            });
            db.Doctors.Add(new Doctor
            {
                Id = DoctorProfileId,
                UserId = DoctorUserId,
                Specialty = "Internal Medicine",
                LicenseNumber = "PRC-MD-2018-0142"
            });
        }
        else if (!await db.Doctors.AnyAsync(d => d.UserId == DoctorUserId))
        {
            var doctorUserId = await db.Users.Where(u => u.Email == DoctorEmail).Select(u => u.Id).FirstAsync();
            db.Doctors.Add(new Doctor
            {
                Id = DoctorProfileId,
                UserId = doctorUserId,
                Specialty = "Internal Medicine",
                LicenseNumber = "PRC-MD-2018-0142"
            });
        }

        if (!await db.Users.AnyAsync(u => u.Email == PatientEmail))
        {
            db.Users.Add(new User
            {
                Id = PatientUserId,
                FullName = "Juan Dela Cruz",
                Email = PatientEmail,
                PasswordHash = passwordHash,
                RoleName = RoleNames.Patient,
                IsActive = true
            });
            db.Patients.Add(new Patient
            {
                Id = PatientProfileId,
                UserId = PatientUserId,
                Gender = "Male",
                DateOfBirth = new DateTime(1980, 6, 15, 0, 0, 0, DateTimeKind.Utc)
            });
        }
        else if (!await db.Patients.AnyAsync(p => p.UserId == PatientUserId))
        {
            var patientUserId = await db.Users.Where(u => u.Email == PatientEmail).Select(u => u.Id).FirstAsync();
            db.Patients.Add(new Patient
            {
                Id = PatientProfileId,
                UserId = patientUserId,
                Gender = "Male",
                DateOfBirth = new DateTime(1980, 6, 15, 0, 0, 0, DateTimeKind.Utc)
            });
        }

        if (db.ChangeTracker.HasChanges()) await db.SaveChangesAsync();
    }

    private static async Task EnsureMedicinesAsync(ApplicationDbContext db)
    {
        if (await db.Medicines.CountAsync() >= MinRecordsPerModule) return;

        foreach (var (name, description, price, stock) in MedicineCatalog)
        {
            if (await db.Medicines.AnyAsync(m => m.Name == name)) continue;
            db.Medicines.Add(new Medicine
            {
                Name = name,
                Description = description,
                UnitPrice = price,
                StockQuantity = stock
            });
        }
        if (db.ChangeTracker.HasChanges()) await db.SaveChangesAsync();
    }

    private static async Task EnsureAppointmentsAsync(ApplicationDbContext db, Guid doctorId, Guid patientId)
    {
        if (await db.Appointments.CountAsync() >= MinRecordsPerModule) return;

        var statuses = new[]
        {
            "Completed", "Completed", "Completed", "Completed", "Completed",
            "Completed", "Completed", "Completed", "Completed", "Completed",
            "Scheduled", "Cancelled",
        };

        for (var i = 0; i < 12; i++)
        {
            var id = AppointmentGuid(i);
            if (await db.Appointments.AnyAsync(a => a.Id == id)) continue;

            db.Appointments.Add(new Appointment
            {
                Id = id,
                PatientId = patientId,
                DoctorId = doctorId,
                ScheduledAt = DateTime.UtcNow.AddDays(i - 6).AddHours(9 + (i % 6)),
                Status = statuses[i],
                Notes = i % 3 == 0 ? "PhilHealth member — bring ID and LOA" : i % 2 == 0 ? "Fasting required for lab work" : "Walk-in follow-up",
                IsVirtual = i < MinRecordsPerModule
            });
        }
        if (db.ChangeTracker.HasChanges()) await db.SaveChangesAsync();
    }

    private static async Task EnsureConsultationsAsync(ApplicationDbContext db, Guid doctorId, Guid patientId)
    {
        if (await db.Consultations.CountAsync() >= MinRecordsPerModule) return;

        var completedAppointments = await db.Appointments
            .Where(a => a.Status == "Completed" && a.Consultation == null)
            .Take(MinRecordsPerModule)
            .ToListAsync();

        var idx = 0;
        foreach (var apt in completedAppointments)
        {
            db.Consultations.Add(new Consultation
            {
                AppointmentId = apt.Id,
                DoctorId = doctorId,
                PatientId = patientId,
                Symptoms = Symptoms[idx % Symptoms.Length],
                Diagnosis = Diagnoses[idx % Diagnoses.Length]
            });
            idx++;
        }

        if (db.ChangeTracker.HasChanges()) await db.SaveChangesAsync();
    }

    private static async Task EnsureMedicalRecordsAsync(ApplicationDbContext db, Guid doctorId, Guid patientId)
    {
        if (await db.MedicalRecords.CountAsync() >= MinRecordsPerModule) return;

        var histories = new[]
        {
            "Hypertension, penicillin allergy", "Type 2 diabetes, family history of CAD", "Asthma since childhood",
            "Previous appendectomy 2019", "No known drug allergies", "GERD, lactose intolerance",
            "Hypothyroidism on levothyroxine", "Smoker, 10 pack-years", "Peanut allergy", "Migraine with aura",
            "Chronic kidney disease stage 2", "Follow-up visit — Juan Dela Cruz",
        };

        for (var i = 0; i < MinRecordsPerModule; i++)
        {
            db.MedicalRecords.Add(new MedicalRecord
            {
                PatientId = patientId,
                DoctorId = doctorId,
                History = histories[i],
                Vitals = $"BP {120 + i}/{80 + (i % 10)}, Temp {36.5 + (i % 3) * 0.3:F1}C, HR {72 + i % 15}"
            });
        }
        if (db.ChangeTracker.HasChanges()) await db.SaveChangesAsync();
    }

    private static async Task EnsurePrescriptionsAsync(ApplicationDbContext db, Guid doctorId, Guid patientId)
    {
        if (await db.Prescriptions.CountAsync() >= MinRecordsPerModule) return;

        for (var i = 0; i < MinRecordsPerModule; i++)
        {
            var med = MedicineCatalog[i % MedicineCatalog.Length];
            db.Prescriptions.Add(new Prescription
            {
                PatientId = patientId,
                DoctorId = doctorId,
                Medication = med.Name,
                Dosage = i % 2 == 0 ? "1 tablet" : "2 tablets",
                Instructions = i % 3 == 0 ? "Take after meals for 7 days" : "Take every 8 hours as needed"
            });
        }
        await db.SaveChangesAsync();
    }

    private static async Task EnsureLaboratoryResultsAsync(ApplicationDbContext db, Guid doctorId, Guid patientId)
    {
        if (await db.LaboratoryResults.CountAsync() >= MinRecordsPerModule) return;

        for (var i = 0; i < MinRecordsPerModule; i++)
        {
            var completed = i % 3 != 0;
            db.LaboratoryResults.Add(new LaboratoryResult
            {
                PatientId = patientId,
                DoctorId = doctorId,
                TestName = LabTests[i % LabTests.Length],
                ResultValue = completed ? $"See attached report #{1000 + i}" : "",
                Status = completed ? "Completed" : "Requested"
            });
        }
        await db.SaveChangesAsync();
    }

    private static async Task EnsureBillingsAndPaymentsAsync(ApplicationDbContext db, Guid patientId)
    {
        if (await db.Billings.CountAsync() >= MinRecordsPerModule) return;

        var amounts = new[] { 850m, 1200m, 450m, 3200m, 675m, 1500m, 980m, 2400m, 550m, 1890m, 725m, 1100m };
        var methods = new[] { "Cash", "Card", "GCash", "Maya", "Bank Transfer" };

        for (var i = 0; i < MinRecordsPerModule; i++)
        {
            var id = BillingGuid(i);
            if (await db.Billings.AnyAsync(b => b.Id == id)) continue;

            var amount = amounts[i];
            var isPaid = i % 3 == 0;
            var isPartial = i % 5 == 0 && !isPaid;
            var paid = isPaid ? amount : isPartial ? amount / 2 : 0m;
            var status = isPaid ? "Paid" : paid > 0 ? "Partial" : "Pending";

            db.Billings.Add(new Billing
            {
                Id = id,
                PatientId = patientId,
                Amount = amount,
                AmountPaid = paid,
                Status = status
            });

            if (paid > 0)
            {
                db.Payments.Add(new Payment
                {
                    BillingId = id,
                    AmountPaid = paid,
                    Method = methods[i % methods.Length],
                    TransactionRef = $"TXN-2026-{10001 + i:D4}"
                });
            }
        }
        await db.SaveChangesAsync();
    }

    private static async Task EnsureTelemedicineAsync(ApplicationDbContext db)
    {
        if (await db.TelemedicineSessions.CountAsync() >= MinRecordsPerModule) return;

        var virtualAppointments = await db.Appointments
            .Where(a => a.IsVirtual && a.TelemedicineSession == null)
            .Take(MinRecordsPerModule)
            .ToListAsync();

        foreach (var apt in virtualAppointments)
        {
            db.TelemedicineSessions.Add(new TelemedicineSession
            {
                AppointmentId = apt.Id,
                MeetingUrl = $"https://meet.jit.si/icms-{apt.Id:N}",
                Status = apt.Status == "Completed" ? "Completed" : "Created"
            });
        }
        if (db.ChangeTracker.HasChanges()) await db.SaveChangesAsync();
    }

    private static async Task EnsureCdssLogsAsync(ApplicationDbContext db, Guid doctorId, Guid patientId)
    {
        if (await db.AIDecisionSupportLogs.CountAsync() >= MinRecordsPerModule) return;

        for (var i = 0; i < MinRecordsPerModule; i++)
        {
            var input = JsonSerializer.Serialize(new
            {
                age = 30 + i,
                gender = "Male",
                symptoms = Symptoms[i].Split(", "),
                history = new[] { i % 4 == 0 ? "penicillin allergy" : "hypertension" },
                vitals = new { bp = $"{120 + i}/{80 + (i % 8)}" }
            });
            var output = JsonSerializer.Serialize(new
            {
                possibleDiseases = new[] { new { name = Diagnoses[i].Split(',')[0], confidence = 0.65 + (i % 3) * 0.1 } },
                recommendedTests = new[] { LabTests[i % LabTests.Length] },
                warnings = i % 4 == 0 ? new[] { "Allergy alert: penicillin." } : Array.Empty<string>()
            });

            db.AIDecisionSupportLogs.Add(new AIDecisionSupportLog
            {
                DoctorId = doctorId,
                PatientId = patientId,
                InputJson = input,
                OutputJson = output
            });
        }
        await db.SaveChangesAsync();
    }
}
