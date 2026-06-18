using clinic_management_api.Authorization;
using clinic_management_api.DTOs;
using clinic_management_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace clinic_management_api.Controllers;

[Route("api/[controller]")]
[Authorize]
public class PharmacyController(IPharmacyService service) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedQuery query) => OkData(await service.GetAllAsync(query));

    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMedicineRequest request) => OkData(await service.CreateAsync(request));

    [Authorize(Policy = AuthorizationPolicies.StaffOnly)]
    [HttpPost("dispense")]
    public async Task<IActionResult> Dispense([FromBody] DispenseRequest request) => OkData(await service.DispenseAsync(request));
}
