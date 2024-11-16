namespace api.Models.OpenTelemetry;

public class ScopeSpan
{
    public Scope scope { get; set; }
    public List<Span> spans { get; set; }
}