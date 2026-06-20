using clinic_management_api.Authorization;
using clinic_management_api.DTOs;
using clinic_management_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace clinic_management_api.Controllers;

[Route("api/[controller]")]
[Authorize]
public class PatientController(IPatientService service) : ApiControllerBase
{
    [Authorize(Policy = AuthorizationPolicies.StaffOnly)]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedQuery query) => OkData(await service.GetAllAsync(query));

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var patient = await service.GetByIdAsync(id);
        return patient is null ? NotFound() : OkData(patient);
    }

    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePatientRequest request) => OkData(await service.CreateAsync(request));
}
