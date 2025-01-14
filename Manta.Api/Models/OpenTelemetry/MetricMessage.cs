namespace Manta.Api.Models.OpenTelemetry;

public class MetricMessage
{
    public List<ResourceMetric> resourceMetrics { get; set; }
}