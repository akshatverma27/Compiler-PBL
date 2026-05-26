#include <stdio.h>
#include "ast.h"
#include "symbol_table.h"
#include "semantic.h"
#include "tac.h"
#include "backend.h"

extern int yyparse();
extern int PRINT_MODE;
extern ASTNode* root;
extern FILE* yyin;

int main(int argc, char** argv) {
    PRINT_MODE = 0;   // disable lexer printing

    if (argc > 1) {
        yyin = fopen(argv[1], "r");
        if (!yyin) {
            printf("Error opening file %s\n", argv[1]);
            return 1;
        }
    }

    printf("--- Phase 1 & 2: Lexical & Syntax Analysis ---\n");
    int result = yyparse();
    
    if (result == 0 && root != NULL) {
        printf("Parsing Finished Successfully.\n\n");
        printf("--- Abstract Syntax Tree (AST) ---\n");
        printAST(root, 0);
        printf("\n");
        
        printf("--- Phase 3: Semantic Analysis ---\n");
        initSymbolTable();
        int semanticResult = analyzeSemantics(root);
        printSymbolTable();
        
        if (semanticResult) {
            printf("\nSemantic Analysis Passed.\n\n");
            
            printf("--- Phase 4: Intermediate Code Generation ---\n");
            generateTAC(root);
            printTAC();
            
            printf("\n--- Phase 5: Backend Optimization & Code Generation ---\n");
            processBackend();
            printf("\nCompilation Pipeline Completed Successfully!\n");
        } else {
            printf("\nSemantic Analysis Failed. Halting compilation.\n");
        }
    } else {
        printf("Parsing Failed.\n");
    }

    return 0;
}
