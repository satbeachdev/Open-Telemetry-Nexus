using api.Models;
using api.Models.OpenTelemetry;

namespace api.Services;

public interface IEventService
{
    Task<(IEnumerable<Event> Events, int Count)> Load(int skip, int limit);
    Task<(IEnumerable<Event> Events, int Count)> Filter(string filter, int skip, int limit);
    
    Task Save(LogMessage logMessage);
    
    Task Save(TraceMessage logMessage);
}