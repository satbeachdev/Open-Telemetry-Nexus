using api.Models;

namespace api.Services;

public interface IFilterService
{
    Task<IEnumerable<string>> Load(int? skip, int? limit);
}