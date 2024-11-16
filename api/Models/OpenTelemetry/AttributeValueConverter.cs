using System.Text.Json;
using System.Text.Json.Serialization;

namespace api.Models.OpenTelemetry;

public class AttributeValueConverter : JsonConverter<object>
{
    public override object? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        // Read the start of the object
        reader.Read(); // Read past '{'
        
        var propertyName = reader.GetString();
        reader.Read(); // Read past the property name

        object? result = propertyName switch
        {
            "stringValue" => reader.GetString(),
            "doubleValue" => reader.GetDouble(),
            "intValue" => reader.GetString(),
            "boolValue" => reader.GetBoolean(),
            "arrayValue" => null,
            "kyListValue" => null,
            _ => new JsonException("Unexpected property name")
        };

        reader.Read(); // Read past '}'

        return result;
    }

    public override void Write(Utf8JsonWriter writer, object value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString());
    }
}