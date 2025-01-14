namespace Manta.Api.Models.OpenTelemetry;

public class ScopeMetric
{
    public Scope scope { get; set; }
    public List<Metric> metrics { get; set; }
}