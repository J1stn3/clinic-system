using clinic_management_api.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace clinic_management_api.Controllers;

/// <summary>
/// Base API controller for the ICMS MVC layer.
/// Controllers handle HTTP only; business logic lives in services.
/// </summary>
[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
  protected IActionResult OkData<T>(T data) => Ok(data);

  protected IActionResult OkMessage<T>(T data, string message) =>
      Ok(new ApiResponse<T>(true, data, message));

  protected IActionResult Fail(string message, int statusCode = StatusCodes.Status400BadRequest) =>
      StatusCode(statusCode, new ApiResponse<object>(false, null, message));
}
