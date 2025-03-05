using Superpower;
using Superpower.Model;
using Superpower.Parsers;

namespace Manta.Api.FilterConverter;

public static class QueryParser
{
    public static string Parse(TokenList<QueryToken> tokens, IDictionary<string, string> jsonFieldNames)
    {
        var conditions = new List<QueryCondition>();

        var it = tokens.GetEnumerator();

        while (it.MoveNext())
        {
            if (IsOperation(it.Current))
            {
                var op = new QueryCondition() { Operator = it.Current.ToStringValue() };

                conditions.Add(op);

                continue;
            }

            var qc = new QueryCondition
            {
                Field = it.Current.ToStringValue(),
            };

            it.MoveNext();

            qc.Operator = it.Current.ToStringValue();

            it.MoveNext();

            qc.Value = GetValue(it.Current);

            qc.IsJsonField = jsonFieldNames.ContainsKey(qc.Field);

            conditions.Add(qc);
        }

        return GenerateSql(conditions);
    }

    private static bool IsOperation(Token<QueryToken> token)
    {
        return token.Kind == QueryToken.Or || token.Kind == QueryToken.And || token.Kind == QueryToken.OpenParen || token.Kind == QueryToken.CloseParen;
    }

    private static object GetValue(Token<QueryToken> token)
    {
        var rawValue = token.ToStringValue();

        // Try to parse as number
        return token.Kind == QueryToken.Number && double.TryParse(rawValue, out double numValue) ? numValue : rawValue;
    }

    /// <summary>
    /// Generate Postgres SQL query from parsed conditions
    /// </summary>
    private static string GenerateSql(List<QueryCondition> conditions)
    {
        var whereClauses = new List<string>();

        foreach (var condition in conditions)
        {
            string whereClause;

            if (condition.IsJsonField)
            {
                // Split JSON field
                var parts = condition.Field.Split('.');
                var jsonKey = parts.Last();

                var value = IsLikeOperation(condition.Operator) ? $"%{condition.Value}%" : condition.Value;
                // Numeric vs text handling
                whereClause = condition.Value is double 
                    ? $"(e.attributes->'{jsonKey}')::numeric {GetOperator(condition.Operator)} {condition.Value}" 
                    : $"(e.attributes->>'{condition.Field}') {GetOperator(condition.Operator)} '{value}'";
            }
            else
            {
                if (string.IsNullOrEmpty(condition.Field) && condition.Value == null)
                {
                    whereClause = condition.Operator;
                }
                else
                {
                    // Direct column query
                    whereClause = condition.Value is double
                        ? $"e.{condition.Field} {GetOperator(condition.Operator)} {condition.Value}"
                        : $"e.{condition.Field} {GetOperator(condition.Operator)} '{condition.Value}'";
                }
            }

            whereClauses.Add(whereClause);
        }

        return string.Join(" ", whereClauses).Replace("( ", "(").Replace(" )", ")");
    }

    /// <summary>
    /// Translate operators and validate
    /// </summary>
    private static string GetOperator(string op)
    {
        return op.ToLower() switch
        {
            "contains" => "LIKE",
            "like" => "LIKE",
            "~" => "LIKE",
            _ => op
        };
    }
    
    private static bool IsLikeOperation(string op)
    {
        return op.ToLower() switch
        {
            "contains" => true,
            "like" => true,
            "~" => true,
            _ => false
        };
    }
}