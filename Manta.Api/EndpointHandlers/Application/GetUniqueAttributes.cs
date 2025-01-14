using Manta.Api.Interfaces;
using Manta.Api.Services;

namespace Manta.Api.EndpointHandlers.Application;

public class GetUniqueAttributes(IEventService eventService) : IWebRequestHandler
{
    public async Task<IResult> Handle(HttpContext ctx)
    {
        var uniqueNames = await eventService.GetUniqueNames();
                   
        return Results.Ok(uniqueNames.Append("message").Append("duration"));
    }
}