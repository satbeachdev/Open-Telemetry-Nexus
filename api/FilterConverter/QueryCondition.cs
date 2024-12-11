namespace api.FilterConverter;

public class QueryCondition
{
    public string? Field { get; set; }
    public string Operator { get; set; } = string.Empty;
    public object? Value { get; set; }
    public bool IsJsonField { get; set; }
}