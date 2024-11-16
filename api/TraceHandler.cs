using api.Models.OpenTelemetry;
using api.Services;

namespace api;

public class TraceHandler(IEventService eventService, ILogger<TraceHandler> logger) : IOpenTelemetryHandler<TraceMessage>
{
    public void Handle(TraceMessage message) => eventService.Save(message);
}