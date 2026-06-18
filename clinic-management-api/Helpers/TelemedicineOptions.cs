namespace clinic_management_api.Helpers;

public class TelemedicineOptions
{
    public const string SectionName = "Telemedicine";

    /// <summary>Base URL for video rooms (e.g. https://meet.jit.si/icms).</summary>
    public string MeetingBaseUrl { get; set; } = "https://meet.jit.si/icms";

    public string BuildMeetingUrl(Guid appointmentId) =>
        $"{MeetingBaseUrl.TrimEnd('/')}-{appointmentId:N}";
}
