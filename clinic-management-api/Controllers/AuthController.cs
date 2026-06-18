using clinic_management_api.Authorization;
using clinic_management_api.DTOs;
using clinic_management_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace clinic_management_api.Controllers;

/// <summary>Authentication and session management for ICMS.</summary>
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ApiControllerBase
{
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request) =>
        OkData(await authService.RegisterAsync(request));

    /// <summary>Public self-service signup — always creates a Patient account.</summary>
    [AllowAnonymous]
    [HttpPost("register/patient")]
    public async Task<IActionResult> RegisterPatient([FromBody] PatientRegisterRequest request) =>
        OkData(await authService.RegisterPatientAsync(request));

    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request) =>
        OkData(await authService.ForgotPasswordAsync(request));

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await authService.LoginAsync(request);
        return result is null ? Unauthorized() : OkData(result);
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
    {
        var result = await authService.RefreshAsync(request);
        return result is null ? Unauthorized() : OkData(result);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var profile = await authService.GetMeAsync();
        return profile is null ? NotFound() : OkData(profile);
    }
}
