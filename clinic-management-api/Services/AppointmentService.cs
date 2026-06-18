using clinic_management_api.Data;
using clinic_management_api.DTOs;
using clinic_management_api.Helpers;
using clinic_management_api.Models;
using Microsoft.EntityFrameworkCore;

namespace clinic_management_api.Services;

public interface IAppointmentService
{
    Task<PagedResult<AppointmentDto>> GetAllAsync(PagedQuery query);
    Task<AppointmentDto> CreateAsync(CreateAppointmentRequest request);
    Task<AppointmentDto> UpdateAsync(Guid id, UpdateAppointmentRequest request);
    Task<bool> DeleteAsync(Guid id);
}

public class AppointmentService(ApplicationDbContext db, ICurrentUserService currentUser, ITelemedicineService telemedicine) : IAppointmentService
{
    public async Task<PagedResult<AppointmentDto>> GetAllAsync(PagedQuery query)
    {
        var q = db.Appointments.Include(a => a.Patient).ThenInclude(p => p.User)
            .Include(a => a.Doctor).ThenInclude(d => d.User).AsQueryable();

        if (currentUser.Role == RoleNames.Patient)
        {
            var pid = await currentUser.GetPatientProfileIdAsync();
            q = q.Where(a => a.PatientId == pid);
        }
        else if (currentUser.Role == RoleNames.Doctor)
        {
            var did = await currentUser.GetDoctorProfileIdAsync();
            q = q.Where(a => a.DoctorId == did);
        }

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(a => a.ScheduledAt)
            .Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .Select(a => ToDto(a)).ToListAsync();
        return new PagedResult<AppointmentDto>(items, total, query.Page, query.PageSize);
    }

    public async Task<AppointmentDto> CreateAsync(CreateAppointmentRequest request)
    {
        Guid patientId;
        if (currentUser.Role == RoleNames.Patient)
        {
            patientId = (await currentUser.GetPatientProfileIdAsync()) ?? throw new UnauthorizedAccessException();
        }
        else if (currentUser.Role == RoleNames.Administrator && request.PatientId.HasValue)
        {
            patientId = request.PatientId.Value;
        }
        else
        {
            throw new InvalidOperationException("PatientId is required for admin booking.");
        }

        var appointment = new Appointment
        {
            PatientId = patientId,
            DoctorId = request.DoctorId,
            ScheduledAt = request.ScheduledAt.ToUniversalTime(),
            Notes = request.Notes,
            IsVirtual = request.IsVirtual,
            Status = "Scheduled"
        };
        db.Appointments.Add(appointment);
        await db.SaveChangesAsync();

        if (request.IsVirtual)
            await telemedicine.CreateAsync(new CreateTelemedicineRequest(appointment.Id));

        return await GetDtoById(appointment.Id);
    }

    public async Task<AppointmentDto> UpdateAsync(Guid id, UpdateAppointmentRequest request)
    {
        var appointment = await db.Appointments.FindAsync(id) ?? throw new KeyNotFoundException();
        await EnsureAccess(appointment);
        appointment.Status = request.Status;
        appointment.Notes = request.Notes;
        await db.SaveChangesAsync();
        return await GetDtoById(id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var appointment = await db.Appointments.FindAsync(id);
        if (appointment is null) return false;
        await EnsureAccess(appointment);
        appointment.IsDeleted = true;
        appointment.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return true;
    }

    private async Task EnsureAccess(Appointment a)
    {
        if (currentUser.Role == RoleNames.Administrator) return;
        if (currentUser.Role == RoleNames.Doctor)
        {
            var did = await currentUser.GetDoctorProfileIdAsync();
            if (a.DoctorId != did) throw new UnauthorizedAccessException();
            return;
        }
        if (currentUser.Role == RoleNames.Patient)
        {
            var pid = await currentUser.GetPatientProfileIdAsync();
            if (a.PatientId != pid) throw new UnauthorizedAccessException();
        }
    }

    private async Task<AppointmentDto> GetDtoById(Guid id)
    {
        var a = await db.Appointments.Include(x => x.Patient).ThenInclude(p => p.User)
            .Include(x => x.Doctor).ThenInclude(d => d.User).FirstAsync(x => x.Id == id);
        return ToDto(a);
    }

    private static AppointmentDto ToDto(Appointment a) =>
        new(a.Id, a.PatientId, a.DoctorId, a.ScheduledAt, a.Status, a.Notes, a.IsVirtual,
            a.Patient.User.FullName, a.Doctor.User.FullName);
}
