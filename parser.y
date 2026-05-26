%{
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "ast.h"

void yyerror(const char *s);
int yylex();

ASTNode* root = NULL;
%}

%union {
    int num;
    char* str;
    struct ASTNode* node;
}

%token <str> ID
%token <num> NUMBER
%token INT FLOAT IF WHILE RETURN
%token PLUS MINUS MUL DIV ASSIGN
%token SEMI LPAREN RPAREN LBRACE RBRACE
%token LT GT RELOP

%type <node> program stmt_list stmt declaration assignment if_stmt while_stmt block condition expr term factor

%left PLUS MINUS
%left MUL DIV

%%

program:
    stmt_list
        { root = $1; $$ = $1; }
    ;

stmt_list:
    stmt_list stmt
        { $$ = createNode("StmtList", $1, $2); }
    | /* empty */
        { $$ = NULL; }
    ;

stmt:
    declaration
        { $$ = $1; }
    | assignment
        { $$ = $1; }
    | if_stmt
        { $$ = $1; }
    | while_stmt
        { $$ = $1; }
    | SEMI
        { $$ = createLeaf("EmptyStmt", NULL); }
    | error SEMI
        { 
            yyerrok; 
            $$ = createLeaf("ErrorStmt", "Recovered"); 
        }
    ;

declaration:
    INT ID SEMI
        { $$ = createNode("Decl:INT", createLeaf("ID", $2), NULL); free($2); }
    | FLOAT ID SEMI
        { $$ = createNode("Decl:FLOAT", createLeaf("ID", $2), NULL); free($2); }
    | INT ID ASSIGN expr SEMI
        { $$ = createNode("DeclAssign:INT", createLeaf("ID", $2), $4); free($2); }
    | FLOAT ID ASSIGN expr SEMI
        { $$ = createNode("DeclAssign:FLOAT", createLeaf("ID", $2), $4); free($2); }
    ;

assignment:
    ID ASSIGN expr SEMI
        { $$ = createNode("=", createLeaf("ID", $1), $3); free($1); }
    ;

if_stmt:
    IF LPAREN condition RPAREN block
        { $$ = createNode("IF", $3, $5); }
    ;

while_stmt:
    WHILE LPAREN condition RPAREN block
        { $$ = createNode("WHILE", $3, $5); }
    ;

block:
    LBRACE stmt_list RBRACE
        { $$ = $2; }
    ;

condition:
    expr LT expr
        { $$ = createNode("<", $1, $3); }
    | expr GT expr
        { $$ = createNode(">", $1, $3); }
    | expr RELOP expr
        { $$ = createNode("RELOP", $1, $3); }
    ;

expr:
    expr PLUS term
        { $$ = createNode("+", $1, $3); }
    | expr MINUS term
        { $$ = createNode("-", $1, $3); }
    | term
        { $$ = $1; }
    ;

term:
    term MUL factor
        { $$ = createNode("*", $1, $3); }
    | term DIV factor
        { $$ = createNode("/", $1, $3); }
    | factor
        { $$ = $1; }
    ;

factor:
    NUMBER
        { 
            char buffer[20];
            sprintf(buffer, "%d", $1);
            $$ = createLeaf("NUMBER", buffer); 
        }
    | ID
        { $$ = createLeaf("ID", $1); free($1); }
    | LPAREN expr RPAREN
        { $$ = $2; }
    ;

%%

void yyerror(const char *s) {
    printf("Syntax Error: %s\n", s);
}