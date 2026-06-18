using clinic_management_api.Data;
using clinic_management_api.DTOs;
using clinic_management_api.Helpers;
using clinic_management_api.Models;
using clinic_management_api.Services;
using Microsoft.EntityFrameworkCore;

namespace clinic_management_api.Tests;

public class BillingRbacTests
{
    [Fact]
    public async Task BillingService_PatientSeesOnlyOwnBills()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var db = new ApplicationDbContext(options);
        var patient1 = Guid.NewGuid();
        var patient2 = Guid.NewGuid();
        var user1 = Guid.NewGuid();

        db.Patients.AddRange(
            new Patient { Id = patient1, UserId = user1 },
            new Patient { Id = patient2, UserId = Guid.NewGuid() });
        db.Billings.AddRange(
            new Billing { PatientId = patient1, Amount = 100, Status = "Pending" },
            new Billing { PatientId = patient2, Amount = 200, Status = "Pending" });
        await db.SaveChangesAsync();

        var currentUser = new FakeCurrentUser
        {
            Role = RoleNames.Patient,
            UserId = user1,
            PatientProfileId = patient1
        };
        var service = new BillingService(db, currentUser);
        var result = await service.GetAllAsync(new PagedQuery(1, 10));

        Assert.Single(result.Items);
        Assert.Equal(patient1, result.Items[0].PatientId);
    }

    private sealed class FakeCurrentUser : ICurrentUserService
    {
        public Guid? UserId { get; set; } = Guid.NewGuid();
        public string? Role { get; set; }
        public Guid? PatientProfileId { get; set; }
        public bool IsAuthenticated => true;
        public Task<Guid?> GetPatientProfileIdAsync() => Task.FromResult(PatientProfileId);
        public Task<Guid?> GetDoctorProfileIdAsync() => Task.FromResult<Guid?>(null);
        public void EnsureRole(params string[] roles) { }
    }
}
