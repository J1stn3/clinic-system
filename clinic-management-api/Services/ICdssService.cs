using clinic_management_api.DTOs;

namespace clinic_management_api.Services;

public interface ICdssService
{
    Task<CdssResponse> EvaluateAsync(Guid patientId, CdssRequest request);
}
