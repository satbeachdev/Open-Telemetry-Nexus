namespace Manta.Api.Models.OpenTelemetry;

public class Histogram
{
    public int aggregationTemporality { get; set; }
    public List<DataPoint> dataPoints { get; set; }
}