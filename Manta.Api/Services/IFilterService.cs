using Manta.Api.Models;

namespace Manta.Api.Services;

public interface IFilterService
{
    Task<IEnumerable<object>> Load(int? skip, int? limit, bool? textOnly);
}