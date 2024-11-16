namespace api.Models.OpenTelemetry;

public class Sum
{
    public int aggregationTemporality { get; set; }
    public bool isMonotonic { get; set; }
    public List<DataPoint> dataPoints { get; set; }
}