namespace Manta.Api.Models.OpenTelemetry;

public class Metric
{
    public string name { get; set; }
    public string unit { get; set; }
    public string description { get; set; }
    public Sum sum { get; set; }
    public Gauge gauge { get; set; }
    public Histogram histogram { get; set; }
}