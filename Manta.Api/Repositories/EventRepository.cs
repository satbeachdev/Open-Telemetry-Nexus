using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Reflection;
using Manta.Api.Models;
using Dapper;
using Npgsql;

namespace Manta.Api.Repositories;

public class EventRepository : RepositoryBase<Event>, IEventRepository
{
    private const string InsertCommand = @"INSERT INTO Events (trace_id, parent_span_id, span_id, message, start_timestamp, end_timestamp, duration, is_trace, service_name, attributes) VALUES (:trace_id, :parent_span_id, :span_id, :message, :start_timestamp, :end_timestamp, :duration, :is_trace, :service_name, :attributes) RETURNING id;";

    public async Task<object?> Insert(EventWithAttributes @event, NpgsqlConnection connection)
    {
        object? id = default;
        
        try
        {
            var command = new NpgsqlCommand(InsertCommand, connection);

            command.Parameters.AddWithValue("trace_id", @event.TraceId);
            command.Parameters.AddWithValue("parent_span_id", @event.ParentSpanId == null ? DBNull.Value : @event.ParentSpanId);
            command.Parameters.AddWithValue("span_id", @event.SpanId);
            command.Parameters.AddWithValue("message", @event.Message);
            command.Parameters.AddWithValue("start_timestamp", @event.StartTime);
            command.Parameters.AddWithValue("end_timestamp", @event.EndTime);
            command.Parameters.AddWithValue("duration", @event.DurationMilliseconds);
            command.Parameters.AddWithValue("is_trace", @event.IsTrace);
            command.Parameters.AddWithValue("service_name", @event.ServiceName);
            command.Parameters.AddWithValue("attributes", NpgsqlTypes.NpgsqlDbType.Jsonb, @event.Attributes);

            id = await command.ExecuteScalarAsync();
        } 
        catch (Exception e)
        {
            Console.WriteLine(e);
        }

        return await Task.FromResult(id);
    }

    public async Task<(IEnumerable<Event> Events, int Count)> Load(int skip, int limit, NpgsqlConnection connection)
    {
        SetTypeMap();
        
        var rows = await connection.QueryAsync<Event>($"SELECT * FROM Events ORDER BY start_timestamp DESC OFFSET {skip} LIMIT {limit};");

        return (rows, await connection.ExecuteScalarAsync<int>("SELECT COUNT(id) FROM Events"));
    }  
    
    public async Task<(IEnumerable<Event> Events, int Count)> Load(string whereClause, int skip, int limit, NpgsqlConnection connection)
    {
        SetTypeMap();
        
        var rows = await connection.QueryAsync<Event>(whereClause);

        return (rows, rows.Count());
    }  
    
    public async Task<IEnumerable<string>> GetUniqueNames(NpgsqlConnection connection)
    {
        return await connection.QueryAsync<string>("SELECT DISTINCT jsonb_object_keys(attributes) as name FROM Events ORDER By name ASC");
    }    
}