using api.Services;

namespace api;

public class GetUniqueAttributes(IEventService eventService) : IWebRequestHandler
{
    public async Task<IResult> Handle(HttpContext ctx)
    {
        var uniqueNames = await eventService.GetUniqueNames();
                   
        return Results.Ok(uniqueNames.Append("message").Append("duration"));
    }
}