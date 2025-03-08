using Superpower;
using Superpower.Model;

namespace Manta.Api.FilterConverter;

public static class QueryConverter
{
    public static string ToPostgresSql(string input, Dictionary<string, string> keyValueFields)
    {
        var tokenizer = QueryTokenizer.CreateTokenizer();
        var tokens = tokenizer.Tokenize(input);

        var parsedQuery = QueryParser.Parse(tokens, keyValueFields);

        Console.WriteLine($"Parsed query = {parsedQuery}");
        
        return $"SELECT e.* FROM events e WHERE {parsedQuery} ORDER BY start_timestamp DESC ;";
    }
}
