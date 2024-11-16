namespace api.Models.OpenTelemetry;

public class ScopeLog
{
    public Scope scope { get; set; }
    public List<LogRecord> logRecords { get; set; }
}