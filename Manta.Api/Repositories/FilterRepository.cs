using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Reflection;
using Manta.Api.Models;
using Dapper;
using InterpolatedSql.Dapper;
using Npgsql;

namespace Manta.Api.Repositories;

public class FilterRepository : RepositoryBase<Filter>, IFilterRepository
{
    private const string InsertCommand = @"INSERT INTO Filters (filter, last_used) VALUES (:filter, :last_used) RETURNING id;";
    private const string UpdateCommand = @"UPDATE Filters SET last_used = @lastUsed WHERE id = @id";
    private const string DeleteCommand = @"DELETE FROM Filters WHERE id = @id";
    private const string GetAllCommand = @"SELECT * FROM Filters";
    public async Task<Filter?> Create(Filter filter, NpgsqlConnection connection)
    {
        try
        {
            await using var command = new NpgsqlCommand(InsertCommand, connection);
            
            command.Parameters.AddWithValue("filter", filter.Text!);
            command.Parameters.AddWithValue("last_used", filter.LastUsed);

            filter.Id = (int) (await command.ExecuteScalarAsync() ?? -1);
            
            filter = filter.Id == -1? null : filter;
        } 
        catch (Exception e)
        {
            filter = null;
            Console.WriteLine(e);
        }

        return await Task.FromResult(filter);
    }

    public async Task<Filter?> Update(Filter filter, NpgsqlConnection connection)
    {
        try
        {
            filter.LastUsed = DateTime.Now;
            
            await using var command = new NpgsqlCommand(UpdateCommand, connection);

            // Add parameters to prevent SQL injection
            command.Parameters.AddWithValue("@lastUsed", NpgsqlTypes.NpgsqlDbType.Timestamp, filter.LastUsed);
            command.Parameters.AddWithValue("@id", filter.Id);

            var rowsAffected = await command.ExecuteNonQueryAsync();
            
            filter = rowsAffected == 1 ? filter : null;
        } 
        catch (Exception e)
        {
            filter = null;
            Console.WriteLine(e);
        }

        return await Task.FromResult(filter);
    }

    public async Task<bool> Delete(int filterId, NpgsqlConnection connection)
    {
        var success = false;
        
        try
        {
            await using var command = new NpgsqlCommand(DeleteCommand, connection);

            // Add parameters to prevent SQL injection
            command.Parameters.AddWithValue("@id", filterId);

            var rowsAffected = await command.ExecuteNonQueryAsync();
            
            success = rowsAffected == 1;
        } 
        catch (Exception e)
        {
            Console.WriteLine(e);
        }

        return await Task.FromResult(success);
    }

    public async Task<IEnumerable<object>> GetAll(NpgsqlConnection connection, int? skip = null, int? limit = null, bool? textOnly = false)
    {
        IEnumerable<object> filters = [];
        
        SetTypeMap();
        
        try
        {
            var sql = GetAllCommand;

            if (textOnly.HasValue && textOnly.Value)
            {
                sql = "SELECT filter FROM Filters";
            }

            if (skip.HasValue && limit.HasValue)
            {
                sql += " OFFSET " + skip.Value;
                sql += " LIMIT" + limit.Value;
            }

            sql += " ORDER BY last_used DESC";
            
            if (textOnly.HasValue && textOnly.Value)
            {
                filters = await connection.QueryAsync<string>(sql);
            }
            else
            {
                filters = await connection.QueryAsync<Filter>(sql);
            }
        } 
        catch (Exception e)
        {
            Console.WriteLine(e);
        }

        return await Task.FromResult(filters);
    }

    public async Task<int> GetFilterIdByExpression(string filterText, NpgsqlConnection connection)
    {
        var filterId = -1;
        
        try
        {
            var query = connection.QueryBuilder($"SELECT * FROM Filters WHERE filter = '{filterText}'").Build();
            
            var filter = await query.QuerySingleOrDefaultAsync<Filter>();

            filterId = filter?.Id ?? -1;
        } 
        catch (Exception e)
        {
            Console.WriteLine(e);
        }

        return await Task.FromResult(filterId);
    }
}