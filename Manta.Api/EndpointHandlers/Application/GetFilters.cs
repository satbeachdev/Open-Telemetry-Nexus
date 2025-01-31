using Manta.Api.Interfaces;
using Manta.Api.Services;

namespace Manta.Api.EndpointHandlers.Application;

public class GetFilters(IFilterService filterService) : IGetAllFiltersHandler
{
    public async Task<IResult> Handle(HttpContext ctx, int? skip, int? limit, bool? textOnly)
    {
        var result = await filterService.Load(skip, limit, textOnly);
        
        //ctx.Response.Headers.Append("x-total-count", result.Count.ToString());
        
        return Results.Ok(result);
    }
}