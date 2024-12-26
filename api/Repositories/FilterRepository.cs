using api.Models;
using Dapper;
using Npgsql;

namespace api.Repositories;

public class FilterRepository : IFilterRepository
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

    public async Task<IEnumerable<Filter>> GetAll(NpgsqlConnection connection)
    {
        IEnumerable<Filter> filters = [];
        
        try
        {
            filters = await connection.QueryAsync<Filter>(GetAllCommand);
        } 
        catch (Exception e)
        {
            Console.WriteLine(e);
        }

        return await Task.FromResult(filters);
    }

    public async Task<int> GetFilterIdByExpression(string filter, NpgsqlConnection connection)
    {
        var filterId = -1;
        
        try
        {
            var filters = await connection.QueryAsync<Filter>($"SELECT * FROM Filters WHERE filter = '{filter}'");

            filterId = filters?.SingleOrDefault()?.Id ?? -1;
        } 
        catch (Exception e)
        {
            Console.WriteLine(e);
        }

        return await Task.FromResult(filterId);
    }
}