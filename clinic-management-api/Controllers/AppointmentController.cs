using clinic_management_api.Authorization;
using clinic_management_api.DTOs;
using clinic_management_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace clinic_management_api.Controllers;

[Route("api/[controller]")]
[Authorize]
public class AppointmentController(IAppointmentService service) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedQuery query) => OkData(await service.GetAllAsync(query));

    [Authorize(Policy = AuthorizationPolicies.BookAppointment)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentRequest request) => OkData(await service.CreateAsync(request));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAppointmentRequest request) => OkData(await service.UpdateAsync(id, request));

    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id) => await service.DeleteAsync(id) ? NoContent() : NotFound();
}
