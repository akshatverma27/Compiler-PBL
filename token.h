#ifndef TOKEN_H
#define TOKEN_H

typedef enum {
    KEYWORD,
    IDENTIFIER,
    INTEGER_LITERAL,
    FLOAT_LITERAL,
    OPERATOR,
    DELIMITER,
    RELATIONAL_OPERATOR,
    ASSIGNMENT_OPERATOR,
    LOGICAL_OPERATOR,
    UNKNOWN_ERROR,
    END_OF_FILE
} TokenType;

typedef struct {
    char lexeme[100];
    TokenType tokenType;
    int lineNumber;
    int columnNumber;
} Token;

// Integration Interface with Parser
Token getNextToken();

#endif