namespace api.Models.OpenTelemetry;

public class Span
{
    public string traceId { get; set; }
    public string spanId { get; set; }
    public string parentSpanId { get; set; }
    public string name { get; set; }
    public string startTimeUnixNano { get; set; }
    public string endTimeUnixNano { get; set; }
    public int kind { get; set; }
    public List<Attribute> attributes { get; set; }
}