#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "semantic.h"
#include "symbol_table.h"

int semanticErrors = 0;

void typeError(const char* msg) {
    printf("Semantic Error: %s\n", msg);
    semanticErrors++;
}

int analyzeSemantics(ASTNode* node) {
    if (node == NULL) return 1;

    // Traverse left and right first (post-order mostly for expressions)
    // But for blocks, we might need pre-order scope entry.
    
    if (strcmp(node->nodeType, "StmtList") == 0) {
        // Just traverse
        analyzeSemantics(node->left);
        analyzeSemantics(node->right);
        return semanticErrors == 0;
    }
    
    if (strcmp(node->nodeType, "EmptyStmt") == 0 || strcmp(node->nodeType, "ErrorStmt") == 0) {
        return semanticErrors == 0;
    }

    if (strncmp(node->nodeType, "Decl:", 5) == 0) {
        char type[20];
        strcpy(type, node->nodeType + 5); // "INT" or "FLOAT"
        
        ASTNode* idNode = node->left;
        if (idNode != NULL && strcmp(idNode->nodeType, "ID") == 0) {
            if (!insertSymbol(idNode->value, type)) {
                printf("Semantic Error: Redeclaration of '%s'\n", idNode->value);
                semanticErrors++;
            }
        }
        return semanticErrors == 0;
    }
    
    if (strncmp(node->nodeType, "DeclAssign:", 11) == 0) {
        char type[20];
        strcpy(type, node->nodeType + 11);
        
        ASTNode* idNode = node->left;
        ASTNode* exprNode = node->right;
        
        analyzeSemantics(exprNode);
        
        if (idNode != NULL && strcmp(idNode->nodeType, "ID") == 0) {
            if (!insertSymbol(idNode->value, type)) {
                printf("Semantic Error: Redeclaration of '%s'\n", idNode->value);
                semanticErrors++;
            }
            
            // Type checking
            if (strcmp(type, "INT") == 0 && strcmp(exprNode->semanticType, "FLOAT") == 0) {
                printf("Semantic Warning: Assignment of FLOAT to INT '%s' may lose precision\n", idNode->value);
            }
        }
        return semanticErrors == 0;
    }

    if (strcmp(node->nodeType, "=") == 0) {
        ASTNode* idNode = node->left;
        ASTNode* exprNode = node->right;
        
        analyzeSemantics(exprNode);
        
        if (idNode != NULL && strcmp(idNode->nodeType, "ID") == 0) {
            Symbol* sym = lookupSymbol(idNode->value);
            if (sym == NULL) {
                printf("Semantic Error: Undeclared variable '%s'\n", idNode->value);
                semanticErrors++;
            } else {
                strcpy(idNode->semanticType, sym->type);
                if (strcmp(sym->type, "INT") == 0 && strcmp(exprNode->semanticType, "FLOAT") == 0) {
                    printf("Semantic Warning: Assignment of FLOAT to INT '%s' may lose precision\n", idNode->value);
                }
            }
        }
        return semanticErrors == 0;
    }

    if (strcmp(node->nodeType, "ID") == 0) {
        Symbol* sym = lookupSymbol(node->value);
        if (sym == NULL) {
            printf("Semantic Error: Undeclared variable '%s'\n", node->value);
            strcpy(node->semanticType, "UNKNOWN");
            semanticErrors++;
        } else {
            strcpy(node->semanticType, sym->type);
        }
        return semanticErrors == 0;
    }

    if (strcmp(node->nodeType, "NUMBER") == 0) {
        // Simple heuristic: if it has a dot, it's float, else int.
        // The lexer currently returns NUMBER for both, but the AST value is a string.
        if (strchr(node->value, '.') != NULL) {
            strcpy(node->semanticType, "FLOAT");
        } else {
            strcpy(node->semanticType, "INT");
        }
        return semanticErrors == 0;
    }

    if (strcmp(node->nodeType, "+") == 0 || strcmp(node->nodeType, "-") == 0 || 
        strcmp(node->nodeType, "*") == 0 || strcmp(node->nodeType, "/") == 0) {
        analyzeSemantics(node->left);
        analyzeSemantics(node->right);
        
        if (strcmp(node->left->semanticType, "FLOAT") == 0 || strcmp(node->right->semanticType, "FLOAT") == 0) {
            strcpy(node->semanticType, "FLOAT");
        } else {
            strcpy(node->semanticType, "INT");
        }
        return semanticErrors == 0;
    }
    
    if (strcmp(node->nodeType, "IF") == 0 || strcmp(node->nodeType, "WHILE") == 0) {
        // Entering block scope
        enterScope();
        analyzeSemantics(node->left); // Condition
        analyzeSemantics(node->right); // Body
        exitScope();
        return semanticErrors == 0;
    }

    if (strcmp(node->nodeType, "<") == 0 || strcmp(node->nodeType, ">") == 0 || strcmp(node->nodeType, "RELOP") == 0) {
        analyzeSemantics(node->left);
        analyzeSemantics(node->right);
        strcpy(node->semanticType, "INT"); // Boolean expressions evaluate to INT
        return semanticErrors == 0;
    }

    // Default catch-all
    analyzeSemantics(node->left);
    analyzeSemantics(node->right);
    return semanticErrors == 0;
}
