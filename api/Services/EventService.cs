using System.Runtime.CompilerServices;
using api.FilterConverter;
using api.Models;
using api.Models.OpenTelemetry;
using api.Repositories;
using Npgsql;
using Attribute = api.Models.OpenTelemetry.Attribute;

namespace api.Services;

public class EventService(IConfiguration config, IEventRepository eventRepository, IEventAttributeRepository eventAttributeRepository, ILogger<EventService> logger) : IEventService
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

        var names = await eventAttributeRepository.GetUniqueNames(connection);

        var uniqueNames = names.ToDictionary(k => k, v => v);

        var events = default((IEnumerable<Event>, int));
        
        if (!string.IsNullOrWhiteSpace(filter))
        {
            var where = QueryConverter.ToPostgresSql(filter, uniqueNames);

            events = await eventRepository.Load(where, skip, limit, connection);
        }
        else
        {
            events = await eventRepository.Load(skip, limit, connection);
        }

        return events;
    }    
    
    public async Task Save(LogMessage logMessage)
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        foreach (var logRecord in logMessage.resourceLogs.SelectMany(resourceLog => resourceLog.scopeLogs.SelectMany(scopeLog => scopeLog.logRecords)))
        {
            var timestamp = TimeConverter.EpochToDateTime(long.Parse(logRecord.timeUnixNano));
            
            var @event = new Event()
            {
                TraceId = logRecord.traceId,
                SpanId = logRecord.spanId,
                Message = logRecord.body.stringValue,
                ServiceName = GetServiceNameFromAttributes(logMessage.resourceLogs[0].resource.attributes),
                StartTime = timestamp,
                EndTime = timestamp,
                DurationMilliseconds = 0,
                IsTrace = false
            };
            
            var id = await eventRepository.Insert(@event, connection);

            if (id != null)
            {
                var eventId = (int)id;
                
                logRecord.attributes.Add(new Attribute() { Key = "severity", Value = logRecord.severityNumber });
                logRecord.attributes.Add(new Attribute() { Key = "severity_text", Value = logRecord.severityText });
                
                await eventAttributeRepository.Insert(logRecord.attributes, eventId, connection);
            }
        }
    }
    
    public async Task Save(TraceMessage message)
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        foreach (var resourceSpan in message.resourceSpans)
        {
            var resourceSpanAttribs = GetResourceAttributes(resourceSpan);

            foreach (var scopeSpan in resourceSpan.scopeSpans)
            {
                var scopeSpanAttribs = GetScopeAttributes(scopeSpan);

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
                        ServiceName = GetServiceNameFromAttributes(resourceSpanAttribs),
                        StartTime = startTime,
                        EndTime = endTime,
                        DurationMilliseconds = (endTime - startTime).TotalMilliseconds,
                        IsTrace = true
                    };
                    
                    var id = await eventRepository.Insert(@event, connection);

                    if (id != null)
                    {
                        var eventId = (int)id;

                        if (span.attributes == null)
                        {
                            span.attributes = new List<Attribute>();
                        }
                        
                        span.attributes.Add(new Attribute() { Key = "kind", Value = span.kind });
                        
                        await eventAttributeRepository.Insert(resourceSpanAttribs, eventId, connection);
                        await eventAttributeRepository.Insert(scopeSpanAttribs, eventId, connection);
                        await eventAttributeRepository.Insert(span.attributes, eventId, connection);
                    }
                }
            }
        }
    }

    private string GetServiceNameFromAttributes(IEnumerable<Attribute> attributes)
    {
        var serviceName = string.Empty;
        
        var attrib = attributes.SingleOrDefault(a => a.Key.Contains("service.name"));
        
        if (attrib != null)
        {
            serviceName = attrib.Value?.ToString() ?? string.Empty;
        }
        
        return serviceName;
    }
    private List<Attribute> GetResourceAttributes(ResourceSpan resourceSpan)
    {
        return [..resourceSpan.resource.attributes.Select(a => new Attribute { Key = $"resource.{a.Key}", Value = a.Value })];
    }

    private List<Attribute> GetScopeAttributes(ScopeSpan scopeSpan)
    {
        if (scopeSpan == null || scopeSpan.scope == null || scopeSpan.scope.attributes == null)
        {
            return [];
        }
        
        return [..scopeSpan.scope.attributes.Select(a => new Attribute { Key = $"scope.{a.Key}", Value = a.Value })];
    }
}