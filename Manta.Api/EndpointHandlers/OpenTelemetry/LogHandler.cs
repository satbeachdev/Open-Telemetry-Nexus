using Manta.Api.Interfaces;
using Manta.Api.Models.OpenTelemetry;
using Manta.Api.Services;
using Manta.Api.Models.OpenTelemetry;

namespace Manta.Api.EndpointHandlers.OpenTelemetry;

public class LogHandler(IEventService eventService, ILogger<LogHandler> logger) : IOpenTelemetryHandler<LogMessage>
{
    public void Handle(LogMessage message) => eventService.Save(message);
}