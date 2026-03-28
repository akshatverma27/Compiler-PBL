%{
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "parser.tab.h"

int line = 1;
int PRINT_MODE = 1;

char *keywords[] = {"int","float","if","while","return"};

int isKeyword(char *str) {
    for(int i=0;i<5;i++) {
        if(strcmp(str, keywords[i])==0)
            return 1;
    }
    return 0;
}
%}

%%

[ \t]+              ;

\r                  ;

\n                  { line++; }

"//".*              ;

"/*"                {
                        char c;
                        while((c = input()) != EOF) {
                            if(c == '*') {
                                if((c = input()) == '/') break;
                            }
                            if(c == '\n') line++;
                        }
                    }

[a-zA-Z_][a-zA-Z0-9_]* {
    if(isKeyword(yytext)) {

        if(PRINT_MODE) {
            printf("KEYWORD: %s (line %d)\n", yytext, line);
        } else {
            if(strcmp(yytext,"int")==0) return INT;
            if(strcmp(yytext,"float")==0) return FLOAT;
            if(strcmp(yytext,"if")==0) return IF;
            if(strcmp(yytext,"while")==0) return WHILE;
            if(strcmp(yytext,"return")==0) return RETURN;
        }
    }
    else {
        if(PRINT_MODE) {
            printf("IDENTIFIER: %s (line %d)\n", yytext, line);
        } else {
            yylval.str = strdup(yytext);
            return ID;
        }
    }
}

[0-9]+\.[0-9]+ {
    if(PRINT_MODE) {
        printf("FLOAT: %s (line %d)\n", yytext, line);
    } else {
        yylval.num = atof(yytext);
        return NUMBER;
    }
}

[0-9]+ {
    if(PRINT_MODE) {
        printf("INTEGER: %s (line %d)\n", yytext, line);
    } else {
        yylval.num = atoi(yytext);
        return NUMBER;
    }
}

"=="|"!="|"<="|">="|"<"|">" {
    if(PRINT_MODE) {
        printf("REL_OP: %s (line %d)\n", yytext, line);
    } else {
        if(strcmp(yytext,"<")==0) return LT;
        if(strcmp(yytext,">")==0) return GT;
        return RELOP;
    }
}

"=" {
    if(PRINT_MODE) printf("ASSIGN: = (line %d)\n", line);
    else return ASSIGN;
}

"+" {
    if(PRINT_MODE) printf("OPERATOR: + (line %d)\n", line);
    else return PLUS;
}

"-" {
    if(PRINT_MODE) printf("OPERATOR: - (line %d)\n", line);
    else return MINUS;
}

"*" {
    if(PRINT_MODE) printf("OPERATOR: * (line %d)\n", line);
    else return MUL;
}

"/" {
    if(PRINT_MODE) printf("OPERATOR: / (line %d)\n", line);
    else return DIV;
}

";" {
    if(PRINT_MODE) printf("DELIMITER: ; (line %d)\n", line);
    else return SEMI;
}

"(" {
    if(PRINT_MODE) printf("DELIMITER: ( (line %d)\n", line);
    else return LPAREN;
}

")" {
    if(PRINT_MODE) printf("DELIMITER: ) (line %d)\n", line);
    else return RPAREN;
}

"{" {
    if(PRINT_MODE) printf("DELIMITER: { (line %d)\n", line);
    else return LBRACE;
}

"}" {
    if(PRINT_MODE) printf("DELIMITER: } (line %d)\n", line);
    else return RBRACE;
}

. {
    if(yytext[0] != '\n' && yytext[0] != '\t' && yytext[0] != ' ' && yytext[0] != '\r') {
        printf("LEXICAL ERROR: %s at line %d\n", yytext, line);
    }
}

%%

int yywrap() {
    return 1;
}