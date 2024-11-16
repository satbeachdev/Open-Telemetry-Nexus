using api.Models;
using Dapper;
using Npgsql;

namespace api;

public class GetEventAttributes(IConfiguration config) : IWebRequestHandler<int>
{
    private readonly string _connectionString = config.GetValue<string>("ConnectionString");
    public async Task<IResult> Handle(HttpContext ctx, int eventId)
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var sql = "SELECT * FROM EventAttributes WHERE eventId = @EventId";
        
        var results = await connection.QueryAsync(sql, new {EventId = eventId});
        
        return Results.Ok(results);
    }
}