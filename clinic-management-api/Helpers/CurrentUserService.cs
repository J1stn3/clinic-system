using System.Security.Claims;
using clinic_management_api.Data;
using clinic_management_api.Models;
using Microsoft.EntityFrameworkCore;

namespace clinic_management_api.Helpers;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Role { get; }
    bool IsAuthenticated { get; }
    Task<Guid?> GetPatientProfileIdAsync();
    Task<Guid?> GetDoctorProfileIdAsync();
    void EnsureRole(params string[] roles);
}

public class CurrentUserService(IHttpContextAccessor http, ApplicationDbContext db) : ICurrentUserService
{
    public Guid? UserId
    {
        get
        {
            var id = http.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(id, out var guid) ? guid : null;
        }
    }

    public string? Role => http.HttpContext?.User.FindFirstValue(ClaimTypes.Role);
    public bool IsAuthenticated => UserId.HasValue;

    public async Task<Guid?> GetPatientProfileIdAsync()
    {
        if (UserId is null) return null;
        return await db.Patients.Where(p => p.UserId == UserId).Select(p => (Guid?)p.Id).FirstOrDefaultAsync();
    }

    public async Task<Guid?> GetDoctorProfileIdAsync()
    {
        if (UserId is null) return null;
        return await db.Doctors.Where(d => d.UserId == UserId).Select(d => (Guid?)d.Id).FirstOrDefaultAsync();
    }

    public void EnsureRole(params string[] roles)
    {
        if (Role is null || !roles.Contains(Role))
            throw new UnauthorizedAccessException("Insufficient permissions.");
    }
}
