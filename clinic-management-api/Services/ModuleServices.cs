using clinic_management_api.Data;
using clinic_management_api.DTOs;
using clinic_management_api.Helpers;
using clinic_management_api.Models;
using Microsoft.EntityFrameworkCore;

namespace clinic_management_api.Services;

public interface IPatientService
{
    Task<PagedResult<PatientDto>> GetAllAsync(PagedQuery query);
    Task<PatientDto> CreateAsync(CreatePatientRequest request);
}

public class PatientService(ApplicationDbContext db, ICurrentUserService currentUser) : IPatientService
{
    public async Task<PagedResult<PatientDto>> GetAllAsync(PagedQuery query)
    {
        currentUser.EnsureRole(RoleNames.Administrator, RoleNames.Doctor);
        var q = db.Patients.Include(p => p.User).AsQueryable();
        var total = await q.CountAsync();
        var items = await q.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .Select(p => new PatientDto(p.Id, p.UserId, p.User.FullName, p.Gender, p.DateOfBirth)).ToListAsync();
        return new PagedResult<PatientDto>(items, total, query.Page, query.PageSize);
    }

    public async Task<PatientDto> CreateAsync(CreatePatientRequest request)
    {
        currentUser.EnsureRole(RoleNames.Administrator);
        var user = await db.Users.FindAsync(request.UserId) ?? throw new KeyNotFoundException("User not found.");
        var patient = new Patient { UserId = request.UserId, Gender = request.Gender, DateOfBirth = request.DateOfBirth };
        db.Patients.Add(patient);
        await db.SaveChangesAsync();
        return new PatientDto(patient.Id, patient.UserId, user.FullName, patient.Gender, patient.DateOfBirth);
    }
}

public interface IDoctorService
{
    Task<PagedResult<DoctorDto>> GetAllAsync(PagedQuery query);
    Task<DoctorDto> CreateAsync(CreateDoctorRequest request);
}

public class DoctorService(ApplicationDbContext db, ICurrentUserService currentUser) : IDoctorService
{
    public async Task<PagedResult<DoctorDto>> GetAllAsync(PagedQuery query)
    {
        var q = db.Doctors.Include(d => d.User).AsQueryable();
        var total = await q.CountAsync();
        var items = await q.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .Select(d => new DoctorDto(d.Id, d.UserId, d.User.FullName, d.Specialty, d.LicenseNumber)).ToListAsync();
        return new PagedResult<DoctorDto>(items, total, query.Page, query.PageSize);
    }

    public async Task<DoctorDto> CreateAsync(CreateDoctorRequest request)
    {
        currentUser.EnsureRole(RoleNames.Administrator);
        var user = await db.Users.FindAsync(request.UserId) ?? throw new KeyNotFoundException();
        var doctor = new Doctor { UserId = request.UserId, Specialty = request.Specialty, LicenseNumber = request.LicenseNumber };
        db.Doctors.Add(doctor);
        await db.SaveChangesAsync();
        return new DoctorDto(doctor.Id, doctor.UserId, user.FullName, doctor.Specialty, doctor.LicenseNumber);
    }
}

public interface IMedicalRecordService
{
    Task<PagedResult<MedicalRecordDto>> GetAllAsync(PagedQuery query);
    Task<MedicalRecordDto> CreateAsync(CreateMedicalRecordRequest request);
}

public class MedicalRecordService(ApplicationDbContext db, ICurrentUserService currentUser) : IMedicalRecordService
{
    public async Task<PagedResult<MedicalRecordDto>> GetAllAsync(PagedQuery query)
    {
        var q = db.MedicalRecords.AsQueryable();
        if (currentUser.Role == RoleNames.Patient)
        {
            var pid = await currentUser.GetPatientProfileIdAsync();
            q = q.Where(m => m.PatientId == pid);
        }
        else if (currentUser.Role == RoleNames.Doctor)
        {
            var did = await currentUser.GetDoctorProfileIdAsync();
            q = q.Where(m => m.DoctorId == did);
        }

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(m => m.CreatedAt).Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .Select(m => new MedicalRecordDto(m.Id, m.PatientId, m.DoctorId, m.History, m.Vitals, m.CreatedAt)).ToListAsync();
        return new PagedResult<MedicalRecordDto>(items, total, query.Page, query.PageSize);
    }

    public async Task<MedicalRecordDto> CreateAsync(CreateMedicalRecordRequest request)
    {
        currentUser.EnsureRole(RoleNames.Doctor, RoleNames.Administrator);
        var doctorId = await currentUser.GetDoctorProfileIdAsync() ?? throw new UnauthorizedAccessException();
        var record = new MedicalRecord { PatientId = request.PatientId, DoctorId = doctorId, History = request.History, Vitals = request.Vitals };
        db.MedicalRecords.Add(record);
        await db.SaveChangesAsync();
        return new MedicalRecordDto(record.Id, record.PatientId, record.DoctorId, record.History, record.Vitals, record.CreatedAt);
    }
}

