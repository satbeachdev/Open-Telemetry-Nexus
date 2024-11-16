using Attribute = api.Models.OpenTelemetry.Attribute;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models;

public class Event
{
    public int Id { get; init; }
    
    [Column("trace_id")]
    public string? TraceId { get; init; }
    
    [Column("span_id")]
    public string? SpanId { get; init; }
    public string? Message { get; init; }
    
    [Column("service_name")]
    public string? ServiceName { get; set; }

    [Column("parent_span_id")]
    public string? ParentSpanId { get; init; }

    [Column("start_timestamp")]
    public DateTime StartTime { get; init; }
    
    [Column("end_timestamp")]
    public DateTime EndTime { get; init; }

    public double OffsetMilliseconds { get; set; }

    [Column(name: "duration")]
    public double DurationMilliseconds { get; set; }
    
    public bool IsTrace { get; set; }
    
    public IEnumerable<Attribute> Attributes { get; set; } = [];    
}