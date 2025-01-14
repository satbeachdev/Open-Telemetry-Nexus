using Manta.Api.Models;
using Manta.Api.Repositories;
using Npgsql;

namespace Manta.Api.Services;

public class FilterService(IConfiguration config, IFilterRepository filterRepository, ILogger<FilterService> logger) : IFilterService
{
    private readonly IConfiguration _config = config;
    private readonly ILogger<FilterService> _logger = logger;
    private readonly string _connectionString = config.GetValue<string>("ConnectionString") ?? string.Empty;
    
    public async Task<IEnumerable<string>> Load(int? skip, int? limit)
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var filters = await filterRepository.GetAll(connection);

        return filters.Select(f => f.Text).ToList();
    }
}