public interface IPrescriptionService
{
    Task<PagedResult<PrescriptionDto>> GetAllAsync(PagedQuery query);
    Task<PrescriptionDto> CreateAsync(CreatePrescriptionRequest request);
}

public class PrescriptionService(ApplicationDbContext db, ICurrentUserService currentUser) : IPrescriptionService
{
    public async Task<PagedResult<PrescriptionDto>> GetAllAsync(PagedQuery query)
    {
        var q = db.Prescriptions.AsQueryable();
        if (currentUser.Role == RoleNames.Patient)
        {
            var pid = await currentUser.GetPatientProfileIdAsync();
            q = q.Where(p => p.PatientId == pid);
        }
        else if (currentUser.Role == RoleNames.Doctor)
        {
            var did = await currentUser.GetDoctorProfileIdAsync();
            q = q.Where(p => p.DoctorId == did);
        }

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(p => p.CreatedAt).Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .Select(p => new PrescriptionDto(p.Id, p.PatientId, p.DoctorId, p.Medication, p.Dosage, p.Instructions)).ToListAsync();
        return new PagedResult<PrescriptionDto>(items, total, query.Page, query.PageSize);
    }

    public async Task<PrescriptionDto> CreateAsync(CreatePrescriptionRequest request)
    {
        currentUser.EnsureRole(RoleNames.Doctor, RoleNames.Administrator);
        var doctorId = await currentUser.GetDoctorProfileIdAsync() ?? throw new UnauthorizedAccessException();
        var rx = new Prescription { PatientId = request.PatientId, DoctorId = doctorId, Medication = request.Medication, Dosage = request.Dosage, Instructions = request.Instructions };
        db.Prescriptions.Add(rx);
        await db.SaveChangesAsync();
        return new PrescriptionDto(rx.Id, rx.PatientId, rx.DoctorId, rx.Medication, rx.Dosage, rx.Instructions);
    }
}

public interface ILaboratoryService
{
    Task<PagedResult<LaboratoryDto>> GetAllAsync(PagedQuery query);
    Task<LaboratoryDto> CreateAsync(CreateLaboratoryRequest request);
    Task<LaboratoryDto> UpdateAsync(Guid id, UpdateLaboratoryRequest request);
}

public class LaboratoryService(ApplicationDbContext db, ICurrentUserService currentUser) : ILaboratoryService
{
    public async Task<PagedResult<LaboratoryDto>> GetAllAsync(PagedQuery query)
    {
        var q = db.LaboratoryResults.AsQueryable();
        if (currentUser.Role == RoleNames.Patient)
        {
            var pid = await currentUser.GetPatientProfileIdAsync();
            q = q.Where(l => l.PatientId == pid);
        }
        else if (currentUser.Role == RoleNames.Doctor)
        {
            var did = await currentUser.GetDoctorProfileIdAsync();
            q = q.Where(l => l.DoctorId == did);
        }

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(l => l.CreatedAt).Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .Select(l => new LaboratoryDto(l.Id, l.PatientId, l.DoctorId, l.TestName, l.ResultValue, l.Status)).ToListAsync();
        return new PagedResult<LaboratoryDto>(items, total, query.Page, query.PageSize);
    }

    public async Task<LaboratoryDto> CreateAsync(CreateLaboratoryRequest request)
    {
        currentUser.EnsureRole(RoleNames.Doctor, RoleNames.Administrator);
        var doctorId = await currentUser.GetDoctorProfileIdAsync() ?? throw new UnauthorizedAccessException();
        var lab = new LaboratoryResult { PatientId = request.PatientId, DoctorId = doctorId, TestName = request.TestName, Status = "Requested" };
        db.LaboratoryResults.Add(lab);
        await db.SaveChangesAsync();
        return new LaboratoryDto(lab.Id, lab.PatientId, lab.DoctorId, lab.TestName, lab.ResultValue, lab.Status);
    }

    public async Task<LaboratoryDto> UpdateAsync(Guid id, UpdateLaboratoryRequest request)
    {
        currentUser.EnsureRole(RoleNames.Doctor, RoleNames.Administrator);
        var lab = await db.LaboratoryResults.FindAsync(id) ?? throw new KeyNotFoundException();
        lab.ResultValue = request.ResultValue;
        lab.Status = request.Status;
        await db.SaveChangesAsync();
        return new LaboratoryDto(lab.Id, lab.PatientId, lab.DoctorId, lab.TestName, lab.ResultValue, lab.Status);
    }
}

