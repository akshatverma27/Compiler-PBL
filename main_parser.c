#include <stdio.h>
#include "ast.h"

extern int yyparse();
extern int PRINT_MODE;
extern ASTNode* root;

int main() {
    PRINT_MODE = 0;   // disable lexer printing

    printf("Parsing Started...\n\n");

    int result = yyparse();

    printf("\nParsing Finished. Result: %d\n\n", result);

    if (root != NULL) {
        printf("--- Abstract Syntax Tree (AST) ---\n");
        printAST(root, 0);
    } else {
        printf("AST is NULL.\n");
    }

    return 0;
}