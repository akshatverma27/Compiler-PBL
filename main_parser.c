#include <stdio.h>

extern int yyparse();
extern int PRINT_MODE;

int main() {

    PRINT_MODE = 0;   // disable lexer printing

    printf("Parsing Started...\n\n");

    yyparse();

    printf("\nParsing Finished\n");

    return 0;
}