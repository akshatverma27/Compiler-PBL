# Mini-Compiler Construction Project

## Overview
This project represents a fully functional, end-to-end Mini-Compiler for a custom C-like programming language. Built entirely from scratch, it implements all five major phases of compiler design according to formal academic specifications. It correctly translates high-level source code down to pseudo-machine assembly instructions while enforcing grammatical and semantic correctness.

---

## 🛠 Project Breakdown (100% Completion)

### 1️⃣ Phase 1: Lexical Analysis (Front-End)
**Implemented By:** Team Member 1
- **File Management**: Dynamically opens and reads raw `.mc` source files.
- **Tokenization**: Uses `flex` to map strings of characters into recognized tokens (`INT`, `FLOAT`, `ID`, `NUMBER`, `IF`, `WHILE`).
- **Error Tracking**: Tracks exact lines and columns. Identifies **Unterminated Strings** and **Unterminated Comments** without crashing.
- **Performance**: High-speed hash-based keyword lookups (`O(1)` validation) instead of slow linear scans.

### 2️⃣ Phase 2: Syntax Analysis & AST (Parser)
**Implemented By:** Team Member 2
- **Grammar Engine**: Uses a `bison`-generated LALR(1) shift-reduce parser.
- **Ambiguity Resolution**: Handles left recursion and operator precedence (multiplication strictly processes before addition).
- **Error Recovery**: Automatically catches syntax errors, drops invalid tokens, and safely jumps to the next line (`yyerrok`) instead of halting the compiler.
- **AST Generation**: Dynamically constructs an Abstract Syntax Tree using recursive factory nodes, perfectly mapping the logical structure of the code.

### 3️⃣ Phase 3: Semantic Analysis & TAC
**Implemented By:** Team Member 3
- **Symbol Table**: Tracks declared variables (`a`, `b`) mapped to dynamic memory addresses.
- **Scope Management**: Accurately tracks variables declared inside nested `{}` blocks using stack-based counting.
- **Type Checking**: Validates operations natively by traversing the AST. Safely warns against `FLOAT` to `INT` precision loss and prevents undeclared variable usage.
- **Intermediate Code (TAC)**: Flattens the nested AST into Three Address Code. Safely generates temporary variables (`t1`, `t2`) and handles explicit conditional jumping (`goto L1`).

### 4️⃣ Phase 4 & 5: Backend Optimization & Assembly
**Implemented By:** Team Member 4
- **Basic Blocks**: Organizes linear TAC into structural "Basic Blocks" by mathematically identifying Leaders, mapping out a Control Flow Graph.
- **Local Optimization**: Reduces instruction sets at compile time:
  - *Constant Folding*: Computes raw math instantly (e.g., `5 + 3` becomes `8`).
  - *Peephole Optimization*: Eliminates useless instructions (e.g., stripping `+ 0` or dead assignments).
- **Pseudo-Assembly Generator**: Successfully links logic into physical processor commands. Handles generic register allocation (`R1`, `R2`, `R3`) and emits executable instructions (`LOAD`, `STORE`, `CMP_LT`, `JEQ`, `JMP`).

---

## 🚀 How to Compile and Run

To run the full compiler pipeline, you must have `flex`, `bison`, and `gcc` installed on your system.

**1. Generate the Parser and Lexer:**
```bash
bison -d parser.y
flex lexer.l
```

**2. Link and Compile the System:**
```bash
gcc main_compiler.c parser.tab.c lex.yy.c ast.c symbol_table.c semantic.c tac.c backend.c -o compiler
```

**3. Run on a Source File:**
```bash
./compiler test.mc
```