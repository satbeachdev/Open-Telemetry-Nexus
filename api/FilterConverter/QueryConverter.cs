using Superpower;
using Superpower.Model;

namespace api.FilterConverter;

public static class QueryConverter
{
    public static string ToPostgresSql(string input, Dictionary<string, string> keyValueFields)
    {
        var tokenizer = QueryTokenizer.CreateTokenizer();
        var tokens = tokenizer.Tokenize(input);

        var parsedQuery = QueryParser.Parse(tokens, keyValueFields);

        return $"SELECT e.* FROM events e INNER JOIN eventattributes ea ON e.id = ea.eventid WHERE {parsedQuery};";
    }
}
