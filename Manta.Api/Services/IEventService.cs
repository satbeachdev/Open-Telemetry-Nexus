using Manta.Api.Models;
using Manta.Api.Models.OpenTelemetry;
using Manta.Api.Models.OpenTelemetry;

namespace Manta.Api.Services;

public interface IEventService
{
    Task<(IEnumerable<Event> Events, int Count)> Load(int skip, int limit);
    Task<(IEnumerable<Event> Events, int Count)> Filter(string filter, int skip, int limit);
    
    Task Save(LogMessage logMessage);
    
    Task Save(TraceMessage logMessage);
    
    Task<IEnumerable<string>> GetUniqueNames();
}