using clinic_management_api.Data;
using clinic_management_api.DTOs;
using clinic_management_api.Helpers;
using clinic_management_api.Models;
using Microsoft.EntityFrameworkCore;

namespace clinic_management_api.Services;

public interface IPaymentService
{
    Task<PagedResult<PaymentDto>> GetAllAsync(PagedQuery query);
    Task<PaymentDto> CreateAsync(CreatePaymentRequest request);
}

public class PaymentService(ApplicationDbContext db, ICurrentUserService currentUser) : IPaymentService
{
    public async Task<PagedResult<PaymentDto>> GetAllAsync(PagedQuery query)
    {
        var q = db.Payments.Include(p => p.Billing).AsQueryable();
        if (currentUser.Role == RoleNames.Patient)
        {
            var pid = await currentUser.GetPatientProfileIdAsync();
            q = q.Where(p => p.Billing.PatientId == pid);
        }

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(p => p.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .Select(p => new PaymentDto(p.Id, p.BillingId, p.AmountPaid, p.Method, p.TransactionRef))
            .ToListAsync();
        return new PagedResult<PaymentDto>(items, total, query.Page, query.PageSize);
    }

    public async Task<PaymentDto> CreateAsync(CreatePaymentRequest request)
    {
        var billing = await db.Billings.FindAsync(request.BillingId) ?? throw new KeyNotFoundException("Billing not found.");

        if (currentUser.Role == RoleNames.Patient)
        {
            var pid = await currentUser.GetPatientProfileIdAsync();
            if (billing.PatientId != pid) throw new UnauthorizedAccessException();
        }
        else
        {
            currentUser.EnsureRole(RoleNames.Administrator);
        }

        if (await db.Payments.AnyAsync(p => p.TransactionRef == request.TransactionRef && !string.IsNullOrEmpty(request.TransactionRef)))
            throw new InvalidOperationException("Duplicate transaction reference.");

        var payment = new Payment
        {
            BillingId = request.BillingId,
            AmountPaid = request.AmountPaid,
            Method = request.Method,
            TransactionRef = request.TransactionRef ?? Guid.NewGuid().ToString("N")[..12]
        };
        db.Payments.Add(payment);

        billing.AmountPaid += request.AmountPaid;
        billing.Status = billing.AmountPaid >= billing.Amount ? "Paid" : "Partial";
        await db.SaveChangesAsync();
        return new PaymentDto(payment.Id, payment.BillingId, payment.AmountPaid, payment.Method, payment.TransactionRef);
    }
}

public interface IBillingService
{
    Task<PagedResult<BillingDto>> GetAllAsync(PagedQuery query);
    Task<BillingDto> CreateAsync(CreateBillingRequest request);
}

public class BillingService(ApplicationDbContext db, ICurrentUserService currentUser) : IBillingService
{
    public async Task<PagedResult<BillingDto>> GetAllAsync(PagedQuery query)
    {
        var q = db.Billings.AsQueryable();
        if (currentUser.Role == RoleNames.Patient)
        {
            var pid = await currentUser.GetPatientProfileIdAsync();
            q = q.Where(b => b.PatientId == pid);
        }
        else if (currentUser.Role == RoleNames.Doctor)
        {
            var did = await currentUser.GetDoctorProfileIdAsync();
            var patientIds = db.Appointments.Where(a => a.DoctorId == did).Select(a => a.PatientId).Distinct();
            q = q.Where(b => patientIds.Contains(b.PatientId));
        }

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(b => b.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .Select(b => new BillingDto(b.Id, b.PatientId, b.Amount, b.AmountPaid, b.Status))
            .ToListAsync();
        return new PagedResult<BillingDto>(items, total, query.Page, query.PageSize);
    }

    public async Task<BillingDto> CreateAsync(CreateBillingRequest request)
    {
        currentUser.EnsureRole(RoleNames.Administrator);
        var billing = new Billing { PatientId = request.PatientId, Amount = request.Amount, Status = "Pending" };
        db.Billings.Add(billing);
        await db.SaveChangesAsync();
        return new BillingDto(billing.Id, billing.PatientId, billing.Amount, billing.AmountPaid, billing.Status);
    }
}

public interface ISettingsService
{
    Task<ClinicSettingsDto> GetAsync();
    Task<ClinicSettingsDto> UpdateAsync(UpdateClinicSettingsRequest request);
}

public class SettingsService(ApplicationDbContext db, ICurrentUserService currentUser) : ISettingsService
{
    public async Task<ClinicSettingsDto> GetAsync()
    {
        currentUser.EnsureRole(RoleNames.Administrator, RoleNames.Doctor, RoleNames.Patient);
        var settings = await db.ClinicSettings.FirstOrDefaultAsync() ?? await SeedDefault();
        return ToDto(settings);
    }

    public async Task<ClinicSettingsDto> UpdateAsync(UpdateClinicSettingsRequest request)
    {
        currentUser.EnsureRole(RoleNames.Administrator);
        var settings = await db.ClinicSettings.FirstOrDefaultAsync() ?? await SeedDefault();
        settings.ClinicName = request.ClinicName;
        settings.Timezone = request.Timezone;
        settings.ContactEmail = request.ContactEmail;
        settings.ContactPhone = request.ContactPhone;
        await db.SaveChangesAsync();
        return ToDto(settings);
    }

    private async Task<ClinicSettings> SeedDefault()
    {
        var s = new ClinicSettings();
        db.ClinicSettings.Add(s);
        await db.SaveChangesAsync();
        return s;
    }

    private static ClinicSettingsDto ToDto(ClinicSettings s) =>
        new(s.Id, s.ClinicName, s.Timezone, s.ContactEmail, s.ContactPhone);
}

public interface IReportsService
{
    Task<ReportsSummaryDto> GetSummaryAsync();
}

public class ReportsService(ApplicationDbContext db, ICurrentUserService currentUser) : IReportsService
{
    public async Task<ReportsSummaryDto> GetSummaryAsync()
    {
        currentUser.EnsureRole(RoleNames.Administrator);
        return new ReportsSummaryDto(
            await db.Patients.CountAsync(),
            await db.Doctors.CountAsync(),
            await db.Appointments.CountAsync(),
            await db.Billings.CountAsync(b => b.Status == "Pending"),
            await db.AIDecisionSupportLogs.CountAsync(),
            await db.Payments.SumAsync(p => (decimal?)p.AmountPaid) ?? 0);
    }
}
