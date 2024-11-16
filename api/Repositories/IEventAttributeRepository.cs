using Npgsql;
using Attribute = api.Models.OpenTelemetry.Attribute;

namespace api.Repositories;

public interface IEventAttributeRepository
{
    Task Insert(Attribute attribute, int parentId, NpgsqlConnection connection);
    Task Insert(IEnumerable<Attribute> attributes, int parentId, NpgsqlConnection connection);
    Task<IEnumerable<Attribute>> Load(int parentId, NpgsqlConnection connection);
   
    Task<IEnumerable<string>> GetUniqueNames(NpgsqlConnection connection);
}