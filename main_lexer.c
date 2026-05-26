#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "token.h"

extern int yylex();
extern char* yytext;
extern int line;
extern int col;
extern FILE* yyin;
extern int PRINT_MODE;

// Token Queue Implementation (Linked List)
typedef struct TokenNode {
    Token t;
    struct TokenNode* next;
} TokenNode;

TokenNode* head = NULL;
TokenNode* tail = NULL;

void enqueue(Token t) {
    TokenNode* newNode = (TokenNode*)malloc(sizeof(TokenNode));
    newNode->t = t;
    newNode->next = NULL;
    if(head == NULL) {
        head = tail = newNode;
    } else {
        tail->next = newNode;
        tail = newNode;
    }
}

Token dequeue() {
    Token t;
    if(head == NULL) {
        t.tokenType = END_OF_FILE;
        return t;
    }
    TokenNode* temp = head;
    t = head->t;
    head = head->next;
    free(temp);
    return t;
}

// Hash-based lookup mechanism for keywords
// Simple djb2 hash algorithm
unsigned long hash(char *str) {
    unsigned long hash = 5381;
    int c;
    while ((c = *str++))
        hash = ((hash << 5) + hash) + c; /* hash * 33 + c */
    return hash;
}

const char* keyword_strings[] = {"int", "float", "if", "while", "return"};
int num_keywords = 5;

// Hash table size
#define HASH_SIZE 100
int keyword_hashes[HASH_SIZE] = {0};

void init_keyword_hash() {
    for (int i = 0; i < num_keywords; i++) {
        unsigned long h = hash((char*)keyword_strings[i]);
        keyword_hashes[h % HASH_SIZE] = 1; 
    }
}

int isKeywordHash(char *str) {
    unsigned long h = hash(str);
    // If bucket exists, we do a quick strcmp to avoid collision
    if (keyword_hashes[h % HASH_SIZE]) {
        for(int i = 0; i < num_keywords; i++) {
            if(strcmp(str, keyword_strings[i]) == 0) return 1;
        }
    }
    return 0;
}

// getNextToken API - Bridges Lexer and Parser, wraps flex return values
Token getNextToken() {
    Token t;
    
    int type = yylex();
    
    if (type == 0) { // Flex EOF is 0
        t.tokenType = END_OF_FILE;
        strcpy(t.lexeme, "EOF");
        t.lineNumber = line;
        t.columnNumber = col;
        return t;
    }
    
    t.tokenType = (TokenType)type;
    strncpy(t.lexeme, yytext, 99);
    t.lexeme[99] = '\0';
    t.lineNumber = line;
    // Calculate start column
    t.columnNumber = col - strlen(yytext);
    
    return t;
}

int main(int argc, char** argv) {
    PRINT_MODE = 0; // Turn off pure printing from lexer.l to use Token structure
    
    if (argc > 1) {
        yyin = fopen(argv[1], "r");
        if (!yyin) {
            printf("Error opening file %s\n", argv[1]);
            return 1;
        }
    }

    init_keyword_hash();

    printf("--- Lexical Analyzer Output ---\n");
    Token current;
    do {
        current = getNextToken();
        enqueue(current); // Store in queue for parser (Simulated)
        
        // Print it for demonstration
        if(current.tokenType != END_OF_FILE && current.tokenType != UNKNOWN_ERROR) {
            printf("Token: [Type=%d] [Lexeme='%s'] [Line=%d, Col=%d]\n", 
                current.tokenType, current.lexeme, current.lineNumber, current.columnNumber);
        }
    } while(current.tokenType != END_OF_FILE);

    return 0;
}