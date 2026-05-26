#ifndef BACKEND_H
#define BACKEND_H

#include "tac.h"

typedef struct BasicBlock {
    int blockId;
    TAC* start;
    TAC* end;
    struct BasicBlock* next;
} BasicBlock;

void processBackend();
void formBasicBlocks();
void optimizeTAC();
void generateAssembly();

#endif
