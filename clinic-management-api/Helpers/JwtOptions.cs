namespace clinic_management_api.Helpers;

public class JwtOptions
{
    public string Issuer { get; set; } = "icms-api";
    public string Audience { get; set; } = "icms-web";
    public string Secret { get; set; } = "";
    public int AccessTokenMinutes { get; set; } = 60;
    public int RefreshTokenDays { get; set; } = 7;
}
