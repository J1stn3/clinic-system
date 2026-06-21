using clinic_management_api.DTOs;

namespace clinic_management_api.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<PatientRegisterResponse> RegisterPatientAsync(PatientRegisterRequest request);
    Task<MessageResponse> ForgotPasswordAsync(ForgotPasswordRequest request);
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task<AuthResponse?> RefreshAsync(RefreshRequest request);
    Task<UserProfileDto?> GetMeAsync();
    Task<AuthResponse> GoogleLoginAsync(GoogleLoginRequest request);
    Task<AuthResponse> FacebookLoginAsync(FacebookLoginRequest request);
}
