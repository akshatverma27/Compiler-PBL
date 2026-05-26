#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include "backend.h"

extern TAC* tacHead;
BasicBlock* blockHead = NULL;
int blockCount = 0;

int isNumber(char* str) {
    if (strlen(str) == 0) return 0;
    for (int i = 0; str[i] != '\0'; i++) {
        if (!isdigit(str[i]) && str[i] != '.' && str[i] != '-') return 0;
    }
    return 1;
}

// ----------------------------------------------------
// 1. Basic Block Formation
// ----------------------------------------------------
void formBasicBlocks() {
    printf("--- Basic Block Formation ---\n");
    TAC* curr = tacHead;
    BasicBlock* currentBlock = NULL;
    
    int makeNewBlock = 1;
    
    while (curr != NULL) {
        // A label is a leader
        if (strlen(curr->op) == 0 && strlen(curr->arg1) == 0 && strchr(curr->result, ':') != NULL) {
            makeNewBlock = 1;
        }

        if (makeNewBlock) {
            BasicBlock* newBlock = (BasicBlock*)malloc(sizeof(BasicBlock));
            newBlock->blockId = ++blockCount;
            newBlock->start = curr;
            newBlock->end = curr;
            newBlock->next = NULL;
            
            if (blockHead == NULL) {
                blockHead = newBlock;
                currentBlock = newBlock;
            } else {
                currentBlock->next = newBlock;
                currentBlock = newBlock;
            }
            makeNewBlock = 0;
        } else {
            currentBlock->end = curr;
        }
        
        // Jumps end a block, making the next instruction a leader
        if (strncmp(curr->result, "goto", 4) == 0 || strcmp(curr->op, "if") == 0) {
            makeNewBlock = 1;
        }
        
        curr = curr->next;
    }
    
    BasicBlock* b = blockHead;
    while(b != NULL) {
        printf("Block %d established.\n", b->blockId);
        b = b->next;
    }
}

// ----------------------------------------------------
// 2. DAG Local Optimization (Constant Folding & Peephole)
// ----------------------------------------------------
void optimizeTAC() {
    printf("\n--- Local Optimizations (Constant Folding & Peephole) ---\n");
    TAC* curr = tacHead;
    
    while (curr != NULL) {
        // Constant Folding: If arg1 and arg2 are constants, compute at compile time
        if (strcmp(curr->op, "+") == 0 || strcmp(curr->op, "-") == 0 || 
            strcmp(curr->op, "*") == 0 || strcmp(curr->op, "/") == 0) {
            
            if (isNumber(curr->arg1) && isNumber(curr->arg2)) {
                int val1 = atoi(curr->arg1);
                int val2 = atoi(curr->arg2);
                int res = 0;
                
                if (strcmp(curr->op, "+") == 0) res = val1 + val2;
                if (strcmp(curr->op, "-") == 0) res = val1 - val2;
                if (strcmp(curr->op, "*") == 0) res = val1 * val2;
                if (strcmp(curr->op, "/") == 0 && val2 != 0) res = val1 / val2;
                
                // Rewrite TAC to assignment
                sprintf(curr->arg1, "%d", res);
                curr->op[0] = '\0';
                curr->arg2[0] = '\0';
                printf("Folded constants into %s = %s\n", curr->result, curr->arg1);
            }
        }
        
        // Peephole Optimization: Remove redundant adding of 0 (x = y + 0)
        if (strcmp(curr->op, "+") == 0) {
            if (strcmp(curr->arg2, "0") == 0) {
                // Change to x = y
                curr->op[0] = '\0';
                curr->arg2[0] = '\0';
                printf("Peephole: Removed redundant +0 for %s\n", curr->result);
            } else if (strcmp(curr->arg1, "0") == 0) {
                strcpy(curr->arg1, curr->arg2);
                curr->op[0] = '\0';
                curr->arg2[0] = '\0';
                printf("Peephole: Removed redundant 0+ for %s\n", curr->result);
            }
        }
        
        curr = curr->next;
    }
}

// ----------------------------------------------------
// 3. Target Code Generation (Pseudo Assembly)
// ----------------------------------------------------
void generateAssembly() {
    printf("\n--- Target Code Generation (Pseudo Assembly) ---\n");
    TAC* curr = tacHead;
    
    // Naive round robin register allocator
    int regCounter = 1;
    
    while (curr != NULL) {
        // Unconditional Jump
        if (strncmp(curr->result, "goto", 4) == 0 && strlen(curr->arg1) == 0) {
            printf("  JMP %s\n", curr->result + 5);
        }
        // Label
        else if (strlen(curr->op) == 0 && strlen(curr->arg2) == 0 && strlen(curr->arg1) == 0) {
            printf("%s\n", curr->result);
        }
        // Conditional Jump (if x < y goto L)
        else if (strcmp(curr->arg1, "if") == 0) {
            printf("  LOAD R%d, %s\n", regCounter, curr->op);
            printf("  CMP R%d, 1\n", regCounter);
            printf("  JEQ %s\n", curr->result + 5); // "+5" skips "goto "
        }
        // Assignment (x = y)
        else if (strlen(curr->op) == 0 && strlen(curr->arg2) == 0) {
            printf("  LOAD R%d, %s\n", regCounter, curr->arg1);
            printf("  STORE %s, R%d\n", curr->result, regCounter);
        }
        // Arithmetic/Relational
        else {
            printf("  LOAD R%d, %s\n", regCounter, curr->arg1);
            
            char asmOp[10];
            if (strcmp(curr->op, "+") == 0) strcpy(asmOp, "ADD");
            else if (strcmp(curr->op, "-") == 0) strcpy(asmOp, "SUB");
            else if (strcmp(curr->op, "*") == 0) strcpy(asmOp, "MUL");
            else if (strcmp(curr->op, "/") == 0) strcpy(asmOp, "DIV");
            else if (strcmp(curr->op, "<") == 0) strcpy(asmOp, "CMP_LT");
            else if (strcmp(curr->op, ">") == 0) strcpy(asmOp, "CMP_GT");
            else strcpy(asmOp, "OP");

            printf("  %s R%d, %s\n", asmOp, regCounter, curr->arg2);
            printf("  STORE %s, R%d\n", curr->result, regCounter);
        }
        
        regCounter++;
        if(regCounter > 3) regCounter = 1; // Only R1, R2, R3 available
        
        curr = curr->next;
    }
    printf("----------------------------------------------\n");
}

void processBackend() {
    if (tacHead == NULL) return;
    formBasicBlocks();
    optimizeTAC();
    generateAssembly();
}