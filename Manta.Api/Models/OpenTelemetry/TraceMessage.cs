namespace Manta.Api.Models.OpenTelemetry;

public class TraceMessage
{
    public List<ResourceSpan> resourceSpans { get; set; }
}