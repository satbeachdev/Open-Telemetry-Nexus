using System.Reflection;
using System.Text.Json;
using api.Models;
using Dapper;
using Npgsql;
using Attribute = api.Models.OpenTelemetry.Attribute;

namespace api;

public class GetEventAttributes(IConfiguration config) : IWebRequestHandler<int>
{
    private readonly string _connectionString = config.GetValue<string>("ConnectionString");
    public async Task<IResult> Handle(HttpContext ctx, int eventId)
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var sql = "SELECT attributes FROM Events WHERE id = @EventId";
        
        var result = await connection.QuerySingleAsync<dynamic>(sql, new {EventId = eventId});

        // Deserialize the attributes column
        Dictionary<string, object> attributes = JsonSerializer.Deserialize<Dictionary<string, object>>(result.attributes.ToString());
        
        return Results.Ok(attributes.Select<KeyValuePair<string, object>, dynamic>(x => new { name = x.Key, value = x.Value }).ToList());
    }
}