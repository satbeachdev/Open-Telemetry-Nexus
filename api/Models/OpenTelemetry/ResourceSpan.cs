namespace api.Models.OpenTelemetry;

public class ResourceSpan
{
    public Resource resource { get; set; }
    public List<ScopeSpan> scopeSpans { get; set; }
}