using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using clinic_management_api.Data;
using clinic_management_api.DTOs;
using clinic_management_api.Helpers;
using clinic_management_api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace clinic_management_api.Services;

public class AuthService(ApplicationDbContext db, IOptions<JwtOptions> options, ICurrentUserService currentUser) : IAuthService
{
    private readonly JwtOptions _jwt = options.Value;

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        currentUser.EnsureRole(RoleNames.Administrator);
        if (!RoleNames.All.Contains(request.RoleName))
            throw new InvalidOperationException("Invalid role.");

        var exists = await db.Users.AnyAsync(x => x.Email == request.Email.ToLowerInvariant());
        if (exists) throw new InvalidOperationException("Email already exists.");

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
            db.Patients.Add(new Patient { UserId = user.Id });
        else if (request.RoleName == RoleNames.Doctor)
            db.Doctors.Add(new Doctor { UserId = user.Id });
        await db.SaveChangesAsync();

        return await BuildAuthResponse(user);
    }

    public async Task<PatientRegisterResponse> RegisterPatientAsync(PatientRegisterRequest request)
    {
        var email = request.Email.ToLowerInvariant().Trim();
        var exists = await db.Users.AnyAsync(x => x.Email == email);
        if (exists) throw new InvalidOperationException("An account with this email already exists.");

        // Self-service registration is patient-only; role is never taken from the client.
        const string assignedRole = RoleNames.Patient;

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleName = assignedRole
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        db.Patients.Add(new Patient
        {
            UserId = user.Id,
            Gender = request.Gender ?? "Other",
            DateOfBirth = request.DateOfBirth?.ToUniversalTime()
        });
        await db.SaveChangesAsync();

        // RoleName is always Patient here (hardcoded above); no need to re-check.
        return new PatientRegisterResponse(
            "Patient account created successfully. You can now sign in.",
            assignedRole);
    }

    public Task<MessageResponse> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        // In production, send a reset email when the account exists. Always return the same message.
        _ = request.Email.ToLowerInvariant().Trim();
        return Task.FromResult(new MessageResponse(
            "If an account exists for that email, password reset instructions have been sent."));
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await db.Users.FirstOrDefaultAsync(x => x.Email == request.Email.ToLowerInvariant());
        if (user is null || !user.IsActive || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash)) return null;

        // Purge expired refresh tokens for this user to prevent unlimited accumulation.
        var expiredTokens = db.RefreshTokens
            .Where(t => t.UserId == user.Id && (t.IsRevoked || t.ExpiresAt < DateTime.UtcNow));
        db.RefreshTokens.RemoveRange(expiredTokens);

        return await BuildAuthResponse(user);
    }

    public async Task<AuthResponse?> RefreshAsync(RefreshRequest request)
    {
        var token = await db.RefreshTokens.FirstOrDefaultAsync(x => x.Token == request.RefreshToken && !x.IsRevoked);
        if (token is null || token.ExpiresAt < DateTime.UtcNow) return null;
        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == token.UserId);
        if (user is null || !user.IsActive) return null;
        token.IsRevoked = true;
        await db.SaveChangesAsync();
        return await BuildAuthResponse(user);
    }

    public async Task<UserProfileDto?> GetMeAsync()
    {
        if (currentUser.UserId is null) return null;
        var user = await db.Users.FindAsync(currentUser.UserId.Value);
        if (user is null) return null;
        var patientId = await currentUser.GetPatientProfileIdAsync();
        var doctorId = await currentUser.GetDoctorProfileIdAsync();
        return new UserProfileDto(user.Id, user.FullName, user.Email, user.RoleName, patientId, doctorId);
    }

    private async Task<AuthResponse> BuildAuthResponse(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.Role, user.RoleName),
            new(ClaimTypes.Name, user.FullName)
        };
        var token = new JwtSecurityToken(_jwt.Issuer, _jwt.Audience, claims, expires: DateTime.UtcNow.AddMinutes(_jwt.AccessTokenMinutes), signingCredentials: creds);
        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);

        var refresh = new RefreshToken
        {
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwt.RefreshTokenDays)
        };
        db.RefreshTokens.Add(refresh);
        await db.SaveChangesAsync();
        return new AuthResponse(accessToken, refresh.Token, user.RoleName, user.Id, user.FullName);
    }
}
