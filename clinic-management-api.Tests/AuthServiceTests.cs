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
