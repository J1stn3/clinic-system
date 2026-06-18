using clinic_management_api.Authorization;
using clinic_management_api.DTOs;
using clinic_management_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace clinic_management_api.Controllers;

[Route("api/[controller]")]
[Authorize]
public class SettingsController(ISettingsService service) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get() => OkData(await service.GetAsync());

    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateClinicSettingsRequest request) => OkData(await service.UpdateAsync(request));
}
