using Npgsql;
using Attribute = api.Models.OpenTelemetry.Attribute;

namespace api.Repositories;

public interface IEventAttributeRepository
{
    Task Insert(IDictionary<string, object> attributes, int parentId, NpgsqlConnection connection);
    Task<IEnumerable<string>> GetUniqueNames(NpgsqlConnection connection);
}