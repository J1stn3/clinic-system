using clinic_management_api.Data;
using clinic_management_api.DTOs;
using clinic_management_api.Models;
using clinic_management_api.Services;
using Microsoft.EntityFrameworkCore;

namespace clinic_management_api.Tests;

public class CdssServiceTests
{
    [Fact]
    public async Task EvaluateAsync_ReturnsInfluenzaSuggestion_ForFeverAndCough()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var db = new ApplicationDbContext(options);
        var patientId = Guid.NewGuid();
        var doctorId = Guid.NewGuid();
        db.Patients.Add(new Patient { Id = patientId, UserId = Guid.NewGuid(), Gender = "Male" });
        var doctorUserId = Guid.NewGuid();
        db.Doctors.Add(new Doctor { Id = doctorId, UserId = doctorUserId });
        db.MedicalRecords.Add(new MedicalRecord { PatientId = patientId, DoctorId = doctorId, History = "penicillin allergy" });
        await db.SaveChangesAsync();

        var currentUser = new FakeCurrentUser
        {
            UserId = doctorUserId,
            Role = RoleNames.Doctor,
            DoctorProfileId = doctorId,
        };
        var service = new CdssService(db, currentUser);

        var result = await service.EvaluateAsync(patientId,
            new CdssRequest(45, "Male", ["fever", "cough", "fatigue"], ["hypertension"], new Dictionary<string, string> { ["bp"] = "140/90" }));

        Assert.Contains(result.PossibleDiseases, d => d.Name == "Influenza");
        Assert.Contains(result.RecommendedTests, t => t == "CBC");
        Assert.Contains(result.Warnings, w => w.Contains("penicillin", StringComparison.OrdinalIgnoreCase));
        Assert.Single(db.AIDecisionSupportLogs);
    }

    [Fact]
    public async Task PaymentService_UpdatesBillingStatus_WhenFullyPaid()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var db = new ApplicationDbContext(options);
        var patientId = Guid.NewGuid();
        db.Patients.Add(new Patient { Id = patientId, UserId = Guid.NewGuid() });
        var billing = new Billing { PatientId = patientId, Amount = 100, Status = "Pending" };
        db.Billings.Add(billing);
        await db.SaveChangesAsync();

        var currentUser = new FakeCurrentUser { Role = RoleNames.Administrator };
        var service = new PaymentService(db, currentUser);

        await service.CreateAsync(new CreatePaymentRequest(billing.Id, 100, "Cash", "TXN-001"));
        var updated = await db.Billings.FindAsync(billing.Id);

        Assert.Equal("Paid", updated!.Status);
        Assert.Equal(100, updated.AmountPaid);
    }

    private sealed class FakeCurrentUser : Helpers.ICurrentUserService
    {
        public Guid? UserId { get; set; } = Guid.NewGuid();
        public string? Role { get; set; } = RoleNames.Doctor;
        public Guid? DoctorProfileId { get; set; }
        public bool IsAuthenticated => true;
        public Task<Guid?> GetPatientProfileIdAsync() => Task.FromResult<Guid?>(null);
        public Task<Guid?> GetDoctorProfileIdAsync() => Task.FromResult(DoctorProfileId);
        public void EnsureRole(params string[] roles) { }
    }
}
