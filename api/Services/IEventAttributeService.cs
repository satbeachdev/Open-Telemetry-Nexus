using System.Diagnostics.Tracing;

namespace api.Services;

public interface IEventAttributeService
{
    Task<IEnumerable<string>> GetUniqueNames();
}