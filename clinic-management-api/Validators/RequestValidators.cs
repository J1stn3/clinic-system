using clinic_management_api.DTOs;
using clinic_management_api.Models;
using FluentValidation;

namespace clinic_management_api.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
    }
}

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.RoleName).Must(r => RoleNames.All.Contains(r)).WithMessage("Invalid role.");
    }
}

public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.RoleName).Must(r => RoleNames.All.Contains(r)).WithMessage("Invalid role.");
    }
}

public class CreateAppointmentRequestValidator : AbstractValidator<CreateAppointmentRequest>
{
    public CreateAppointmentRequestValidator()
    {
        // Evaluated per-request (not at class registration), allowing bookings from "now" or later
        RuleFor(x => x.ScheduledAt)
            .Must(d => d > DateTime.UtcNow.AddMinutes(-5))
            .WithMessage("Scheduled date must be in the future.");
    }
}

public class CreateTelemedicineRequestValidator : AbstractValidator<CreateTelemedicineRequest>
{
    public CreateTelemedicineRequestValidator()
    {
        RuleFor(x => x.AppointmentId).NotEmpty();
    }
}

public class UpdateTelemedicineRequestValidator : AbstractValidator<UpdateTelemedicineRequest>
{
    public UpdateTelemedicineRequestValidator()
    {
        RuleFor(x => x.Status).NotEmpty().MaximumLength(64);
    }
}

public class CreatePaymentRequestValidator : AbstractValidator<CreatePaymentRequest>
{
    public CreatePaymentRequestValidator()
    {
        RuleFor(x => x.BillingId).NotEmpty();
        RuleFor(x => x.AmountPaid).GreaterThan(0);
        RuleFor(x => x.Method).NotEmpty();
    }
}

public class CdssRequestValidator : AbstractValidator<CdssRequest>
{
    public CdssRequestValidator()
    {
        RuleFor(x => x.Age).InclusiveBetween(0, 120);
        RuleFor(x => x.Gender).NotEmpty();
        RuleFor(x => x.Symptoms).NotEmpty();
    }
}

public class CreateConsultationRequestValidator : AbstractValidator<CreateConsultationRequest>
{
    public CreateConsultationRequestValidator()
    {
        RuleFor(x => x.AppointmentId).NotEmpty();
        RuleFor(x => x.Symptoms).NotEmpty();
    }
}

public class UpdateConsultationRequestValidator : AbstractValidator<UpdateConsultationRequest>
{
    public UpdateConsultationRequestValidator()
    {
        RuleFor(x => x.Symptoms).NotEmpty();
        RuleFor(x => x.Diagnosis).NotEmpty();
    }
}

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.RoleName).Must(r => RoleNames.All.Contains(r)).WithMessage("Invalid role.");
    }
}

public class PatientRegisterRequestValidator : AbstractValidator<PatientRegisterRequest>
{
    public PatientRegisterRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain at least one number.")
            .Matches(@"[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character.");
        RuleFor(x => x.Gender).NotEmpty().MaximumLength(32);
        RuleFor(x => x.DateOfBirth).NotNull().LessThan(DateTime.UtcNow.Date);
    }
}

public class ForgotPasswordRequestValidator : AbstractValidator<ForgotPasswordRequest>
{
    public ForgotPasswordRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}

public class CreatePatientRequestValidator : AbstractValidator<CreatePatientRequest>
{
    public CreatePatientRequestValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
    }
}

public class CreateDoctorRequestValidator : AbstractValidator<CreateDoctorRequest>
{
    public CreateDoctorRequestValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Specialty).NotEmpty().MaximumLength(128);
    }
}

public class CreateBillingRequestValidator : AbstractValidator<CreateBillingRequest>
{
    public CreateBillingRequestValidator()
    {
        RuleFor(x => x.PatientId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
    }
}

public class CreateLaboratoryRequestValidator : AbstractValidator<CreateLaboratoryRequest>
{
    public CreateLaboratoryRequestValidator()
    {
        RuleFor(x => x.PatientId).NotEmpty();
        RuleFor(x => x.TestName).NotEmpty();
    }
}

public class DispenseRequestValidator : AbstractValidator<DispenseRequest>
{
    public DispenseRequestValidator()
    {
        RuleFor(x => x.MedicineId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
    }
}
