using Attribute = api.Models.OpenTelemetry.Attribute;
using Dapper;
using Npgsql;

namespace api.Repositories;

public class EventAttributeRepository : IEventAttributeRepository
{
    public static string Id => "EventAttributes";

    private const string InsertCommand = @"INSERT INTO EventAttributes (eventId, name, value) VALUES (:event_id, :name, :value);";
    private const string BulkInsertCommand = @"INSERT INTO EventAttributes (eventId, name, value) SELECT :event_id, unnest(:name), unnest(:value);";
    
    public Task Insert(Attribute attribute, int eventId, NpgsqlConnection connection)
    {
        using var command = new NpgsqlCommand(InsertCommand, connection);

        command.Parameters.AddWithValue("event_id", eventId);
        command.Parameters.AddWithValue("name", attribute.Key);
        command.Parameters.AddWithValue("value", attribute.Value.ToString());

        return command.ExecuteNonQueryAsync();
    }

    public Task Insert(IEnumerable<Attribute> attributes, int eventId, NpgsqlConnection connection)
    {
        if (attributes == null || !attributes.Any())
        {
            return Task.CompletedTask;
        }

        var command = new NpgsqlCommand(BulkInsertCommand, connection);

        command.Parameters.AddWithValue("event_id", eventId);
        command.Parameters.AddWithValue("name", attributes.Select(a => a.Key).ToArray());
        command.Parameters.AddWithValue("value", attributes.Select(a => a.Value.ToString()).ToArray());

        return command.ExecuteNonQueryAsync();
    }

    public Task<IEnumerable<Attribute>> Load(int eventId, NpgsqlConnection connection)
    {
        return connection.QueryAsync<Attribute>("SELECT * from EventAttributes where eventId = @EventId", new {EventId = eventId});
    }

    public async Task<IEnumerable<string>> GetUniqueNames(NpgsqlConnection connection)
    {
        return await connection.QueryAsync<string>("SELECT DISTINCT name from EventAttributes");
    }
}