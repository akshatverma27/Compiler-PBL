#include <stdio.h>

extern int yylex();
extern int PRINT_MODE;

typedef union {
    int num;
    char* str;
} YYSTYPE;

YYSTYPE yylval;

int main() {
    PRINT_MODE = 1;

    printf("Lexical Analysis Output:\n\n");

    yylex();

    return 0;
}