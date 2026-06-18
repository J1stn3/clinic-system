using clinic_management_api.Authorization;
using clinic_management_api.DTOs;
using clinic_management_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace clinic_management_api.Controllers;

[Route("api/[controller]")]
[Authorize]
public class ConsultationController(IConsultationService service) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedQuery query) => OkData(await service.GetAllAsync(query));

    [Authorize(Policy = AuthorizationPolicies.DoctorOnly)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateConsultationRequest request) => OkData(await service.CreateAsync(request));

    [Authorize(Policy = AuthorizationPolicies.DoctorOnly)]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateConsultationRequest request) => OkData(await service.UpdateAsync(id, request));
}
