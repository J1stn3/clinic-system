using clinic_management_api.Authorization;
using clinic_management_api.DTOs;
using clinic_management_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace clinic_management_api.Controllers;

[Route("api/[controller]")]
[Authorize]
public class TelemedicineController(ITelemedicineService service) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedQuery query) => OkData(await service.GetAllAsync(query));

    [HttpGet("appointment/{appointmentId:guid}")]
    public async Task<IActionResult> GetByAppointment(Guid appointmentId)
    {
        var session = await service.GetByAppointmentIdAsync(appointmentId);
        return session is null ? NotFound() : OkData(session);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTelemedicineRequest request) => OkData(await service.CreateAsync(request));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTelemedicineRequest request) =>
        OkData(await service.UpdateAsync(id, request));
}
