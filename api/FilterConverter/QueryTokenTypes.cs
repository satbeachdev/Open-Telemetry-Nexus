using Superpower.Display;

namespace api.FilterConverter;

public enum QueryTokenTypes
{
    [Token(Category = "identifier")]
    Identifier,

    [Token(Category = "literal")]
    StringLiteral,

    [Token(Category = "literal")]
    NumberLiteral,

    [Token(Category = "operator")]
    Operator,

    [Token(Category = "keyword")]
    And    
}