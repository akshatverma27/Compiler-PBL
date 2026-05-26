#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "tac.h"

TAC* tacHead = NULL;
TAC* tacTail = NULL;
int tempCounter = 1;
int labelCounter = 1;

void addTAC(char* result, char* arg1, char* op, char* arg2) {
    TAC* newTAC = (TAC*)malloc(sizeof(TAC));
    strcpy(newTAC->result, result);
    strcpy(newTAC->arg1, arg1);
    strcpy(newTAC->op, op);
    strcpy(newTAC->arg2, arg2);
    newTAC->next = NULL;

    if (tacHead == NULL) {
        tacHead = tacTail = newTAC;
    } else {
        tacTail->next = newTAC;
        tacTail = newTAC;
    }
}

void generateTemp(char* buffer) {
    sprintf(buffer, "t%d", tempCounter++);
}

void generateLabel(char* buffer) {
    sprintf(buffer, "L%d", labelCounter++);
}

char* traverseTAC(ASTNode* node) {
    if (node == NULL) return "";

    if (strcmp(node->nodeType, "ID") == 0 || strcmp(node->nodeType, "NUMBER") == 0) {
        return node->value;
    }

    if (strcmp(node->nodeType, "+") == 0 || strcmp(node->nodeType, "-") == 0 ||
        strcmp(node->nodeType, "*") == 0 || strcmp(node->nodeType, "/") == 0) {
        
        char* leftRes = traverseTAC(node->left);
        char* rightRes = traverseTAC(node->right);
        
        char* temp = (char*)malloc(10);
        generateTemp(temp);
        addTAC(temp, leftRes, node->nodeType, rightRes);
        return temp;
    }

    if (strcmp(node->nodeType, "=") == 0) {
        char* leftRes = traverseTAC(node->left);
        char* rightRes = traverseTAC(node->right);
        addTAC(leftRes, rightRes, "", "");
        return leftRes;
    }
    
    if (strncmp(node->nodeType, "DeclAssign:", 11) == 0) {
        char* leftRes = traverseTAC(node->left);
        char* rightRes = traverseTAC(node->right);
        addTAC(leftRes, rightRes, "", "");
        return leftRes;
    }

    if (strcmp(node->nodeType, "<") == 0 || strcmp(node->nodeType, ">") == 0 || strcmp(node->nodeType, "RELOP") == 0) {
        char* leftRes = traverseTAC(node->left);
        char* rightRes = traverseTAC(node->right);
        char* temp = (char*)malloc(10);
        generateTemp(temp);
        addTAC(temp, leftRes, node->nodeType, rightRes);
        return temp; // returns tX which contains boolean result
    }

    if (strcmp(node->nodeType, "IF") == 0) {
        char* condRes = traverseTAC(node->left);
        
        char L1[10], L2[10];
        generateLabel(L1);
        generateLabel(L2);
        
        // if cond goto L1
        char gotoL1[20];
        sprintf(gotoL1, "goto %s", L1);
        addTAC(gotoL1, "if", condRes, "");
        
        // goto L2
        char gotoL2[20];
        sprintf(gotoL2, "goto %s", L2);
        addTAC(gotoL2, "", "", "");
        
        // L1:
        char labelL1[20];
        sprintf(labelL1, "%s:", L1);
        addTAC(labelL1, "", "", "");
        
        traverseTAC(node->right); // true block
        
        // L2:
        char labelL2[20];
        sprintf(labelL2, "%s:", L2);
        addTAC(labelL2, "", "", "");
        return "";
    }

    if (strcmp(node->nodeType, "WHILE") == 0) {
        char L1[10], L2[10], L3[10];
        generateLabel(L1);
        generateLabel(L2);
        generateLabel(L3);
        
        // L1:
        char labelL1[20];
        sprintf(labelL1, "%s:", L1);
        addTAC(labelL1, "", "", "");
        
        char* condRes = traverseTAC(node->left);
        
        // if cond goto L2
        char gotoL2[20];
        sprintf(gotoL2, "goto %s", L2);
        addTAC(gotoL2, "if", condRes, "");
        
        // goto L3
        char gotoL3[20];
        sprintf(gotoL3, "goto %s", L3);
        addTAC(gotoL3, "", "", "");
        
        // L2:
        char labelL2[20];
        sprintf(labelL2, "%s:", L2);
        addTAC(labelL2, "", "", "");
        
        traverseTAC(node->right); // loop body
        
        // goto L1
        char loopGotoL1[20];
        sprintf(loopGotoL1, "goto %s", L1);
        addTAC(loopGotoL1, "", "", "");
        
        // L3:
        char labelL3[20];
        sprintf(labelL3, "%s:", L3);
        addTAC(labelL3, "", "", "");
        
        return "";
    }

    // Default traversal
    traverseTAC(node->left);
    traverseTAC(node->right);
    return "";
}

void generateTAC(ASTNode* node) {
    traverseTAC(node);
}

void printTAC() {
    printf("\n--- Three Address Code (TAC) ---\n");
    TAC* curr = tacHead;
    while(curr != NULL) {
        if (strlen(curr->op) == 0 && strlen(curr->arg2) == 0 && strlen(curr->arg1) == 0) {
            printf("%s\n", curr->result); // Just a label
        } 
        else if (strcmp(curr->op, "if") == 0) {
            printf("if %s %s\n", curr->arg1, curr->result); // if t1 goto L1
        }
        else if (strlen(curr->op) == 0 && strlen(curr->arg2) == 0) {
            printf("%s = %s\n", curr->result, curr->arg1); // a = b
        } 
        else if (strncmp(curr->result, "goto", 4) == 0) {
            printf("%s\n", curr->result); // goto L2
        }
        else {
            printf("%s = %s %s %s\n", curr->result, curr->arg1, curr->op, curr->arg2); // t1 = a + b
        }
        curr = curr->next;
    }
    printf("--------------------------------\n");
}
