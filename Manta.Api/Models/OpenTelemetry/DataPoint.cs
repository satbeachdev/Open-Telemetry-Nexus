namespace Manta.Api.Models.OpenTelemetry;

public class DataPoint
{
    public int asDouble { get; set; }
    public string startTimeUnixNano { get; set; }
    public string timeUnixNano { get; set; }
    public List<Attribute> attributes { get; set; }
    public int count { get; set; }
    public int sum { get; set; }
    public List<int> bucketCounts { get; set; }
    public List<int> explicitBounds { get; set; }
    public int min { get; set; }
    public int max { get; set; }
}
