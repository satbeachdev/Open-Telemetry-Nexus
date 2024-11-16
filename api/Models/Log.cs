using System.ComponentModel.DataAnnotations.Schema;
using Attribute = api.Models.OpenTelemetry.Attribute;

namespace api.Models;

public class Log
{
    public int Id { get; set; }
    [Column("trace_id")]
    public string TraceId { get; set; }
    [Column("span_id")]
    public string SpanId { get; set; }
    public DateTime Timestamp { get; set; }
    public string Message { get; set; }
    public int Severity { get; set; }
    [Column("severity_text")]
    public string SeverityText { get; set; }

    public IEnumerable<Attribute> Attributes { get; set; } = [];
}