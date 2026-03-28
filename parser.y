%{
#include <stdio.h>
#include <stdlib.h>

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

%left PLUS MINUS
%left MUL DIV

%%

program:
    stmt_list
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
    INT ID SEMI
        { printf("Valid Declaration\n"); }
    | FLOAT ID SEMI
        { printf("Valid Declaration\n"); }
    | INT ID ASSIGN expr SEMI
        { printf("Valid Initialized Declaration\n"); }
    | FLOAT ID ASSIGN expr SEMI
        { printf("Valid Initialized Declaration\n"); }
    ;

assignment:
    ID ASSIGN expr SEMI
        { printf("Valid Assignment\n"); }
    ;

if_stmt:
    IF LPAREN condition RPAREN block
        { printf("Valid IF Statement\n"); }
    ;

block:
    LBRACE stmt_list RBRACE
    ;

condition:
    expr LT expr
    | expr GT expr
    | expr RELOP expr
    ;

expr:
    expr PLUS term
    | expr MINUS term
    | term
    ;

term:
    term MUL factor
    | term DIV factor
    | factor
    ;

factor:
    NUMBER
    | ID
    | LPAREN expr RPAREN
    ;

%%

void yyerror(const char *s) {
    printf("Syntax Error: %s\n", s);
}