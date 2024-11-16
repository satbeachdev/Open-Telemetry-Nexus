using Superpower;
using Superpower.Parsers;
// ReSharper disable InconsistentNaming

namespace api.FilterConverter;

public static class QueryParser
{
    // Top-level expression that separates JOIN and WHERE conditions
    public static TokenListParser<QueryToken, string> Expression(Dictionary<string, string> keyValueFields) => JoinAndWhereExpression(keyValueFields);
    
    private static readonly TokenListParser<QueryToken, string> Identifier = Token.EqualTo(QueryToken.Identifier).Select(x => x.ToStringValue());

    private static readonly TokenListParser<QueryToken, string> StringLiteral = Token.EqualTo(QueryToken.String).Select(x => x.ToStringValue());

    private static readonly TokenListParser<QueryToken, int> Number = Token.EqualTo(QueryToken.Number).Select(x => int.Parse(x.ToStringValue()));

    private static readonly TokenListParser<QueryToken, DateTime> DateLiteral = Token.EqualTo(QueryToken.Date).Select(x => DateTime.Parse(x.ToStringValue()));

    private static readonly TokenListParser<QueryToken, string> Condition =
        Identifier
            .Then(id =>
                Token.EqualTo(QueryToken.Equal).Value(" = ")
                    .Or(Token.EqualTo(QueryToken.NotEqual).Value(" != "))
                    .Or(Token.EqualTo(QueryToken.GreaterThan).Value(" > "))
                    .Or(Token.EqualTo(QueryToken.GreaterThanOrEqual).Value(" >= "))
                    .Or(Token.EqualTo(QueryToken.LessThan).Value(" < "))
                    .Or(Token.EqualTo(QueryToken.LessThanOrEqual).Value(" <= "))
                    .Or(Token.EqualTo(QueryToken.Like).Value(" LIKE "))
                    .Then(op => 
                        StringLiteral
                            .Or(Number.Select(n => n.ToString()))
                            .Or(DateLiteral.Select(d => $"'{d:yyyy-MM-dd}'")) // Format the date for SQL
                            .Select(value => $"{id}{op}{value}")
                    )
            );

    private static readonly TokenListParser<QueryToken, string> GroupExpression =
        from lparen in Token.EqualTo(QueryToken.OpenParen) // (
        from expr in Parse.Ref(() => OrExpression)      // Parse an expression inside parentheses
        from rparen in Token.EqualTo(QueryToken.CloseParen) // )
        select $"({expr})";                             // Return the grouped expression

    private static readonly TokenListParser<QueryToken, string> AndExpression =
        from first in Condition.Or(GroupExpression)     // Support grouped expressions
        from rest in 
            (from _ in Token.EqualTo(QueryToken.And)
                from next in Condition.Or(GroupExpression) // Support grouped expressions
                select next).Many()
        select rest.Aggregate(first, (acc, next) => $"{acc} AND {next}");

    private static readonly TokenListParser<QueryToken, string> OrExpression =
        from first in AndExpression
        from rest in
            (from _ in Token.EqualTo(QueryToken.Or)
                from next in AndExpression
                select next).Many()
        select rest.Aggregate(first, (acc, next) => $"{acc} OR {next}");

    // Generate condition for either JOIN or WHERE with dynamic aliasing
    private static (string JoinCondition, string WhereCondition) GenerateConditionForJoinOrWhere(string field, string op, string value, Dictionary<string, string> keyValueFields, int aliasIndex)
    {
        if (keyValueFields.ContainsKey(field))
        {
            // Key-value field should be handled in the JOIN clause with a unique alias
            string alias = $"B{aliasIndex}";  // Dynamically generate alias (B1, B2, etc.)
            return ($"{alias}.name = '{field}' AND {alias}.value {op} {value}", null);
        }
        else
        {
            // Regular field handled in the WHERE clause for TableA
            return (null, $"A.{field} {op} {value}");
        }
    }

    // Parser for conditions, returning a tuple (JoinCondition, WhereCondition)
    private static TokenListParser<QueryToken, (string JoinCondition, string WhereCondition)> ConditionForJoinOrWhere(
        Dictionary<string, string> keyValueFields, int aliasIndex) =>
        from field in Token.EqualTo(QueryToken.Identifier).Select(t => t.ToStringValue())
        from op in Token.EqualTo(QueryToken.Equal).Value(" = ")
                  .Or(Token.EqualTo(QueryToken.NotEqual).Value(" != "))
                  .Or(Token.EqualTo(QueryToken.GreaterThan).Value(" > "))
                  .Or(Token.EqualTo(QueryToken.GreaterThanOrEqual).Value(" >= "))
                  .Or(Token.EqualTo(QueryToken.LessThan).Value(" < "))
                  .Or(Token.EqualTo(QueryToken.LessThanOrEqual).Value(" <= "))
                  .Or(Token.EqualTo(QueryToken.Like).Value(" LIKE "))
        from value in Token.EqualTo(QueryToken.String).Select(t => t.ToStringValue())
                     .Or(Token.EqualTo(QueryToken.Number).Select(t => t.ToStringValue()))
                     .Or(Token.EqualTo(QueryToken.Date).Select(d => d.ToStringValue()))
        select GenerateConditionForJoinOrWhere(field, op, value, keyValueFields, aliasIndex);

    // Parse conditions and separate them into JOIN and WHERE clauses
    private static TokenListParser<QueryToken, string> JoinAndWhereExpression(Dictionary<string, string> keyValueFields)
    {
        return from conditions in ConditionForJoinOrWhere(keyValueFields, 1).AtLeastOnceDelimitedBy(Token.EqualTo(QueryToken.And))
               let joinConditions = conditions.Where(c => c.JoinCondition != null).Select(c => c.JoinCondition).ToList()
               let whereConditions = conditions.Where(c => c.WhereCondition != null).Select(c => c.WhereCondition).ToList()
               // Generate separate JOINs with dynamic aliases (B1, B2, etc.)
               let joinClause = string.Join(Environment.NewLine, joinConditions.Select((c, index) => $"INNER JOIN eventattributes B{index + 1} ON A.id = B{index + 1}.eventid AND {c}"))
               let whereClause = whereConditions.Any() ? $"WHERE {string.Join(" AND ", whereConditions)}" : ""
               select $"{joinClause}{Environment.NewLine}{whereClause}".Trim();
    }
}