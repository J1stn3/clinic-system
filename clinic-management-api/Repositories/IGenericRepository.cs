using clinic_management_api.DTOs;
using clinic_management_api.Models;

namespace clinic_management_api.Repositories;

public interface IGenericRepository<T> where T : BaseEntity
{
    Task<List<T>> GetAllAsync();
    Task<PagedResult<T>> GetPagedAsync(int page, int pageSize, Func<IQueryable<T>, IQueryable<T>>? filter = null);
    Task<T?> GetByIdAsync(Guid id);
    Task<T> AddAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task<bool> SoftDeleteAsync(Guid id);
}
