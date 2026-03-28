🧾 🏆 MINI COMPILER PROJECT SUMMARY (TEAM-WISE)
👨‍💻 TEAM MEMBER 1
🔷 Role: Lexical Analyzer Engineer
🎯 Work
Converts source code → tokens
Handles:
Keywords, identifiers, numbers
Operators, delimiters
Comments & whitespace
Line tracking
Uses Flex (Lex tool)
📂 Files Used
lexer.l
main_lexer.c
test.mc
⚙️ Commands to Run
flex lexer.l
gcc lex.yy.c main_lexer.c -o lexer
./lexer < test.mc
✅ Output
KEYWORD: int
IDENTIFIER: a
ASSIGN: =
INTEGER: 5
...
🎤 What to Say

“I implemented lexical analysis using Flex to convert source code into tokens with line tracking and error handling.”

👨‍💻 TEAM MEMBER 2
🔷 Role: Syntax Analyzer (Parser Engineer)
🎯 Work
Validates syntax using CFG
Uses Bison (LALR parser)
Handles:
Declarations
Assignments
If statements
Expressions
Performs Shift-Reduce Parsing
📂 Files Used
parser.y
lexer.l
main_parser.c
test.mc
⚙️ Commands to Run
bison -d parser.y
flex lexer.l
gcc lex.yy.c parser.tab.c main_parser.c -o parser
./parser < test.mc
✅ Output
Valid Initialized Declaration
Valid Assignment
Valid IF Statement
🎤 What to Say

“I designed CFG and implemented an LALR parser using Bison to validate syntax and resolve precedence using shift-reduce parsing.”

👨‍💻 TEAM MEMBER 3
🔷 Role: Semantic Analyzer & TAC Generator
🎯 Work
Performs:
Symbol Table creation
Type checking
Undeclared variable detection
Generates:
Three Address Code (TAC)
📂 Files Used
parser_semantic.y
lexer.l
main.c
test.mc
⚙️ Commands to Run
bison -d parser_semantic.y
flex lexer.l
gcc lex.yy.c parser_semantic.tab.c main.c -o semantic
./semantic < test.mc
⚠️ Important Setting
BACKEND_MODE = 0;
✅ Output
--- Symbol Table ---
a : int
b : float

--- Three Address Code ---
t3 = a < 10
t4 = b + a
b = t4
🎤 What to Say

“I implemented semantic analysis with symbol table and generated Three Address Code using syntax-directed translation.”

👨‍💻 TEAM MEMBER 4
🔷 Role: Optimization & Code Generation Engineer
🎯 Work
Performs:
Dead Code Elimination
Constant Folding
Generates:
Optimized TAC
Pseudo Assembly Code
Handles:
Basic backend design
Register usage (R1)
📂 Files Used
parser_semantic.y
lexer.l
main.c
test.mc
⚙️ Commands to Run

(Same as Member 3)

bison -d parser_semantic.y
flex lexer.l
gcc lex.yy.c parser_semantic.tab.c main.c -o semantic
./semantic < test.mc
⚠️ Important Setting
BACKEND_MODE = 1;
✅ Output
--- Optimized TAC ---
t4 = b + a
b = t4

--- Pseudo Assembly ---
LOAD R1, b
ADD R1, a
STORE t4, R1
MOV b, t4
🎤 What to Say

“I implemented backend optimization using dead code elimination and generated pseudo assembly with simple register allocation.”

🔥 FINAL PROJECT FLOW
Source Code (.mc)
   ↓
Lexical Analysis (Flex)
   ↓
Syntax Analysis (Bison)
   ↓
Semantic Analysis
   ↓
Three Address Code
   ↓
Optimization
   ↓
Assembly Code