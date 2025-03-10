using Manta.Api.EndpointHandlers.Application;
using Manta.Api.EndpointHandlers.OpenTelemetry;
using Manta.Api.Interfaces;
using Manta.Api.Middleware;
using Manta.Api.Models.OpenTelemetry;
using Manta.Api.Repositories;
using Manta.Api.Services;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetValue<string>("ConnectionString");

builder.Services.AddTransient<IOpenTelemetryHandler<LogMessage>, LogHandler>();
builder.Services.AddTransient<IOpenTelemetryHandler<TraceMessage>, TraceHandler>();
builder.Services.AddTransient<IOpenTelemetryHandler<MetricMessage>, MetricHandler>();

builder.Services.AddTransient<IWebRequestHandler<int, int>, GetEvents>();
builder.Services.AddTransient<IWebRequestHandler<string, int, int>, FilterEvents>();
builder.Services.AddTransient<IWebRequestHandler<string>, GetTraceEvents>();
builder.Services.AddTransient<IWebRequestHandler<int>, GetEventAttributes>();
builder.Services.AddTransient<IWebRequestHandler, GetUniqueAttributes>();
builder.Services.AddTransient<IGetAllFiltersHandler, GetFilters>();
builder.Services.AddTransient<IDeleteFilterHandler, DeleteFilter>();

builder.Services.AddTransient<IEventService, EventService>();
builder.Services.AddTransient<IEventRepository, EventRepository>();
builder.Services.AddTransient<IFilterService, FilterService>();
builder.Services.AddTransient<IFilterRepository, FilterRepository>();

var allowedServersSection = builder.Configuration.GetSection("AllowedServers");
var allowedServers = allowedServersSection.Get<string[]>() ?? ["http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        cors => cors
            .WithOrigins(allowedServers)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .WithExposedHeaders("x-total-count"));
});

var app = builder.Build();

// Incoming OpenTelemetry endpoints
app.MapPost("/v1/logs", ([FromBody] LogMessage message, IOpenTelemetryHandler<LogMessage> handler) => handler.Handle(message));
app.MapPost("/v1/traces", ([FromBody] TraceMessage message, IOpenTelemetryHandler<TraceMessage> handler) => handler.Handle(message));
app.MapPost("/v1/metrics", ([FromBody] MetricMessage message, IOpenTelemetryHandler<MetricMessage> handler) => handler.Handle(message));

// Outgoing UI endpoints
app.MapGet("/allevents", async (HttpContext ctx, int skip, int limit, [FromServices]IWebRequestHandler<int, int> getEvents) => await getEvents.Handle(ctx, skip, limit));
app.MapGet("/events", async (HttpContext ctx, string filter,int skip, int limit, [FromServices]IWebRequestHandler<string, int, int> filterEvents) => await filterEvents.Handle(ctx, filter,skip, limit));
app.MapGet("/events/{eventId:int}/attributes", async (HttpContext ctx, [FromRoute] int eventId, [FromServices]IWebRequestHandler<int> getEventAttributes) => await getEventAttributes.Handle(ctx, eventId));
app.MapGet("/traces/{traceId}/events", async (HttpContext ctx, [FromRoute] string traceId, [FromServices]IWebRequestHandler<string> getTraceEvents) => await getTraceEvents.Handle(ctx, traceId));
app.MapGet("/events/attribute-names", async (HttpContext ctx, [FromServices]IWebRequestHandler getUniqueAttributes) => await getUniqueAttributes.Handle(ctx));

app.MapGet("/filters", async (HttpContext ctx, int? skip, int? limit, bool? textOnly, [FromServices]IGetAllFiltersHandler getFilters) => await getFilters.Handle(ctx, skip, limit, textOnly));
app.MapDelete("/filters/{filterId:int}", async (HttpContext ctx, [FromRoute] int filterId, [FromServices]IDeleteFilterHandler deleteFilter) => await deleteFilter.Handle(ctx, filterId));

app.UseMiddleware<GzipDecompressionMiddleware>();
app.UseMiddleware<LogJsonRequestBodyMiddleware>();

app.UseCors("AllowSpecificOrigin");

app.Run();
