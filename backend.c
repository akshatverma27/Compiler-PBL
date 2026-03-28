#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define MAX 100

/* TAC STRUCTURE */
typedef struct {
    char result[20];
    char arg1[20];
    char op[10];
    char arg2[20];
} TAC;

TAC tac[MAX];
int tacIndex = 0;

/* LOAD TAC FROM MEMBER 3 (manually or shared) */
void addTAC(char *res, char *arg1, char *op, char *arg2) {
    strcpy(tac[tacIndex].result, res);
    strcpy(tac[tacIndex].arg1, arg1);
    strcpy(tac[tacIndex].op, op);
    strcpy(tac[tacIndex].arg2, arg2);
    tacIndex++;
}

/* 🔷 CONSTANT FOLDING */
int isNumber(char *str) {
    for(int i=0; str[i]; i++) {
        if(str[i] < '0' || str[i] > '9') return 0;
    }
    return 1;
}

void constantFolding() {
    for(int i=0; i<tacIndex; i++) {
        if(isNumber(tac[i].arg1) && isNumber(tac[i].arg2)) {

            int a = atoi(tac[i].arg1);
            int b = atoi(tac[i].arg2);
            int res;

            if(strcmp(tac[i].op, "+")==0) res = a + b;
            else if(strcmp(tac[i].op, "-")==0) res = a - b;
            else if(strcmp(tac[i].op, "*")==0) res = a * b;
            else if(strcmp(tac[i].op, "/")==0) res = a / b;
            else continue;

            sprintf(tac[i].arg1, "%d", res);
            strcpy(tac[i].op, "");
            strcpy(tac[i].arg2, "");
        }
    }
}

/* 🔷 DEAD CODE ELIMINATION (simple) */
void deadCodeElimination() {
    for(int i=0; i<tacIndex-1; i++) {
        int used = 0;

        for(int j=i+1; j<tacIndex; j++) {
            if(strcmp(tac[i].result, tac[j].arg1)==0 ||
               strcmp(tac[i].result, tac[j].arg2)==0) {
                used = 1;
                break;
            }
        }

        if(!used) {
            strcpy(tac[i].result, "REMOVED");
        }
    }
}

/* 🔷 PRINT OPTIMIZED TAC */
void printOptimizedTAC() {
    printf("\n--- Optimized TAC ---\n");
    for(int i=0; i<tacIndex; i++) {
        if(strcmp(tac[i].result, "REMOVED") != 0) {
            printf("%s = %s %s %s\n",
                tac[i].result,
                tac[i].arg1,
                tac[i].op,
                tac[i].arg2);
        }
    }
}

/* 🔷 TARGET CODE GENERATION */
void generateAssembly() {
    printf("\n--- Pseudo Assembly ---\n");

    for(int i=0; i<tacIndex; i++) {

        if(strcmp(tac[i].result, "REMOVED")==0)
            continue;

        /* assignment */
        if(strcmp(tac[i].op, "")==0) {
            printf("MOV %s, %s\n", tac[i].result, tac[i].arg1);
        }

        /* addition */
        else if(strcmp(tac[i].op, "+")==0) {
            printf("LOAD R1, %s\n", tac[i].arg1);
            printf("ADD R1, %s\n", tac[i].arg2);
            printf("STORE %s, R1\n", tac[i].result);
        }

        /* subtraction */
        else if(strcmp(tac[i].op, "-")==0) {
            printf("LOAD R1, %s\n", tac[i].arg1);
            printf("SUB R1, %s\n", tac[i].arg2);
            printf("STORE %s, R1\n", tac[i].result);
        }

        /* multiplication */
        else if(strcmp(tac[i].op, "*")==0) {
            printf("LOAD R1, %s\n", tac[i].arg1);
            printf("MUL R1, %s\n", tac[i].arg2);
            printf("STORE %s, R1\n", tac[i].result);
        }

        /* relational */
        else if(strcmp(tac[i].op, "<")==0) {
            printf("LOAD R1, %s\n", tac[i].arg1);
            printf("CMP R1, %s\n", tac[i].arg2);
            printf("JL %s\n", tac[i].result);
        }
    }
}