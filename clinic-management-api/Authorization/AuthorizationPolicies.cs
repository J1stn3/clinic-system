using clinic_management_api.Models;

namespace clinic_management_api.Authorization;

/// <summary>Named authorization policies for role-based API access.</summary>
public static class AuthorizationPolicies
{
    public const string AdminOnly = nameof(AdminOnly);
    public const string DoctorOnly = nameof(DoctorOnly);
    public const string PatientOnly = nameof(PatientOnly);
    public const string StaffOnly = nameof(StaffOnly);
    public const string PatientOrAdmin = nameof(PatientOrAdmin);

    public static void Configure(Microsoft.AspNetCore.Authorization.AuthorizationOptions options)
    {
        options.AddPolicy(AdminOnly, policy => policy.RequireRole(RoleNames.Administrator));
        options.AddPolicy(DoctorOnly, policy => policy.RequireRole(RoleNames.Doctor));
        options.AddPolicy(PatientOnly, policy => policy.RequireRole(RoleNames.Patient));
        options.AddPolicy(StaffOnly, policy => policy.RequireRole(RoleNames.Administrator, RoleNames.Doctor));
        options.AddPolicy(PatientOrAdmin, policy =>
            policy.RequireAssertion(ctx =>
                ctx.User.IsInRole(RoleNames.Patient) || ctx.User.IsInRole(RoleNames.Administrator)));
    }
}
