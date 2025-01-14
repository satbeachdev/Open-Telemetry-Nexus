namespace Manta.Api.Models.OpenTelemetry;

public class Scope
{
    public string name { get; set; }
    public string version { get; set; }
    public List<Attribute> attributes { get; set; }
}