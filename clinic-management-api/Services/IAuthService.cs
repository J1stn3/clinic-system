using clinic_management_api.DTOs;

namespace clinic_management_api.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task<AuthResponse?> RefreshAsync(RefreshRequest request);
    Task<UserProfileDto?> GetMeAsync();
}
