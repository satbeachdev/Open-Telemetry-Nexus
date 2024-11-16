namespace api.Models.OpenTelemetry;

public class Value
{
    public string stringValue { get; set; }
    public string intValue { get; set; }
    public double? doubleValue { get; set; }
    public bool? boolValue { get; set; }
    public ArrayValue arrayValue { get; set; }
    public KvlistValue kvlistValue { get; set; }
}

public class ArrayValue
{
    public List<Value> values { get; set; }
}

public class KvlistValue
{
    public List<Value> values { get; set; }
}