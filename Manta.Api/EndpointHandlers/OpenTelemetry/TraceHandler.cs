using Manta.Api.Interfaces;
using Manta.Api.Models.OpenTelemetry;
using Manta.Api.Services;
using Manta.Api.Models.OpenTelemetry;

namespace Manta.Api.EndpointHandlers.OpenTelemetry;

public class TraceHandler(IEventService eventService, ILogger<TraceHandler> logger) : IOpenTelemetryHandler<TraceMessage>
{
    public void Handle(TraceMessage message) => eventService.Save(message);
}