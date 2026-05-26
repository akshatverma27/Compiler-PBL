#ifndef AST_H
#define AST_H

typedef struct ASTNode {
    char nodeType[20];
    char value[50];
    char semanticType[20]; // Added for Semantic Analysis
    struct ASTNode *left;
    struct ASTNode *right;
} ASTNode;

ASTNode* createNode(char* type, ASTNode* left, ASTNode* right);
ASTNode* createLeaf(char* type, char* value);
void printAST(ASTNode* node, int level);

#endif
