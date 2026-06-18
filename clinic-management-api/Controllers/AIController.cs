using clinic_management_api.Authorization;
using clinic_management_api.DTOs;
using clinic_management_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace clinic_management_api.Controllers;

[Route("api/[controller]")]
[Authorize(Policy = AuthorizationPolicies.DoctorOnly)]
public class AIController(ICdssService cdssService) : ApiControllerBase
{
    private const string CdssDisclaimer =
        "Clinical Decision Support provides recommendations only; final medical decision remains with the doctor.";

    [HttpPost("clinical-support/{patientId:guid}")]
    public async Task<IActionResult> Evaluate(Guid patientId, [FromBody] CdssRequest request)
    {
        var result = await cdssService.EvaluateAsync(patientId, request);
        return OkData(new CdssEvaluationResponse(CdssDisclaimer, result));
    }
}
