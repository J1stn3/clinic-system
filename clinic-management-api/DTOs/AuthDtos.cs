namespace clinic_management_api.DTOs;

public record RegisterRequest(string FullName, string Email, string Password, string RoleName);
public record LoginRequest(string Email, string Password);
public record RefreshRequest(string RefreshToken);
public record AuthResponse(string AccessToken, string RefreshToken, string RoleName, Guid UserId, string FullName);
