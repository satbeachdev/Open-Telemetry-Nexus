using Manta.Api.Interfaces;
using Manta.Api.Services;

namespace Manta.Api.EndpointHandlers.Application;

public class DeleteFilter(IFilterService filterService) : IDeleteFilterHandler
{
    public async Task<IResult> Handle(HttpContext ctx, int filterId)
    {
        await filterService.Delete(filterId);
        
        return Results.NoContent();
    }
}