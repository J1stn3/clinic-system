using clinic_management_api.Authorization;
using clinic_management_api.DTOs;
using clinic_management_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace clinic_management_api.Controllers;

[Route("api/[controller]")]
[Authorize]
public class PaymentController(IPaymentService service) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedQuery query) => OkData(await service.GetAllAsync(query));

    [Authorize(Policy = AuthorizationPolicies.PatientOrAdmin)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePaymentRequest request) => OkData(await service.CreateAsync(request));
}
