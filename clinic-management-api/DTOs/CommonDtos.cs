namespace clinic_management_api.DTOs;

public record PagedQuery(int Page = 1, int PageSize = 10, string? Search = null);

public record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);

public record ApiResponse<T>(bool Success, T? Data, string? Message = null);
