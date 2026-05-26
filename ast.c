#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "ast.h"

ASTNode* createNode(char* type, ASTNode* left, ASTNode* right) {
    ASTNode* node = (ASTNode*)malloc(sizeof(ASTNode));
    strcpy(node->nodeType, type);
    node->value[0] = '\0';
    node->semanticType[0] = '\0'; // Initialize
    node->left = left;
    node->right = right;
    return node;
}

ASTNode* createLeaf(char* type, char* value) {
    ASTNode* node = (ASTNode*)malloc(sizeof(ASTNode));
    strcpy(node->nodeType, type);
    if (value) {
        strncpy(node->value, value, 49);
        node->value[49] = '\0';
    } else {
        node->value[0] = '\0';
    }
    node->semanticType[0] = '\0'; // Initialize
    node->left = NULL;
    node->right = NULL;
    return node;
}

void printAST(ASTNode* node, int level) {
    if (node == NULL) return;

    for (int i = 0; i < level; i++) {
        printf("  ");
    }

    if (strlen(node->value) > 0) {
        printf("%s: %s\n", node->nodeType, node->value);
    } else {
        printf("%s\n", node->nodeType);
    }

    printAST(node->left, level + 1);
    printAST(node->right, level + 1);
}
