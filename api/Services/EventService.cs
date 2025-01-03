using System.Runtime.CompilerServices;
using api.FilterConverter;
using api.Models;
using api.Models.OpenTelemetry;
using api.Repositories;
using Npgsql;
using Attribute = api.Models.OpenTelemetry.Attribute;

namespace api.Services;

public class EventService(IConfiguration config, IEventRepository eventRepository, IFilterRepository filterRepository, ILogger<EventService> logger) : IEventService
{
    private readonly IConfiguration _config = config;
    private readonly ILogger<EventService> _logger = logger;
    private readonly string _connectionString = config.GetValue<string>("ConnectionString") ?? string.Empty;

    public async Task<(IEnumerable<Event> Events, int Count)> Load(int skip, int limit)
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var events = await eventRepository.Load(skip, limit, connection);

        return events;
    }    
    
    public async Task<(IEnumerable<Event> Events, int Count)> Filter(string filter, int skip, int limit)
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var events = default((IEnumerable<Event>, int));
        
        if (!string.IsNullOrWhiteSpace(filter))
        {
            var names = await eventRepository.GetUniqueNames(connection);

            var uniqueNames = names.ToDictionary(k => k, v => v);

            var where = QueryConverter.ToPostgresSql(filter, uniqueNames);

            // Only save filters that can be parsed
            if (!string.IsNullOrWhiteSpace(where))
            {
                var filterId = await filterRepository.GetFilterIdByExpression(filter, connection);
                
                if (filterId == -1)
                {
                    await filterRepository.Create(new Filter() { Text = filter, LastUsed = DateTime.Now }, connection);
                }
                else
                {
                    await filterRepository.Update(new Filter() { Id = filterId, LastUsed = DateTime.Now }, connection);
                }
            }
            
            events = await eventRepository.Load(where, skip, limit, connection);
        }
        else
        {
            events = await eventRepository.Load(skip, limit, connection);
        }

        return events;
    }    
    
    public async Task Save(LogMessage message)
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        foreach (var logRecord in message.resourceLogs.SelectMany(resourceLog => resourceLog.scopeLogs.SelectMany(scopeLog => scopeLog.logRecords)))
        {
            var timestamp = TimeConverter.EpochToDateTime(long.Parse(logRecord.timeUnixNano));
            
            var @event = new Event()
            {
                TraceId = logRecord.traceId,
                ParentSpanId = null,
                SpanId = logRecord.spanId,
                Message = logRecord.body.stringValue,
                ServiceName = (string?)(message.resourceLogs[0].resource.attributes.SingleOrDefault(a => a.Key == "service.name"))?.Value ?? string.Empty,
                StartTime = timestamp,
                EndTime = timestamp,
                DurationMilliseconds = 0,
                IsTrace = false
            };
            
            var id = await eventRepository.Insert(@event, connection);
        
            if (id != null)
            {
                var eventId = (int)id;
                
                var attributes = new Dictionary<string, object>()
                {
                    { "severity", logRecord.severityNumber },
                    {"severity_text", logRecord.severityText }
                };

                foreach (var attrib in logRecord.attributes)
                {
                    attributes.Add(attrib.Key, attrib.Value);
                }

                //await eventAttributeRepository.Insert(attributes, eventId, connection);
            }
        }
    }
    
    public async Task Save(TraceMessage message)
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var attributes = new Dictionary<string, object>();
        
        foreach (var resourceSpan in message.resourceSpans)
        {
            AddResourceAttributes(resourceSpan, attributes);

            foreach (var scopeSpan in resourceSpan.scopeSpans)
            {
                AddScopeAttributes(scopeSpan, attributes);

                foreach (var span in scopeSpan.spans)
                {
                    var startTime = TimeConverter.EpochToDateTime(long.Parse(span.startTimeUnixNano));
                    var endTime = TimeConverter.EpochToDateTime(long.Parse(span.endTimeUnixNano));

                    var @event = new Event()
                    {
                        TraceId = span.traceId,
                        ParentSpanId = span.parentSpanId,
                        SpanId = span.spanId,
                        Message = span.name,
                        ServiceName = GetServiceNameFromAttributes(attributes),
                        StartTime = startTime,
                        EndTime = endTime,
                        DurationMilliseconds = (endTime - startTime).TotalMilliseconds,
                        IsTrace = true
                    };
                    
                    var id = await eventRepository.Insert(@event, connection);
                    
                    if (id != null)
                    {
                        var eventId = (int)id;
                    
                        attributes.Add("kind", span.kind);

                        if (span.attributes != null)
                        {
                            foreach (var attribute in span.attributes)
                            {
                                attributes.Add(attribute.Key, attribute.Value);
                            }
                        }

                        //await eventAttributeRepository.Insert(attributes, eventId, connection);
                    }
                }
            }
        }
    }
    
    public async Task<IEnumerable<string>> GetUniqueNames()
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        return await eventRepository.GetUniqueNames(connection);
    }
    
    private string GetServiceNameFromAttributes(Dictionary<string, object> attributes)
    {
        var serviceName = string.Empty;

        if (attributes.TryGetValue("resource.service.name", out var name))
        {
            serviceName = (string)name;
        }
        
        return serviceName;
    }
    // Span Attributes
    
    private void AddResourceAttributes(ResourceSpan resourceSpan, Dictionary<string, object> attributes)
    {
        foreach (var attribute in resourceSpan.resource.attributes)
        {
            attributes.Add($"resource.{attribute.Key}", attribute.Value);
        }
    }

    private void AddScopeAttributes(ScopeSpan scopeSpan, Dictionary<string, object> attributes)
    {
        if (scopeSpan.scope.attributes != null)
        {
            foreach (var attribute in scopeSpan.scope.attributes)
            {
                attributes.Add($"scope.{attribute.Key}", attribute.Value);
            }
        }
    }
    
    // Log Attributes
    private void AddResourceAttributes(ResourceLog resourceLog, Dictionary<string, object> attributes)
    {
        foreach (var attribute in resourceLog.resource.attributes)
        {
            attributes.Add($"resource.{attribute.Key}", attribute.Value);
        }
    }

    private void AddScopeAttributes(ScopeLog scopeLog, Dictionary<string, object> attributes)
    {
        if (scopeLog.scope.attributes != null)
        {
            foreach (var attribute in scopeLog.scope.attributes)
            {
                attributes.Add($"scope.{attribute.Key}", attribute.Value);
            }
        }
    }
}