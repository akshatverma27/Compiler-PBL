%{
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX 100

int BACKEND_MODE = 0;   // 🔥 0 = Member 3, 1 = Member 4

/* -------- SYMBOL TABLE -------- */

typedef struct {
    char name[50];
    char type[20];
} Symbol;

Symbol symTable[MAX];
int symCount = 0;

/* -------- TAC -------- */

typedef struct {
    char result[20];
    char arg1[20];
    char op[10];
    char arg2[20];
} TAC;

TAC tac[MAX];
int tacIndex = 0;
int tempCount = 0;

/* -------- FUNCTIONS -------- */

int lookup(char *name) {
    for(int i=0;i<symCount;i++) {
        if(strcmp(symTable[i].name, name)==0)
            return i;
    }
    return -1;
}

void insert(char *name, char *type) {
    if(lookup(name) != -1) {
        printf("Semantic Error: Redeclaration of %s\n", name);
        return;
    }
    strcpy(symTable[symCount].name, name);
    strcpy(symTable[symCount].type, type);
    symCount++;
}

char* newTemp() {
    char *t = (char*)malloc(10);
    sprintf(t, "t%d", tempCount++);
    return t;
}

void addTAC(char *res, char *arg1, char *op, char *arg2) {
    strcpy(tac[tacIndex].result, res);
    strcpy(tac[tacIndex].arg1, arg1);
    strcpy(tac[tacIndex].op, op);
    strcpy(tac[tacIndex].arg2, arg2);
    tacIndex++;
}

/* -------- PRINT -------- */

void printSymbolTable() {
    printf("\n--- Symbol Table ---\n");
    for(int i=0;i<symCount;i++) {
        printf("%s : %s\n", symTable[i].name, symTable[i].type);
    }
}

void printTAC() {
    printf("\n--- Three Address Code ---\n");
    for(int i=0;i<tacIndex;i++) {
        printf("%s = %s %s %s\n",
            tac[i].result,
            tac[i].arg1,
            tac[i].op,
            tac[i].arg2);
    }
}

/* -------- OPTIMIZATION -------- */

int isNumber(char *s) {
    for(int i=0;s[i];i++)
        if(s[i]<'0' || s[i]>'9') return 0;
    return 1;
}

void constantFolding() {
    for(int i=0;i<tacIndex;i++) {
        if(isNumber(tac[i].arg1) && isNumber(tac[i].arg2)) {

            int a = atoi(tac[i].arg1);
            int b = atoi(tac[i].arg2);
            int res;

            if(strcmp(tac[i].op,"+")==0) res = a+b;
            else if(strcmp(tac[i].op,"-")==0) res = a-b;
            else if(strcmp(tac[i].op,"*")==0) res = a*b;
            else if(strcmp(tac[i].op,"/")==0) res = a/b;
            else continue;

            sprintf(tac[i].arg1,"%d",res);
            strcpy(tac[i].op,"");
            strcpy(tac[i].arg2,"");
        }
    }
}

void deadCodeElimination() {
    for(int i=0;i<tacIndex;i++) {
        int used = 0;
        for(int j=i+1;j<tacIndex;j++) {
            if(strcmp(tac[i].result,tac[j].arg1)==0 ||
               strcmp(tac[i].result,tac[j].arg2)==0) {
                used = 1;
                break;
            }
        }
        if(!used) {
            if(strcmp(tac[i].op,"")!=0) {
                strcpy(tac[i].result,"REMOVED");
            }
        }
    }
}

void printOptimizedTAC() {
    printf("\n--- Optimized TAC ---\n");
    for(int i=0;i<tacIndex;i++) {
        if(strcmp(tac[i].result,"REMOVED")!=0) {
            printf("%s = %s %s %s\n",
                tac[i].result,
                tac[i].arg1,
                tac[i].op,
                tac[i].arg2);
        }
    }
}

/* -------- CODE GENERATION -------- */

void generateAssembly() {
    printf("\n--- Pseudo Assembly ---\n");

    for(int i=0;i<tacIndex;i++) {

        if(strcmp(tac[i].result,"REMOVED")==0)
            continue;

        if(strcmp(tac[i].op,"")==0) {
            printf("MOV %s, %s\n", tac[i].result, tac[i].arg1);
        }

        else if(strcmp(tac[i].op,"+")==0) {
            printf("LOAD R1, %s\n", tac[i].arg1);
            printf("ADD R1, %s\n", tac[i].arg2);
            printf("STORE %s, R1\n", tac[i].result);
        }

        else if(strcmp(tac[i].op,"*")==0) {
            printf("LOAD R1, %s\n", tac[i].arg1);
            printf("MUL R1, %s\n", tac[i].arg2);
            printf("STORE %s, R1\n", tac[i].result);
        }

        else if(strcmp(tac[i].op,"<")==0) {
            printf("LOAD R1, %s\n", tac[i].arg1);
            printf("CMP R1, %s\n", tac[i].arg2);
            printf("JL %s\n", tac[i].result);
        }
    }
}

void yyerror(const char *s);
int yylex();
%}

%union {
    int num;
    char* str;
}

%token <str> ID
%token <num> NUMBER
%token INT FLOAT IF WHILE RETURN
%token PLUS MINUS MUL DIV ASSIGN
%token SEMI LPAREN RPAREN LBRACE RBRACE
%token LT GT RELOP

%type <str> expr term factor condition

%left PLUS MINUS
%left MUL DIV

%%

program:
    stmt_list {
        printSymbolTable();
        printTAC();

        if(BACKEND_MODE == 1) {
            constantFolding();
            deadCodeElimination();
            printOptimizedTAC();
            generateAssembly();
        }
    }
    ;

stmt_list:
    stmt_list stmt
    | /* empty */
    ;

stmt:
    declaration
    | assignment
    | if_stmt
    | SEMI
    ;

declaration:
    INT ID SEMI { insert($2,"int"); printf("Valid Declaration\n"); }
    | FLOAT ID SEMI { insert($2,"float"); printf("Valid Declaration\n"); }
    | INT ID ASSIGN expr SEMI { insert($2,"int"); printf("Valid Initialized Declaration\n"); }
    | FLOAT ID ASSIGN expr SEMI { insert($2,"float"); printf("Valid Initialized Declaration\n"); }
    ;

assignment:
    ID ASSIGN expr SEMI {
        if(lookup($1)==-1)
            printf("Semantic Error: %s not declared\n",$1);

        addTAC($1,$3,"","");
        printf("Valid Assignment\n");
    }
    ;

if_stmt:
    IF LPAREN condition RPAREN block { printf("Valid IF Statement\n"); }
    ;

block:
    LBRACE stmt_list RBRACE
    ;

condition:
    expr LT expr {
        char *t=newTemp();
        addTAC(t,$1,"<",$3);
        $$=t;
    }
    ;

expr:
    expr PLUS term {
        char *t=newTemp();
        addTAC(t,$1,"+",$3);
        $$=t;
    }
    | term { $$=$1; }
    ;

term:
    term MUL factor {
        char *t=newTemp();
        addTAC(t,$1,"*",$3);
        $$=t;
    }
    | factor { $$=$1; }
    ;

factor:
    NUMBER {
        char *t=newTemp();
        sprintf(t,"%d",$1);
        $$=t;
    }
    | ID {
        if(lookup($1)==-1)
            printf("Semantic Error: %s not declared\n",$1);
        $$=$1;
    }
    ;

%%

void yyerror(const char *s) {
    printf("Syntax Error: %s\n", s);
}