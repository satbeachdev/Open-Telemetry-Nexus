namespace Manta.Api.Models.OpenTelemetry;

public class LogRecord
{
    public string timeUnixNano { get; set; }
    public string observedTimeUnixNano { get; set; }
    public int severityNumber { get; set; }
    public string severityText { get; set; }
    public string traceId { get; set; }
    public string spanId { get; set; }
    public Body body { get; set; }
    public List<Attribute>? attributes { get; set; }
}