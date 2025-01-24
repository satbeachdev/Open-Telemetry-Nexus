using Manta.Api.Interfaces;
using Manta.Api.Models.OpenTelemetry;

namespace Manta.Api.EndpointHandlers.OpenTelemetry;

public class MetricHandler(ILogger<MetricHandler> logger) : IOpenTelemetryHandler<MetricMessage>
{
    public void Handle(MetricMessage message)
    {
        
    }
}