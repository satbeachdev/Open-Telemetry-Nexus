using api.Services;

namespace api;

public class FilterEvents(IEventService _eventService) : IWebRequestHandler<string, int, int>
{
    public async Task<IResult> Handle(HttpContext ctx, string filter, int skip, int limit)
    {
        var result = await _eventService.Filter(filter, skip, limit);
        
        ctx.Response.Headers.Append("x-total-count", result.Count.ToString());
        
        return Results.Ok(result.Events);
    }
}