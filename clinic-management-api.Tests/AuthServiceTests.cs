using clinic_management_api.Data;
using clinic_management_api.DTOs;
using clinic_management_api.Helpers;
using clinic_management_api.Models;
using clinic_management_api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace clinic_management_api.Tests;

public class AuthServiceTests
{
    [Fact]
    public async Task LoginAsync_ReturnsTokens_ForValidCredentials()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var db = new ApplicationDbContext(options);
        db.Users.Add(new User
        {
            FullName = "Test Admin",
            Email = "test@icms.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            RoleName = RoleNames.Administrator,
            IsActive = true
        });
        await db.SaveChangesAsync();

        var jwtOptions = Options.Create(new JwtOptions
        {
            Secret = "TestSecretKeyThatIsLongEnoughForHmacSha256",
            Issuer = "ICMS",
            Audience = "ICMS",
            AccessTokenMinutes = 60,
            RefreshTokenDays = 7
        });
        var service = new AuthService(db, jwtOptions, new FakeCurrentUser());
        var result = await service.LoginAsync(new LoginRequest("test@icms.local", "Admin@123"));

        Assert.NotNull(result);
        Assert.False(string.IsNullOrWhiteSpace(result!.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(result.RefreshToken));
    }

    [Fact]
    public async Task RegisterPatientAsync_AlwaysCreatesPatientRole()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var db = new ApplicationDbContext(options);
        var jwtOptions = Options.Create(new JwtOptions
        {
            Secret = "TestSecretKeyThatIsLongEnoughForHmacSha256",
            Issuer = "ICMS",
            Audience = "ICMS",
            AccessTokenMinutes = 60,
            RefreshTokenDays = 7
        });
        var service = new AuthService(db, jwtOptions, new FakeCurrentUser());

        var result = await service.RegisterPatientAsync(new PatientRegisterRequest(
            "Jane Patient",
            "jane.patient@example.com",
            "Patient@123",
            "Female",
            new DateTime(1995, 5, 15, 0, 0, 0, DateTimeKind.Utc)));

        Assert.Equal(RoleNames.Patient, result.RoleName);
        var user = await db.Users.SingleAsync(u => u.Email == "jane.patient@example.com");
        Assert.Equal(RoleNames.Patient, user.RoleName);
        Assert.True(await db.Patients.AnyAsync(p => p.UserId == user.Id));
        Assert.False(await db.Doctors.AnyAsync(d => d.UserId == user.Id));
    }

    private sealed class FakeCurrentUser : ICurrentUserService
    {
        public Guid? UserId { get; } = Guid.NewGuid();
        public string? Role { get; } = RoleNames.Administrator;
        public bool IsAuthenticated => true;
        public Task<Guid?> GetPatientProfileIdAsync() => Task.FromResult<Guid?>(null);
        public Task<Guid?> GetDoctorProfileIdAsync() => Task.FromResult<Guid?>(null);
        public void EnsureRole(params string[] roles) { }
    }
}
