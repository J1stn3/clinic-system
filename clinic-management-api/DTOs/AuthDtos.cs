namespace clinic_management_api.DTOs;

public record RegisterRequest(string FullName, string Email, string Password, string RoleName);
public record PatientRegisterRequest(string FullName, string Email, string Password, string? Gender, DateTime? DateOfBirth);
public record LoginRequest(string Email, string Password);
public record RefreshRequest(string RefreshToken);
public record ForgotPasswordRequest(string Email);
public record AuthResponse(string AccessToken, string RefreshToken, string RoleName, Guid UserId, string FullName);
public record MessageResponse(string Message);
public record PatientRegisterResponse(string Message, string RoleName);
