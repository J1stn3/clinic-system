using clinic_management_api.Authorization;
using clinic_management_api.DTOs;
using clinic_management_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace clinic_management_api.Controllers;

[Route("api/[controller]")]
[Authorize]
public class DoctorController(IDoctorService service) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedQuery query) => OkData(await service.GetAllAsync(query));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var doctor = await service.GetByIdAsync(id);
        return doctor is null ? NotFound() : OkData(doctor);
    }

    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDoctorRequest request) => OkData(await service.CreateAsync(request));
}
