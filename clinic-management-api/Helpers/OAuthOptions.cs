namespace clinic_management_api.Helpers;

public class OAuthOptions
{
    public GoogleOAuthOptions Google { get; set; } = new();
    public FacebookOAuthOptions Facebook { get; set; } = new();
}

public class GoogleOAuthOptions
{
    public string ClientId { get; set; } = string.Empty;
}

public class FacebookOAuthOptions
{
    public string AppId { get; set; } = string.Empty;
    public string AppSecret { get; set; } = string.Empty;
}