public interface IPharmacyService
{
    Task<PagedResult<MedicineDto>> GetAllAsync(PagedQuery query);
    Task<MedicineDto> CreateAsync(CreateMedicineRequest request);
    Task<MedicineDto> DispenseAsync(DispenseRequest request);
}

public class PharmacyService(ApplicationDbContext db, ICurrentUserService currentUser) : IPharmacyService
{
    public async Task<PagedResult<MedicineDto>> GetAllAsync(PagedQuery query)
    {
        var q = db.Medicines.AsQueryable();
        var total = await q.CountAsync();
        var items = await q.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .Select(m => new MedicineDto(m.Id, m.Name, m.Description, m.UnitPrice, m.StockQuantity)).ToListAsync();
        return new PagedResult<MedicineDto>(items, total, query.Page, query.PageSize);
    }

    public async Task<MedicineDto> CreateAsync(CreateMedicineRequest request)
    {
        currentUser.EnsureRole(RoleNames.Administrator);
        var med = new Medicine { Name = request.Name, Description = request.Description, UnitPrice = request.UnitPrice, StockQuantity = request.StockQuantity };
        db.Medicines.Add(med);
        await db.SaveChangesAsync();
        return new MedicineDto(med.Id, med.Name, med.Description, med.UnitPrice, med.StockQuantity);
    }

    public async Task<MedicineDto> DispenseAsync(DispenseRequest request)
    {
        currentUser.EnsureRole(RoleNames.Administrator, RoleNames.Doctor);
        var med = await db.Medicines.FindAsync(request.MedicineId) ?? throw new KeyNotFoundException();
        if (med.StockQuantity < request.Quantity) throw new InvalidOperationException("Insufficient stock.");
        med.StockQuantity -= request.Quantity;
        await db.SaveChangesAsync();
        return new MedicineDto(med.Id, med.Name, med.Description, med.UnitPrice, med.StockQuantity);
    }
}

public interface ITelemedicineService
{
    Task<PagedResult<TelemedicineDto>> GetAllAsync(PagedQuery query);
    Task<TelemedicineDto> CreateAsync(CreateTelemedicineRequest request);
}

public class TelemedicineService(ApplicationDbContext db, ICurrentUserService currentUser) : ITelemedicineService
{
    public async Task<PagedResult<TelemedicineDto>> GetAllAsync(PagedQuery query)
    {
        var q = db.TelemedicineSessions.Include(t => t.Appointment).AsQueryable();
        if (currentUser.Role == RoleNames.Patient)
        {
            var pid = await currentUser.GetPatientProfileIdAsync();
            q = q.Where(t => t.Appointment.PatientId == pid);
        }
        else if (currentUser.Role == RoleNames.Doctor)
        {
            var did = await currentUser.GetDoctorProfileIdAsync();
            q = q.Where(t => t.Appointment.DoctorId == did);
        }

        var total = await q.CountAsync();
        var items = await q.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .Select(t => new TelemedicineDto(t.Id, t.AppointmentId, t.MeetingUrl, t.Status)).ToListAsync();
        return new PagedResult<TelemedicineDto>(items, total, query.Page, query.PageSize);
    }

    public async Task<TelemedicineDto> CreateAsync(CreateTelemedicineRequest request)
    {
        var appointment = await db.Appointments.FindAsync(request.AppointmentId)
            ?? throw new KeyNotFoundException("Appointment not found.");

        if (!appointment.IsVirtual)
            throw new InvalidOperationException("Telemedicine sessions can only be created for virtual appointments.");

        if (currentUser.Role == RoleNames.Patient)
        {
            var pid = await currentUser.GetPatientProfileIdAsync();
            if (appointment.PatientId != pid) throw new UnauthorizedAccessException();
        }
        else if (currentUser.Role == RoleNames.Doctor)
        {
            var did = await currentUser.GetDoctorProfileIdAsync();
            if (appointment.DoctorId != did) throw new UnauthorizedAccessException();
        }
        else
        {
            currentUser.EnsureRole(RoleNames.Administrator);
        }

        var existing = await db.TelemedicineSessions.FirstOrDefaultAsync(t => t.AppointmentId == request.AppointmentId);
        if (existing is not null)
            return new TelemedicineDto(existing.Id, existing.AppointmentId, existing.MeetingUrl, existing.Status);

        var session = new TelemedicineSession
        {
            AppointmentId = request.AppointmentId,
            MeetingUrl = $"https://meet.icms.local/{request.AppointmentId:N}",
            Status = "Created"
        };
        db.TelemedicineSessions.Add(session);
        await db.SaveChangesAsync();
        return new TelemedicineDto(session.Id, session.AppointmentId, session.MeetingUrl, session.Status);
    }
}
