using clinic_management_api.Models;
using Microsoft.EntityFrameworkCore;

namespace clinic_management_api.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<Consultation> Consultations => Set<Consultation>();
    public DbSet<MedicalRecord> MedicalRecords => Set<MedicalRecord>();
    public DbSet<Prescription> Prescriptions => Set<Prescription>();
    public DbSet<LaboratoryResult> LaboratoryResults => Set<LaboratoryResult>();
    public DbSet<Medicine> Medicines => Set<Medicine>();
    public DbSet<Billing> Billings => Set<Billing>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<TelemedicineSession> TelemedicineSessions => Set<TelemedicineSession>();
    public DbSet<AIDecisionSupportLog> AIDecisionSupportLogs => Set<AIDecisionSupportLog>();
    public DbSet<ClinicSettings> ClinicSettings => Set<ClinicSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                var method = typeof(ApplicationDbContext)
                    .GetMethod(nameof(SetSoftDeleteFilter), System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)!
                    .MakeGenericMethod(entityType.ClrType);
                method.Invoke(null, [modelBuilder]);

                modelBuilder.Entity(entityType.ClrType)
                    .Property(nameof(BaseEntity.RowVersion))
                    .ValueGeneratedNever();
            }
        }

        modelBuilder.Entity<User>().HasIndex(x => x.Email).IsUnique();
        modelBuilder.Entity<Role>().HasIndex(x => x.Name).IsUnique();
        modelBuilder.Entity<RefreshToken>().HasIndex(x => x.Token).IsUnique();
        modelBuilder.Entity<Patient>().HasIndex(x => x.UserId).IsUnique();
        modelBuilder.Entity<Doctor>().HasIndex(x => x.UserId).IsUnique();
        modelBuilder.Entity<Consultation>().HasIndex(x => x.AppointmentId).IsUnique();
        modelBuilder.Entity<TelemedicineSession>().HasIndex(x => x.AppointmentId).IsUnique();

        modelBuilder.Entity<Appointment>().HasIndex(x => new { x.DoctorId, x.ScheduledAt });
        modelBuilder.Entity<Appointment>().HasIndex(x => new { x.PatientId, x.ScheduledAt });
        modelBuilder.Entity<MedicalRecord>().HasIndex(x => new { x.PatientId, x.CreatedAt });

        modelBuilder.Entity<RefreshToken>()
            .HasOne(x => x.User).WithMany(x => x.RefreshTokens).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Patient>()
            .HasOne(x => x.User).WithOne(x => x.Patient).HasForeignKey<Patient>(x => x.UserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Doctor>()
            .HasOne(x => x.User).WithOne(x => x.Doctor).HasForeignKey<Doctor>(x => x.UserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Appointment>()
            .HasOne(x => x.Patient).WithMany(x => x.Appointments).HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Appointment>()
            .HasOne(x => x.Doctor).WithMany(x => x.Appointments).HasForeignKey(x => x.DoctorId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Consultation>()
            .HasOne(x => x.Appointment).WithOne(x => x.Consultation).HasForeignKey<Consultation>(x => x.AppointmentId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Consultation>()
            .HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Consultation>()
            .HasOne(x => x.Doctor).WithMany().HasForeignKey(x => x.DoctorId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MedicalRecord>()
            .HasOne(x => x.Patient).WithMany(x => x.MedicalRecords).HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<MedicalRecord>()
            .HasOne(x => x.Doctor).WithMany().HasForeignKey(x => x.DoctorId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Prescription>()
            .HasOne(x => x.Patient).WithMany(x => x.Prescriptions).HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Prescription>()
            .HasOne(x => x.Doctor).WithMany().HasForeignKey(x => x.DoctorId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LaboratoryResult>()
            .HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<LaboratoryResult>()
            .HasOne(x => x.Doctor).WithMany().HasForeignKey(x => x.DoctorId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Billing>()
            .HasOne(x => x.Patient).WithMany(x => x.Billings).HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Payment>()
            .HasOne(x => x.Billing).WithMany(x => x.Payments).HasForeignKey(x => x.BillingId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TelemedicineSession>()
            .HasOne(x => x.Appointment).WithOne(x => x.TelemedicineSession).HasForeignKey<TelemedicineSession>(x => x.AppointmentId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AIDecisionSupportLog>()
            .HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<AIDecisionSupportLog>()
            .HasOne(x => x.Doctor).WithMany().HasForeignKey(x => x.DoctorId).OnDelete(DeleteBehavior.Restrict);
    }

    private static void SetSoftDeleteFilter<T>(ModelBuilder modelBuilder) where T : BaseEntity
    {
        modelBuilder.Entity<T>().HasQueryFilter(e => !e.IsDeleted);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added && (entry.Entity.RowVersion is null || entry.Entity.RowVersion.Length == 0))
                entry.Entity.RowVersion = new byte[8];

            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
