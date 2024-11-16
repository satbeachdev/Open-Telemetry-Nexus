using System.Text.Json.Serialization;

namespace api.Models.OpenTelemetry;

public class Attribute
{
    public string Key { get; set; }
    [JsonConverter(typeof(AttributeValueConverter))]
    public object Value { get; set; }
}