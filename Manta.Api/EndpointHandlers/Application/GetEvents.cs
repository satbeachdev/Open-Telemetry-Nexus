using Manta.Api.Interfaces;
using Manta.Api.Services;

namespace Manta.Api.EndpointHandlers.Application;

public class GetEvents(IEventService _eventService) : IWebRequestHandler<int, int>
{
    public async Task<IResult> Handle(HttpContext ctx, int skip, int limit)
    {
        var result = await _eventService.Load(skip, limit);
        
        ctx.Response.Headers.Append("x-total-count", result.Count.ToString());
        
        return Results.Ok(result.Events);
    }
}