using Manta.Api.Models;
using Dapper;
using Manta.Api.Interfaces;
using Npgsql;

namespace Manta.Api.EndpointHandlers.Application;

public class GetTraceEvents(IConfiguration config) : IWebRequestHandler<string>
{
    private readonly string _connectionString = config.GetValue<string>("ConnectionString");
    public async Task<IResult> Handle(HttpContext ctx, string traceId)
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        // var sql = """
        //           SELECT (ROW_NUMBER() OVER ())::integer as id, message,start_timestamp, end_timestamp, span_id
        //           FROM events e
        //           WHERE trace_id = @TraceId
        //           ORDER BY id
        //           """;
        
        var sql = """
                  SELECT id, message,start_timestamp, end_timestamp, span_id, severity
                  FROM events e
                  WHERE trace_id = @TraceId
                  ORDER BY start_timestamp
                  """;        var results = await connection.QueryAsync(sql, new {TraceId = traceId});
        var events = results.Select(row => new Event() {Message = row.message, StartTime = row.start_timestamp, EndTime = row.end_timestamp, SpanId = row.span_id, Id = row.id, TraceId = traceId, Severity = row.severity}).ToList();

        foreach (var @event in events)
        {
            @event.OffsetMilliseconds = @event.StartTime.Subtract(events[0].StartTime).TotalMilliseconds;
            @event.DurationMilliseconds = @event.EndTime.Subtract(@event.StartTime).TotalMilliseconds;
        }
        
        return Results.Ok(events);
    }
}