using api.Models.OpenTelemetry;
using api.Services;

namespace api;

public class LogHandler(IEventService eventService, ILogger<LogHandler> logger) : IOpenTelemetryHandler<LogMessage>
{
    public void Handle(LogMessage message) => eventService.Save(message);
}