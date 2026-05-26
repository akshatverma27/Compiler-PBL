#ifndef SYMBOL_TABLE_H
#define SYMBOL_TABLE_H

typedef struct Symbol {
    char name[50];
    char type[20];
    int scopeLevel;
    int memoryLocation;
    struct Symbol* next; // for handling hash collisions and scope lists
} Symbol;

void initSymbolTable();
void enterScope();
void exitScope();
int insertSymbol(char* name, char* type);
Symbol* lookupSymbol(char* name);
void printSymbolTable();

#endif
