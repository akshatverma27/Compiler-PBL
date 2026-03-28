#ifndef TOKEN_H
#define TOKEN_H

typedef enum {
    KEYWORD,
    IDENTIFIER,
    INTEGER,
    FLOAT,
    OPERATOR,
    DELIMITER,
    RELATIONAL,
    ASSIGN,
    UNKNOWN
} TokenType;

typedef struct {
    char lexeme[100];
    TokenType type;
    int line;
} Token;

#endif