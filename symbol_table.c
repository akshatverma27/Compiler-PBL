#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "symbol_table.h"

#define HASH_SIZE 100

Symbol* hashTable[HASH_SIZE];
int currentScope = 0;
int nextMemoryLocation = 0;

unsigned long hashSymbol(char *str) {
    unsigned long hash = 5381;
    int c;
    while ((c = *str++))
        hash = ((hash << 5) + hash) + c; 
    return hash % HASH_SIZE;
}

void initSymbolTable() {
    for(int i = 0; i < HASH_SIZE; i++) {
        hashTable[i] = NULL;
    }
    currentScope = 0;
    nextMemoryLocation = 0;
}

void enterScope() {
    currentScope++;
}

void exitScope() {
    for(int i = 0; i < HASH_SIZE; i++) {
        Symbol* curr = hashTable[i];
        Symbol* prev = NULL;
        while(curr != NULL) {
            if(curr->scopeLevel == currentScope) {
                if(prev == NULL) {
                    hashTable[i] = curr->next;
                    free(curr);
                    curr = hashTable[i];
                } else {
                    prev->next = curr->next;
                    free(curr);
                    curr = prev->next;
                }
            } else {
                prev = curr;
                curr = curr->next;
            }
        }
    }
    currentScope--;
}

int insertSymbol(char* name, char* type) {
    unsigned long h = hashSymbol(name);
    
    // Check redeclaration in current scope
    Symbol* curr = hashTable[h];
    while(curr != NULL) {
        if(strcmp(curr->name, name) == 0 && curr->scopeLevel == currentScope) {
            return 0; // Redeclaration error
        }
        curr = curr->next;
    }

    Symbol* newSymbol = (Symbol*)malloc(sizeof(Symbol));
    strcpy(newSymbol->name, name);
    strcpy(newSymbol->type, type);
    newSymbol->scopeLevel = currentScope;
    newSymbol->memoryLocation = nextMemoryLocation++;
    newSymbol->next = hashTable[h];
    hashTable[h] = newSymbol;
    return 1; // Success
}

Symbol* lookupSymbol(char* name) {
    unsigned long h = hashSymbol(name);
    Symbol* curr = hashTable[h];
    Symbol* bestMatch = NULL;
    
    while(curr != NULL) {
        if(strcmp(curr->name, name) == 0) {
            if(bestMatch == NULL || curr->scopeLevel > bestMatch->scopeLevel) {
                bestMatch = curr; // Return the most deeply nested variable
            }
        }
        curr = curr->next;
    }
    return bestMatch;
}

void printSymbolTable() {
    printf("--- Symbol Table ---\n");
    for(int i = 0; i < HASH_SIZE; i++) {
        Symbol* curr = hashTable[i];
        while(curr != NULL) {
            printf("Name: %s | Type: %s | Scope: %d | Mem: %d\n", 
                curr->name, curr->type, curr->scopeLevel, curr->memoryLocation);
            curr = curr->next;
        }
    }
    printf("--------------------\n");
}
