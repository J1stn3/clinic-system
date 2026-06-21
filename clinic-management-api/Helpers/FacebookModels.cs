using System.Text.Json.Serialization;

namespace clinic_management_api.Helpers;

/// <summary>Response shape from https://graph.facebook.com/debug_token</summary>
public class FacebookDebugResponse
{
    [JsonPropertyName("data")]
    public FacebookDebugData Data { get; set; } = new();
}

public class FacebookDebugData
{
    [JsonPropertyName("is_valid")]
    public bool IsValid { get; set; }

    [JsonPropertyName("app_id")]
    public string? AppId { get; set; }

    [JsonPropertyName("user_id")]
    public string? UserId { get; set; }
}

/// <summary>Response shape from https://graph.facebook.com/me</summary>
public class FacebookMeResponse
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("email")]
    public string? Email { get; set; }
}
