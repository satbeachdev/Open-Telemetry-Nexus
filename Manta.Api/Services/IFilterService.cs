using Manta.Api.Models;

namespace Manta.Api.Services;

public interface IFilterService
{
    Task<IEnumerable<string>> Load(int? skip, int? limit);
}