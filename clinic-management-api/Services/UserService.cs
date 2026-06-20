using clinic_management_api.Data;
using clinic_management_api.DTOs;
using clinic_management_api.Helpers;
using clinic_management_api.Models;
using Microsoft.EntityFrameworkCore;

namespace clinic_management_api.Services;

public interface IUserService
{
    Task<PagedResult<UserDto>> GetAllAsync(PagedQuery query);
    Task<UserDto> CreateAsync(CreateUserRequest request);
    Task<UserDto> UpdateAsync(Guid id, UpdateUserRequest request);
    Task<bool> DeleteAsync(Guid id);
    Task<UserProfileDto?> GetProfileAsync();
}

public class UserService(ApplicationDbContext db, ICurrentUserService currentUser) : IUserService
{
    public async Task<PagedResult<UserDto>> GetAllAsync(PagedQuery query)
    {
        currentUser.EnsureRole(RoleNames.Administrator);
        var q = db.Users.AsQueryable();
        if (!string.IsNullOrWhiteSpace(query.Search))
            q = q.Where(u => u.FullName.Contains(query.Search) || u.Email.Contains(query.Search));

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(u => u.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .Select(u => new UserDto(u.Id, u.FullName, u.Email, u.RoleName, u.IsActive, u.CreatedAt))
            .ToListAsync();
        return new PagedResult<UserDto>(items, total, query.Page, query.PageSize);
    }

    public async Task<UserDto> CreateAsync(CreateUserRequest request)
    {
        currentUser.EnsureRole(RoleNames.Administrator);
        if (!RoleNames.All.Contains(request.RoleName))
            throw new InvalidOperationException("Invalid role.");

        if (await db.Users.AnyAsync(u => u.Email == request.Email.ToLowerInvariant()))
            throw new InvalidOperationException("Email already exists.");

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email.ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleName = request.RoleName
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        if (request.RoleName == RoleNames.Patient)
        {
            db.Patients.Add(new Patient 
            { 
                UserId = user.Id, 
                Gender = request.Gender,
                DateOfBirth = request.DateOfBirth?.ToUniversalTime()
            });
        }
        else if (request.RoleName == RoleNames.Doctor)
        {
            db.Doctors.Add(new Doctor { UserId = user.Id, Specialty = request.Specialty, LicenseNumber = request.LicenseNumber });
        }
        await db.SaveChangesAsync();
        return new UserDto(user.Id, user.FullName, user.Email, user.RoleName, user.IsActive, user.CreatedAt);
    }

    public async Task<UserDto> UpdateAsync(Guid id, UpdateUserRequest request)
    {
        currentUser.EnsureRole(RoleNames.Administrator);
        var user = await db.Users.FindAsync(id) ?? throw new KeyNotFoundException("User not found.");
        user.FullName = request.FullName;
        user.Email = request.Email.ToLowerInvariant();
        user.RoleName = request.RoleName;
        user.IsActive = request.IsActive;
        await db.SaveChangesAsync();
        return new UserDto(user.Id, user.FullName, user.Email, user.RoleName, user.IsActive, user.CreatedAt);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        currentUser.EnsureRole(RoleNames.Administrator);
        var user = await db.Users.FindAsync(id);
        if (user is null) return false;
        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;
        user.IsActive = false;
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<UserProfileDto?> GetProfileAsync()
    {
        if (currentUser.UserId is null) return null;
        var user = await db.Users.FindAsync(currentUser.UserId.Value);
        if (user is null) return null;
        var patientId = await currentUser.GetPatientProfileIdAsync();
        var doctorId = await currentUser.GetDoctorProfileIdAsync();
        return new UserProfileDto(user.Id, user.FullName, user.Email, user.RoleName, patientId, doctorId);
    }
}
