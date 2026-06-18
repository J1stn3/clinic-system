using clinic_management_api.Authorization;
using clinic_management_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace clinic_management_api.Controllers;

[Route("api/[controller]")]
[Authorize(Policy = AuthorizationPolicies.AdminOnly)]
public class ReportsController(IReportsService service) : ApiControllerBase
{
    [HttpGet("summary")]
    public async Task<IActionResult> Summary() => OkData(await service.GetSummaryAsync());
}
