using clinic_management_api.Data;
using clinic_management_api.DTOs;
using clinic_management_api.Models;
using Microsoft.EntityFrameworkCore;

namespace clinic_management_api.Repositories;

public class GenericRepository<T>(ApplicationDbContext db) : IGenericRepository<T> where T : BaseEntity
{
    private readonly DbSet<T> _set = db.Set<T>();

    public async Task<List<T>> GetAllAsync() => await _set.ToListAsync();

    public async Task<PagedResult<T>> GetPagedAsync(int page, int pageSize, Func<IQueryable<T>, IQueryable<T>>? filter = null)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var query = _set.AsQueryable();
        if (filter is not null) query = filter(query);
        var total = await query.CountAsync();
        var items = await query.OrderByDescending(e => e.CreatedAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return new PagedResult<T>(items, total, page, pageSize);
    }

    public async Task<T?> GetByIdAsync(Guid id) => await _set.FirstOrDefaultAsync(x => x.Id == id);

    public async Task<T> AddAsync(T entity)
    {
        _set.Add(entity);
        await db.SaveChangesAsync();
        return entity;
    }

    public async Task<T> UpdateAsync(T entity)
    {
        _set.Update(entity);
        await db.SaveChangesAsync();
        return entity;
    }

    public async Task<bool> SoftDeleteAsync(Guid id)
    {
        var entity = await _set.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (entity is null) return false;
        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return true;
    }
}
