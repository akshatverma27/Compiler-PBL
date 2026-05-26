#ifndef TAC_H
#define TAC_H

#include "ast.h"

typedef struct TAC {
    char result[20];
    char arg1[20];
    char op[5];
    char arg2[20];
    struct TAC* next;
} TAC;

void generateTAC(ASTNode* node);
void printTAC();

#endif
