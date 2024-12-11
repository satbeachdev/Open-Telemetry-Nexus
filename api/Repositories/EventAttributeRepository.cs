using System.Text.Json;
using Attribute = api.Models.OpenTelemetry.Attribute;
using Dapper;
using Npgsql;

namespace api.Repositories;

public class EventAttributeRepository : IEventAttributeRepository
{
    public static string Id => "EventAttributes";

    private const string BulkInsertCommand = @"INSERT INTO EventAttributes (eventId, attributes) SELECT :event_id, :attributes::jsonb;";
    
    public Task Insert(IDictionary<string, object> attributes, int eventId, NpgsqlConnection connection)
    {
        if (!attributes.Any())
        {
            return Task.CompletedTask;
        }

        var command = new NpgsqlCommand(BulkInsertCommand, connection);

        command.Parameters.AddWithValue("event_id", eventId);
        command.Parameters.AddWithValue("attributes", JsonSerializer.Serialize(attributes));

        return command.ExecuteNonQueryAsync();
    }

    public async Task<IEnumerable<string>> GetUniqueNames(NpgsqlConnection connection)
    {
        return await connection.QueryAsync<string>("SELECT DISTINCT jsonb_object_keys(attributes) as name FROM EventAttributes ORDER By name ASC");
    }
}