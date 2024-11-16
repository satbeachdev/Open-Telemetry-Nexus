using System.Diagnostics.Tracing;
using api.Repositories;
using Npgsql;

namespace api.Services;

public class EventAttributeService(IEventAttributeRepository eventAttributeRepository, IConfiguration config) : IEventAttributeService
{
    private readonly string _connectionString = config.GetValue<string>("ConnectionString") ?? string.Empty;
    public async Task<IEnumerable<string>> GetUniqueNames()
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        return await eventAttributeRepository.GetUniqueNames(connection);
    }
}