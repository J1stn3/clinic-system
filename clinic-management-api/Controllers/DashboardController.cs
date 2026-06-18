using clinic_management_api.DTOs;
using clinic_management_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace clinic_management_api.Controllers;

[Route("api/[controller]")]
[Authorize]
public class DashboardController(IDashboardService service) : ApiControllerBase
{
    [HttpGet("stats")]
    public async Task<IActionResult> Stats() => OkData(await service.GetStatsAsync());
}
