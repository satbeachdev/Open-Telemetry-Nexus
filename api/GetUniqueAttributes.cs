using api.Services;

namespace api;

public class GetUniqueAttributes(IEventAttributeService eventAttributeService) : IWebRequestHandler
{
    public async Task<IResult> Handle(HttpContext ctx)
    {
        var uniqueNames = await eventAttributeService.GetUniqueNames();
                   
        return Results.Ok(uniqueNames.Append("message").Append("duration"));
    }
}