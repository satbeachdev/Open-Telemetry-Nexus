using api.Models;
using Npgsql;

namespace api.Repositories;
public interface IEventRepository
{
    Task<object?> Insert(EventWithAttributes @event, NpgsqlConnection connection);
    Task<(IEnumerable<Event> Events, int Count)> Load(int skip, int limit, NpgsqlConnection connection);    
    Task<(IEnumerable<Event> Events, int Count)> Load(string whereClause, int skip, int limit, NpgsqlConnection connection);    
    Task<IEnumerable<string>> GetUniqueNames(NpgsqlConnection connection);
}