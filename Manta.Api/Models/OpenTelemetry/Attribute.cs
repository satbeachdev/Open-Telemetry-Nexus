using System.Text.Json.Serialization;

namespace Manta.Api.Models.OpenTelemetry;

public class Attribute
{
    public string Key { get; set; }
    [JsonConverter(typeof(AttributeValueConverter))]
    public object Value { get; set; }
}