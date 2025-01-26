using Manta.Api.Models;
using Npgsql;

namespace Manta.Api.Repositories;

public interface IFilterRepository
{
    Task<Filter?> Create(Filter filter, NpgsqlConnection connection);
    Task<Filter?> Update(Filter filter, NpgsqlConnection connection);
    Task<bool> Delete(int filterId, NpgsqlConnection connection);
    
    Task<IEnumerable<object>> GetAll(NpgsqlConnection connection, int? skip = null, int? limit = null, bool? textOnly = false);
    
    Task<int> GetFilterIdByExpression(string filter, NpgsqlConnection connection);
}