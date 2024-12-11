using Superpower;
using Superpower.Model;
using Superpower.Parsers;
using Superpower.Tokenizers;

namespace api.FilterConverter
    ;

public enum QueryToken
{
    Identifier,
    Equal,
    NotEqual,
    GreaterThan,
    GreaterThanOrEqual,
    LessThan,
    LessThanOrEqual,
    Like,
    String,
    Number,
    Date,
    And,
    Or,
    OpenParen,
    CloseParen
}

public static class QueryTokenizer
{
    public static Tokenizer<QueryToken> CreateTokenizer()
    {
        return new TokenizerBuilder<QueryToken>()
            .Match(Span.EqualToIgnoreCase("AND"), QueryToken.And)
            .Match(Span.EqualToIgnoreCase("OR"), QueryToken.Or)
            .Match(Span.EqualTo("="), QueryToken.Equal)
            .Match(Span.EqualTo("!="), QueryToken.NotEqual)
            .Match(Span.EqualTo(">"), QueryToken.GreaterThan)
            .Match(Span.EqualTo(">="), QueryToken.GreaterThanOrEqual)
            .Match(Span.EqualTo("<"), QueryToken.LessThan)
            .Match(Span.EqualTo("<="), QueryToken.LessThanOrEqual)
            .Match(Span.EqualTo("~"), QueryToken.Like)
            .Match(Span.EqualTo("LIKE"), QueryToken.Like)
            .Match(Span.Regex(@"\d{4}-\d{2}-\d{2}"), QueryToken.Date)
            .Match(QuotedString.SqlStyle, QueryToken.String)
            .Match(Numerics.Integer, QueryToken.Number)
            .Match(Span.Regex("[a-zA-Z.]+"), QueryToken.Identifier)
            .Match(Character.EqualTo('('), QueryToken.OpenParen)
            .Match(Character.EqualTo(')'), QueryToken.CloseParen)
            .Ignore(Span.WhiteSpace)
            .Build();
    }
}
