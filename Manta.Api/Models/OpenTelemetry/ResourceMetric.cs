namespace Manta.Api.Models.OpenTelemetry;

public class ResourceMetric
{
    public Resource resource { get; set; }
    public List<ScopeMetric> scopeMetrics { get; set; }
}