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

public class CreateAppointmentRequestValidator : AbstractValidator<CreateAppointmentRequest>
{
    public CreateAppointmentRequestValidator()
    {
        RuleFor(x => x.DoctorId).NotEmpty();
        RuleFor(x => x.ScheduledAt).GreaterThan(DateTime.UtcNow.AddHours(-1));
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
