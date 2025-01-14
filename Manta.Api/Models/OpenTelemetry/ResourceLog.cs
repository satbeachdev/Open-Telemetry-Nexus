namespace Manta.Api.Models.OpenTelemetry;

public class ResourceLog
{
    public Resource resource { get; set; }
    public List<ScopeLog> scopeLogs { get; set; }
}