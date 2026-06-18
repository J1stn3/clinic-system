using clinic_management_api.Data;
using clinic_management_api.DTOs;
using clinic_management_api.Helpers;
using clinic_management_api.Models;
using Microsoft.EntityFrameworkCore;

namespace clinic_management_api.Services;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync();
}

public class DashboardService(ApplicationDbContext db, ICurrentUserService currentUser) : IDashboardService
{
    private static readonly DateTime TodayUtc = DateTime.UtcNow.Date;

    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        if (!currentUser.IsAuthenticated)
            throw new UnauthorizedAccessException();

        return currentUser.Role switch
        {
            RoleNames.Administrator => await BuildAdminStatsAsync(),
            RoleNames.Doctor => await BuildDoctorStatsAsync(),
            RoleNames.Patient => await BuildPatientStatsAsync(),
            _ => throw new UnauthorizedAccessException(),
        };
    }

    private async Task<DashboardStatsDto> BuildAdminStatsAsync()
    {
        var patients = db.Patients.AsQueryable();
        var doctors = db.Doctors.AsQueryable();
        var appointments = db.Appointments.AsQueryable();
        var consultations = db.Consultations.AsQueryable();
        var prescriptions = db.Prescriptions.AsQueryable();
        var labs = db.LaboratoryResults.AsQueryable();
        var medicines = db.Medicines.AsQueryable();

        return await BuildStatsAsync(patients, doctors, appointments, consultations, prescriptions, labs, medicines);
    }

    private async Task<DashboardStatsDto> BuildDoctorStatsAsync()
    {
        var doctorId = await currentUser.GetDoctorProfileIdAsync()
            ?? throw new UnauthorizedAccessException();

        var patients = db.Patients.Where(p =>
            db.Appointments.Any(a => a.DoctorId == doctorId && a.PatientId == p.Id));

        var doctors = db.Doctors.Where(d => d.Id == doctorId);
        var appointments = db.Appointments.Where(a => a.DoctorId == doctorId);
        var consultations = db.Consultations.Where(c => c.DoctorId == doctorId);
        var prescriptions = db.Prescriptions.Where(p => p.DoctorId == doctorId);
        var labs = db.LaboratoryResults.Where(l => l.DoctorId == doctorId);
        var medicines = db.Medicines.AsQueryable();

        return await BuildStatsAsync(patients, doctors, appointments, consultations, prescriptions, labs, medicines);
    }

    private async Task<DashboardStatsDto> BuildPatientStatsAsync()
    {
        var patientId = await currentUser.GetPatientProfileIdAsync()
            ?? throw new UnauthorizedAccessException();

        var patients = db.Patients.Where(p => p.Id == patientId);
        var doctors = db.Doctors.Where(d =>
            db.Appointments.Any(a => a.PatientId == patientId && a.DoctorId == d.Id));
        var appointments = db.Appointments.Where(a => a.PatientId == patientId);
        var consultations = db.Consultations.Where(c => c.PatientId == patientId);
        var prescriptions = db.Prescriptions.Where(p => p.PatientId == patientId);
        var labs = db.LaboratoryResults.Where(l => l.PatientId == patientId);
        var medicines = db.Medicines.AsQueryable();

        return await BuildStatsAsync(patients, doctors, appointments, consultations, prescriptions, labs, medicines);
    }

    private async Task<DashboardStatsDto> BuildStatsAsync(
        IQueryable<Patient> patients,
        IQueryable<Doctor> doctors,
        IQueryable<Appointment> appointments,
        IQueryable<Consultation> consultations,
        IQueryable<Prescription> prescriptions,
        IQueryable<LaboratoryResult> labs,
        IQueryable<Medicine> medicines)
    {
        var patientCount = await patients.CountAsync();
        var doctorCount = await doctors.CountAsync();
        var appointmentCount = await appointments.CountAsync();
        var appointmentsToday = await appointments.CountAsync(a =>
            a.ScheduledAt.Date == TodayUtc && a.Status != "Cancelled");
        var upcomingAppointments = await appointments.CountAsync(a =>
            a.ScheduledAt >= DateTime.UtcNow && a.Status == "Scheduled");
        var consultationCount = await consultations.CountAsync();
        var activeConsultations = await appointments.CountAsync(a =>
            a.Status == "In Progress" || a.Status == "InProgress");
        var prescriptionCount = await prescriptions.CountAsync();
        var pendingLab = await labs.CountAsync(l =>
            l.Status == "Requested" || l.Status == "Pending");
        var activeLab = await labs.CountAsync(l => l.Status == "In Progress");
        var completedLabToday = await labs.CountAsync(l =>
            l.Status == "Completed" && l.CreatedAt >= TodayUtc);
        var awaitingVerification = await labs.CountAsync(l =>
            l.Status == "Completed" && (l.ResultValue == "" || l.ResultValue == null));
        var totalMedicines = await medicines.CountAsync();
        var lowStock = await medicines.CountAsync(m => m.StockQuantity > 20 && m.StockQuantity <= 80);
        var criticalStock = await medicines.CountAsync(m => m.StockQuantity <= 20);
        var expiringSoon = await medicines.CountAsync(m => m.StockQuantity <= 50);
        var dispensedToday = await prescriptions.CountAsync(p => p.CreatedAt >= TodayUtc);
        var pendingBills = await db.Billings.CountAsync(b => b.Status == "Pending");
        var telemedicine = await db.TelemedicineSessions.CountAsync();
        var aiAnalyses = await db.AIDecisionSupportLogs.CountAsync();
        var revenue = await db.Payments.SumAsync(p => (decimal?)p.AmountPaid) ?? 0;
        var newPatientsMonth = await patients.CountAsync(p => p.CreatedAt >= new DateTime(TodayUtc.Year, TodayUtc.Month, 1, 0, 0, 0, DateTimeKind.Utc));

        var nextAppt = await appointments
            .Where(a => a.ScheduledAt >= DateTime.UtcNow && a.Status != "Cancelled")
            .OrderBy(a => a.ScheduledAt)
            .Select(a => (DateTime?)a.ScheduledAt)
            .FirstOrDefaultAsync();

        var latestLabs = await labs
            .Where(l => l.Status == "Completed" && l.ResultValue != "")
            .OrderByDescending(l => l.CreatedAt)
            .Take(4)
            .Select(l => new LabResultPreviewDto(
                l.TestName,
                l.ResultValue,
                "See report",
                "Normal"))
            .ToListAsync();

        if (latestLabs.Count == 0)
        {
            latestLabs = await labs
                .OrderByDescending(l => l.CreatedAt)
                .Take(3)
                .Select(l => new LabResultPreviewDto(
                    l.TestName,
                    string.IsNullOrEmpty(l.ResultValue) ? "Pending" : l.ResultValue,
                    "—",
                    l.Status == "Completed" ? "Normal" : "Pending"))
                .ToListAsync();
        }

        return new DashboardStatsDto(
            patientCount,
            doctorCount,
            appointmentCount,
            appointmentsToday,
            upcomingAppointments,
            consultationCount,
            activeConsultations,
            prescriptionCount,
            pendingLab,
            activeLab,
            completedLabToday,
            awaitingVerification,
            totalMedicines,
            lowStock,
            criticalStock,
            expiringSoon,
            dispensedToday,
            pendingBills,
            telemedicine,
            aiAnalyses,
            revenue,
            newPatientsMonth,
            nextAppt?.ToString("o"),
            latestLabs);
    }
}
