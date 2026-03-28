#include <stdio.h>

extern int yyparse();
extern int PRINT_MODE;
extern int BACKEND_MODE;

int main() {

    PRINT_MODE = 0;      // disable lexer printing
    BACKEND_MODE = 1;    // change this for member demo

    printf("Parsing Started...\n\n");

    yyparse();

    printf("\nParsing Finished\n");

    return 0;
}