%{
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "parser.tab.h"

int line = 1;
int PRINT_MODE = 0;

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
                        int c;
                        while((c = input()) != EOF) {
                            if(c == '*') {
                                if((c = input()) == '/') break;
                            }
                            if(c == '\n') line++;
                        }
                    }

[a-zA-Z_][a-zA-Z0-9_]* {
    if(isKeyword(yytext)) {
        if(strcmp(yytext,"int")==0) return INT;
        if(strcmp(yytext,"float")==0) return FLOAT;
        if(strcmp(yytext,"if")==0) return IF;
        if(strcmp(yytext,"while")==0) return WHILE;
        if(strcmp(yytext,"return")==0) return RETURN;
    }
    else {
        yylval.str = strdup(yytext);
        return ID;
    }
}

[0-9]+\.[0-9]+ {
    yylval.num = atof(yytext);
    return NUMBER;
}

[0-9]+ {
    yylval.num = atoi(yytext);
    return NUMBER;
}

"=="|"!="|"<="|">="|"<"|">" {
    if(strcmp(yytext,"<")==0) return LT;
    if(strcmp(yytext,">")==0) return GT;
    return RELOP;
}

"=" { return ASSIGN; }
"+" { return PLUS; }
"-" { return MINUS; }
"*" { return MUL; }
"/" { return DIV; }
";" { return SEMI; }
"(" { return LPAREN; }
")" { return RPAREN; }
"{" { return LBRACE; }
"}" { return RBRACE; }

. {
    if(yytext[0] != '\n' && yytext[0] != '\t' && yytext[0] != ' ' && yytext[0] != '\r') {
        printf("LEXICAL ERROR: %s at line %d\n", yytext, line);
    }
}

%%

int yywrap() {
    return 1;
}