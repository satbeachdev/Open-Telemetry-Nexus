using Superpower;
using Superpower.Model;

namespace api.FilterConverter;

public static class QueryConverter
{
    public static string ToPostgresSql(string input, Dictionary<string, string> keyValueFields)
    {
        var tokenizer = QueryTokenizer.CreateTokenizer();
        var tokens = tokenizer.Tokenize(input);

        var parsedQuery = QueryParser.Expression(keyValueFields).Parse(tokens);

        return $"SELECT A.* FROM events AS A{Environment.NewLine}{parsedQuery};";
    }
}
