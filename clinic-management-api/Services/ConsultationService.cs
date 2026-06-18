using clinic_management_api.Data;
using clinic_management_api.DTOs;
using clinic_management_api.Helpers;
using clinic_management_api.Models;
using Microsoft.EntityFrameworkCore;

namespace clinic_management_api.Services;

public interface IConsultationService
{
    Task<PagedResult<ConsultationDto>> GetAllAsync(PagedQuery query);
    Task<ConsultationDto> CreateAsync(CreateConsultationRequest request);
    Task<ConsultationDto> UpdateAsync(Guid id, UpdateConsultationRequest request);
}

public class ConsultationService(ApplicationDbContext db, ICurrentUserService currentUser) : IConsultationService
{
    public async Task<PagedResult<ConsultationDto>> GetAllAsync(PagedQuery query)
    {
        var q = db.Consultations.AsQueryable();
        if (currentUser.Role == RoleNames.Patient)
        {
            var pid = await currentUser.GetPatientProfileIdAsync();
            q = q.Where(c => c.PatientId == pid);
        }
        else if (currentUser.Role == RoleNames.Doctor)
        {
            var did = await currentUser.GetDoctorProfileIdAsync();
            q = q.Where(c => c.DoctorId == did);
        }

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(c => c.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .Select(c => new ConsultationDto(c.Id, c.AppointmentId, c.DoctorId, c.PatientId, c.Symptoms, c.Diagnosis))
            .ToListAsync();
        return new PagedResult<ConsultationDto>(items, total, query.Page, query.PageSize);
    }

    public async Task<ConsultationDto> CreateAsync(CreateConsultationRequest request)
    {
        currentUser.EnsureRole(RoleNames.Doctor, RoleNames.Administrator);
        var doctorId = await currentUser.GetDoctorProfileIdAsync() ?? throw new UnauthorizedAccessException();
        var appointment = await db.Appointments.FindAsync(request.AppointmentId) ?? throw new KeyNotFoundException("Appointment not found.");
        if (appointment.DoctorId != doctorId && currentUser.Role != RoleNames.Administrator)
            throw new UnauthorizedAccessException();

        appointment.Status = "In Progress";
        var consultation = new Consultation
        {
            AppointmentId = request.AppointmentId,
            DoctorId = doctorId,
            PatientId = appointment.PatientId,
            Symptoms = request.Symptoms,
            Diagnosis = request.Diagnosis
        };
        db.Consultations.Add(consultation);
        await db.SaveChangesAsync();
        return new ConsultationDto(consultation.Id, consultation.AppointmentId, consultation.DoctorId, consultation.PatientId, consultation.Symptoms, consultation.Diagnosis);
    }

    public async Task<ConsultationDto> UpdateAsync(Guid id, UpdateConsultationRequest request)
    {
        currentUser.EnsureRole(RoleNames.Doctor, RoleNames.Administrator);
        var doctorId = await currentUser.GetDoctorProfileIdAsync();
        var c = await db.Consultations.FindAsync(id) ?? throw new KeyNotFoundException();
        if (currentUser.Role == RoleNames.Doctor && c.DoctorId != doctorId)
            throw new UnauthorizedAccessException();

        c.Symptoms = request.Symptoms;
        c.Diagnosis = request.Diagnosis;
        var appointment = await db.Appointments.FindAsync(c.AppointmentId);
        if (appointment is not null) appointment.Status = "Completed";
        await db.SaveChangesAsync();
        return new ConsultationDto(c.Id, c.AppointmentId, c.DoctorId, c.PatientId, c.Symptoms, c.Diagnosis);
    }
}
